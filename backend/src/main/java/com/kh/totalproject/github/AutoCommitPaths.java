package com.kh.totalproject.github;

import com.kh.totalproject.constant.codechallenge.enums.CodeChallengeLanguage;

import java.util.Map;

/** Pure path/naming computation -- no I/O, no GitHub calls, so it's exactly what
 * test_... can exercise directly. See docs/github-auto-commit.md section 4 for the
 * layout this produces: {basePath}/{language}/{challengeId:04d}-{slug}/. The server
 * (not the model) is the only thing that ever calls this. */
final class AutoCommitPaths {
    private AutoCommitPaths() {}

    private record LangInfo(String folder, String extension) {}

    private static final Map<CodeChallengeLanguage, LangInfo> LANGUAGES = Map.of(
            CodeChallengeLanguage.JAVA17, new LangInfo("java", "java"),
            CodeChallengeLanguage.PYTHON3, new LangInfo("python", "py"),
            CodeChallengeLanguage.NODEJS20, new LangInfo("javascript", "js"),
            CodeChallengeLanguage.NODEJS20ESM, new LangInfo("javascript", "js"),
            CodeChallengeLanguage.C11, new LangInfo("c", "c"),
            CodeChallengeLanguage.CPP17, new LangInfo("cpp", "cpp")
    );

    static String languageFolder(CodeChallengeLanguage language) {
        return LANGUAGES.get(language).folder();
    }

    static String solutionFileName(CodeChallengeLanguage language) {
        return "solution." + LANGUAGES.get(language).extension();
    }

    /** Characters that are unsafe in a git/filesystem path, or that could be used to
     * escape the intended directory (".."), are stripped -- not transliterated. Korean
     * and other non-ASCII titles are kept as-is: GitHub paths are UTF-8, and forcing
     * everything to ASCII would make problem folders harder to recognize, not safer. */
    static String slug(String title) {
        if (title == null) return "problem";
        String cleaned = title
                .replaceAll("[\\\\/:*?\"<>|\\x00-\\x1F]", "") // filesystem/git-unsafe characters + control chars
                .replace("..", "")
                .trim()
                .replaceAll("\\s+", "-");
        if (cleaned.length() > 60) cleaned = cleaned.substring(0, 60);
        cleaned = cleaned.replaceAll("^-+|-+$", "");
        return cleaned.isEmpty() ? "problem" : cleaned;
    }

    /** {basePath}/{language}/{challengeId:04d}-{slug} -- no trailing slash. The zero-padded
     * id prefix is what keeps this path stable (and non-colliding) even if the title
     * changes later; re-solving the same problem always resolves to the same folder. */
    static String challengeFolder(String basePath, CodeChallengeLanguage language, long challengeId, String title) {
        String normalizedBase = normalizeBasePath(basePath);
        String prefix = normalizedBase.isEmpty() ? "" : normalizedBase + "/";
        return prefix + languageFolder(language) + "/" + String.format("%04d", challengeId) + "-" + slug(title);
    }

    static String normalizeBasePath(String basePath) {
        if (basePath == null) return "";
        String trimmed = basePath.trim().replaceAll("^/+|/+$", "");
        if (trimmed.contains("..")) {
            throw new IllegalArgumentException("경로에 '..'를 포함할 수 없습니다.");
        }
        return trimmed;
    }
}
