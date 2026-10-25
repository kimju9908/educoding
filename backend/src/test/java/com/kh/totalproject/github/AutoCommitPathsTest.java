package com.kh.totalproject.github;

import com.kh.totalproject.constant.codechallenge.enums.CodeChallengeLanguage;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

/** Pure path/naming computation (docs/github-auto-commit.md section 4) -- no
 * mocks needed, this is exactly what AutoCommitOutbox/AutoCommitJobRunner call. */
class AutoCommitPathsTest {
    @Test
    void mapsEachLanguageToItsOwnFolderAndExtension() {
        assertThat(AutoCommitPaths.languageFolder(CodeChallengeLanguage.JAVA17)).isEqualTo("java");
        assertThat(AutoCommitPaths.solutionFileName(CodeChallengeLanguage.JAVA17)).isEqualTo("solution.java");
        assertThat(AutoCommitPaths.languageFolder(CodeChallengeLanguage.PYTHON3)).isEqualTo("python");
        assertThat(AutoCommitPaths.solutionFileName(CodeChallengeLanguage.PYTHON3)).isEqualTo("solution.py");
        assertThat(AutoCommitPaths.languageFolder(CodeChallengeLanguage.NODEJS20)).isEqualTo("javascript");
        assertThat(AutoCommitPaths.languageFolder(CodeChallengeLanguage.NODEJS20ESM)).isEqualTo("javascript");
        assertThat(AutoCommitPaths.solutionFileName(CodeChallengeLanguage.NODEJS20)).isEqualTo("solution.js");
        assertThat(AutoCommitPaths.languageFolder(CodeChallengeLanguage.C11)).isEqualTo("c");
        assertThat(AutoCommitPaths.solutionFileName(CodeChallengeLanguage.C11)).isEqualTo("solution.c");
        assertThat(AutoCommitPaths.languageFolder(CodeChallengeLanguage.CPP17)).isEqualTo("cpp");
        assertThat(AutoCommitPaths.solutionFileName(CodeChallengeLanguage.CPP17)).isEqualTo("solution.cpp");
    }

    @Test
    void sameChallengeIdAlwaysProducesTheSamePathEvenIfTheTitleChanges() {
        String before = AutoCommitPaths.challengeFolder("", CodeChallengeLanguage.PYTHON3, 42, "구구단");
        String after = AutoCommitPaths.challengeFolder("", CodeChallengeLanguage.PYTHON3, 42, "구구단 (개정)");
        assertThat(before).startsWith("python/0042-");
        assertThat(after).startsWith("python/0042-");
    }

    @Test
    void challengeIdIsZeroPaddedToFourDigits() {
        assertThat(AutoCommitPaths.challengeFolder("", CodeChallengeLanguage.JAVA17, 7, "foo"))
                .isEqualTo("java/0007-foo");
        assertThat(AutoCommitPaths.challengeFolder("", CodeChallengeLanguage.JAVA17, 12345, "foo"))
                .isEqualTo("java/12345-foo");
    }

    @Test
    void basePathIsPrependedAndNormalized() {
        assertThat(AutoCommitPaths.challengeFolder("/solutions/", CodeChallengeLanguage.JAVA17, 1, "foo"))
                .isEqualTo("solutions/java/0001-foo");
    }

    @Test
    void basePathContainingDotDotIsRejected() {
        assertThatThrownBy(() -> AutoCommitPaths.normalizeBasePath("solutions/../etc"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void slugStripsFilesystemUnsafeCharactersAndPathTraversal() {
        assertThat(AutoCommitPaths.slug("a/b\\c:d*e?f\"g<h>i|j")).doesNotContain("/", "\\", ":", "*", "?", "\"", "<", ">", "|");
        assertThat(AutoCommitPaths.slug("../../etc/passwd")).doesNotContain("..");
    }

    @Test
    void slugKeepsNonAsciiTitlesInsteadOfTransliterating() {
        assertThat(AutoCommitPaths.slug("구구단")).isEqualTo("구구단");
    }

    @Test
    void slugCollapsesWhitespaceAndTrimsDashes() {
        assertThat(AutoCommitPaths.slug("  두 정수의   합  ")).isEqualTo("두-정수의-합");
    }

    @Test
    void blankOrFullyStrippedTitleFallsBackToAFixedName() {
        assertThat(AutoCommitPaths.slug(null)).isEqualTo("problem");
        assertThat(AutoCommitPaths.slug("   ")).isEqualTo("problem");
        assertThat(AutoCommitPaths.slug("///???")).isEqualTo("problem");
    }

    @Test
    void slugIsCappedAtSixtyCharacters() {
        String longTitle = "a".repeat(100);
        assertThat(AutoCommitPaths.slug(longTitle)).hasSize(60);
    }
}
