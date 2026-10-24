import { JSX, useCallback, useEffect, useState } from 'react';

import { useOutletContext } from 'react-router-dom';

import type { OutletContextType } from '../../AdminType';
import type { StudyChapter } from '../../../../../api/AxiosApi/StudyApi/StudyApiType';

import StudyApi, { getStudyApiErrorMessage } from '../../../../../api/AxiosApi/StudyApi/StudyApi';
import {
  ActionRow,
  Badge,
  Button,
  ChapterCard,
  ChapterHead,
  ChapterHeadTitle,
  EditorBody,
  EditorPanel,
  EditorTitle,
  Field,
  FieldRow,
  HelpText,
  Input,
  LanguageTab,
  LanguageTabs,
  LessonLabel,
  LessonRow,
  MarkdownTextarea,
  Message,
  PreviewBox,
  Select,
  Toolbar,
  ViewToggle,
  ViewToggleButton,
} from '../../../../styles/admin/Admin_Study';
import { Wrap, Container, LeftContainer, RightContainer } from '../../../../styles/admin/Admin_Main';
import { PageTitleBar } from '../../../../styles/study/Study_Main';
import Languages_LessonMarkdown from '../../../study/components/Languages_LessonMarkdown';
import { invalidateStudyChapters } from '../../../study/useStudyChapters';
import LeftMenus from '../../components/LeftMenus';
import LeftTopProfile from '../../components/LeftTopProfile';

const LANGUAGES = [
  { key: 'java', name: 'Java' },
  { key: 'python', name: 'Python' },
  { key: 'c', name: 'C' },
  { key: 'cplus', name: 'C++' },
  { key: 'javascript', name: 'JavaScript' },
];

type LessonForm = {
  chapterId: number;
  lessonKey: string;
  label: string;
  sortOrder: string;
  content: string;
};

type ChapterForm = {
  chapterKey: string;
  title: string;
  sortOrder: string;
};

type Editor =
  | { kind: 'lesson'; lessonId: number | null; form: LessonForm; saved: LessonForm }
  | { kind: 'chapter'; chapterId: number | null; form: ChapterForm; saved: ChapterForm };

type ViewMode = 'edit' | 'split' | 'preview';

const pad2 = (n: number): string => String(n).padStart(2, '0');
const nextKey = (keys: string[]): string =>
  pad2(keys.reduce((max, k) => Math.max(max, Number(k) || 0), 0) + 1);
const lessonTitle = (label: string): string => label.replace(/^\s*\d+\.\s*/, '');

const Admin_Study = (): JSX.Element => {
  const mainContentRef = useOutletContext<OutletContextType>();
  const [language, setLanguage] = useState('java');
  const [chapters, setChapters] = useState<StudyChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [openChapters, setOpenChapters] = useState<Set<number>>(new Set());
  const [editor, setEditor] = useState<Editor | null>(null);
  const [view, setView] = useState<ViewMode>('split');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  const isDirty =
    editor !== null && JSON.stringify(editor.form) !== JSON.stringify(editor.saved);

  const scrollTop = (): void => mainContentRef?.current?.scrollTo({ top: 0, behavior: 'smooth' });

  const loadChapters = useCallback(async (lang: string): Promise<void> => {
    setLoading(true);
    try {
      setChapters(await StudyApi.getChapters(lang));
    } catch (error) {
      setMessage({ text: getStudyApiErrorMessage(error, '챕터 목록을 불러오지 못했어요.'), error: true });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChapters(language);
  }, [language, loadChapters]);

  // 수정 내용이 있는데 다른 곳으로 옮기려 하면 한 번 확인
  const confirmLeave = (): boolean =>
    !isDirty || window.confirm('저장하지 않은 변경 내용이 있어요. 버리고 이동할까요?');

  const afterChange = async (text: string): Promise<void> => {
    invalidateStudyChapters(language); // 강의 페이지가 새 목록을 다시 불러오도록
    await loadChapters(language);
    setMessage({ text, error: false });
  };

  // ── 언어 / 챕터 펼치기 ──
  const handleLanguage = (lang: string): void => {
    if (lang === language || !confirmLeave()) return;
    setEditor(null);
    setMessage(null);
    setOpenChapters(new Set());
    setLanguage(lang);
  };

  const toggleChapter = (chapterId: number): void => {
    setOpenChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) next.delete(chapterId);
      else next.add(chapterId);
      return next;
    });
  };

  // ── 강의 ──
  const openLesson = async (lessonId: number): Promise<void> => {
    if (!confirmLeave()) return;
    setMessage(null);
    try {
      const lesson = await StudyApi.getLessonById(lessonId);
      const form: LessonForm = {
        chapterId: lesson.chapterId,
        lessonKey: lesson.lessonKey,
        label: lesson.label,
        sortOrder: String(lesson.sortOrder),
        content: lesson.content,
      };
      setEditor({ kind: 'lesson', lessonId, form, saved: form });
      scrollTop();
    } catch (error) {
      setMessage({ text: getStudyApiErrorMessage(error, '강의를 불러오지 못했어요.'), error: true });
    }
  };

  const newLesson = (chapter: StudyChapter): void => {
    if (!confirmLeave()) return;
    const key = nextKey(chapter.contents.map((l) => l.lessonKey));
    const form: LessonForm = {
      chapterId: chapter.chapterId,
      lessonKey: key,
      label: `${key}. `,
      sortOrder: String(chapter.contents.length + 1),
      content: '',
    };
    setEditor({ kind: 'lesson', lessonId: null, form, saved: form });
    setMessage(null);
    scrollTop();
  };

  const saveLesson = async (): Promise<void> => {
    if (editor?.kind !== 'lesson' || saving) return;
    const { form } = editor;
    const request = {
      chapterId: form.chapterId,
      lessonKey: form.lessonKey.trim(),
      label: form.label.trim(),
      sortOrder: form.sortOrder ? Number(form.sortOrder) : undefined,
      content: form.content,
    };
    setSaving(true);
    try {
      const saved =
        editor.lessonId === null
          ? await StudyApi.createLesson(request)
          : await StudyApi.updateLesson(editor.lessonId, request);
      const savedForm: LessonForm = { ...form, sortOrder: String(saved.sortOrder) };
      setEditor({ kind: 'lesson', lessonId: saved.lessonId, form: savedForm, saved: savedForm });
      setOpenChapters((prev) => new Set(prev).add(saved.chapterId));
      await afterChange(editor.lessonId === null ? '강의를 추가했어요.' : '저장했어요.');
    } catch (error) {
      setMessage({ text: getStudyApiErrorMessage(error, '저장하지 못했어요.'), error: true });
    } finally {
      setSaving(false);
    }
  };

  const deleteLesson = async (): Promise<void> => {
    if (editor?.kind !== 'lesson' || editor.lessonId === null) return;
    if (!window.confirm(`"${editor.saved.label}" 강의를 삭제할까요? 되돌릴 수 없어요.`)) return;
    try {
      await StudyApi.deleteLesson(editor.lessonId);
      setEditor(null);
      await afterChange('강의를 삭제했어요.');
    } catch (error) {
      setMessage({ text: getStudyApiErrorMessage(error, '삭제하지 못했어요.'), error: true });
    }
  };

  // ── 챕터 ──
  const editChapter = (chapter: StudyChapter | null): void => {
    if (!confirmLeave()) return;
    const form: ChapterForm = chapter
      ? { chapterKey: chapter.id, title: chapter.title, sortOrder: String(chapter.sortOrder) }
      : (() => {
          const key = nextKey(chapters.map((c) => c.id));
          return { chapterKey: key, title: `${key}. `, sortOrder: String(chapters.length + 1) };
        })();
    setEditor({ kind: 'chapter', chapterId: chapter?.chapterId ?? null, form, saved: form });
    setMessage(null);
    scrollTop();
  };

  const saveChapter = async (): Promise<void> => {
    if (editor?.kind !== 'chapter' || saving) return;
    const { form } = editor;
    const request = {
      language,
      chapterKey: form.chapterKey.trim(),
      title: form.title.trim(),
      sortOrder: form.sortOrder ? Number(form.sortOrder) : undefined,
    };
    setSaving(true);
    try {
      const saved =
        editor.chapterId === null
          ? await StudyApi.createChapter(request)
          : await StudyApi.updateChapter(editor.chapterId, request);
      setEditor(null);
      setOpenChapters((prev) => new Set(prev).add(saved.chapterId));
      await afterChange(editor.chapterId === null ? '챕터를 추가했어요.' : '챕터를 수정했어요.');
    } catch (error) {
      setMessage({ text: getStudyApiErrorMessage(error, '저장하지 못했어요.'), error: true });
    } finally {
      setSaving(false);
    }
  };

  const deleteChapter = async (): Promise<void> => {
    if (editor?.kind !== 'chapter' || editor.chapterId === null) return;
    const chapter = chapters.find((c) => c.chapterId === editor.chapterId);
    const count = chapter?.contents.length ?? 0;
    if (
      !window.confirm(
        `"${editor.saved.title}" 챕터를 삭제할까요?\n안에 있는 강의 ${count}편도 함께 삭제되고 되돌릴 수 없어요.`,
      )
    )
      return;
    try {
      await StudyApi.deleteChapter(editor.chapterId);
      setEditor(null);
      await afterChange('챕터를 삭제했어요.');
    } catch (error) {
      setMessage({ text: getStudyApiErrorMessage(error, '삭제하지 못했어요.'), error: true });
    }
  };

  const updateLessonForm = (patch: Partial<LessonForm>): void =>
    setEditor((prev) =>
      prev?.kind === 'lesson' ? { ...prev, form: { ...prev.form, ...patch } } : prev,
    );
  const updateChapterForm = (patch: Partial<ChapterForm>): void =>
    setEditor((prev) =>
      prev?.kind === 'chapter' ? { ...prev, form: { ...prev.form, ...patch } } : prev,
    );

  // Cmd/Ctrl + S 로 저장
  const handleEditorKeyDown = (e: React.KeyboardEvent): void => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      if (editor?.kind === 'lesson') saveLesson();
      else saveChapter();
    }
  };

  const lessonChapter =
    editor?.kind === 'lesson' ? chapters.find((c) => c.chapterId === editor.form.chapterId) : undefined;
  const viewUrl =
    editor?.kind === 'lesson' && editor.lessonId !== null && lessonChapter
      ? `/study/${language}/${lessonChapter.id}/${editor.saved.lessonKey}`
      : null;
  const lessonCount = chapters.reduce((n, c) => n + c.contents.length, 0);
  const emptyCount = chapters.reduce((n, c) => n + c.contents.filter((l) => !l.hasContent).length, 0);

  const renderEditor = (): JSX.Element | null => {
    if (!editor) return null;

    if (editor.kind === 'chapter') {
      const { form } = editor;
      return (
        <EditorPanel onKeyDown={handleEditorKeyDown}>
          <EditorTitle>
            {editor.chapterId === null ? '새 챕터' : '챕터 수정'}
            {isDirty ? <Badge $empty>수정됨</Badge> : null}
          </EditorTitle>
          <FieldRow style={{ gridTemplateColumns: '0.6fr 3fr 0.6fr' }}>
            <Field>
              번호 (URL)
              <Input
                value={form.chapterKey}
                onChange={(e) => updateChapterForm({ chapterKey: e.target.value })}
                placeholder="01"
              />
            </Field>
            <Field>
              챕터 제목
              <Input
                value={form.title}
                onChange={(e) => updateChapterForm({ title: e.target.value })}
                placeholder="01. Java 시작"
              />
            </Field>
            <Field>
              순서
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => updateChapterForm({ sortOrder: e.target.value })}
              />
            </Field>
          </FieldRow>
          <ActionRow>
            <div>
              {editor.chapterId !== null ? (
                <Button type="button" $variant="danger" onClick={deleteChapter}>
                  챕터 삭제
                </Button>
              ) : null}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button type="button" onClick={() => confirmLeave() && setEditor(null)}>
                닫기
              </Button>
              <Button type="button" $variant="primary" disabled={saving} onClick={saveChapter}>
                {saving ? '저장 중…' : '저장'}
              </Button>
            </div>
          </ActionRow>
        </EditorPanel>
      );
    }

    const { form } = editor;
    return (
      <EditorPanel onKeyDown={handleEditorKeyDown}>
        <EditorTitle>
          <span>
            {editor.lessonId === null ? '새 강의' : '강의 편집'}{' '}
            {isDirty ? <Badge $empty>수정됨</Badge> : null}
          </span>
          <ViewToggle>
            {(
              [
                ['edit', '편집'],
                ['split', '나란히'],
                ['preview', '미리보기'],
              ] as const
            ).map(([mode, label]) => (
              <ViewToggleButton
                key={mode}
                type="button"
                $active={view === mode}
                onClick={() => setView(mode)}
              >
                {label}
              </ViewToggleButton>
            ))}
          </ViewToggle>
        </EditorTitle>
        <FieldRow>
          <Field>
            챕터
            <Select
              value={form.chapterId}
              onChange={(e) => updateLessonForm({ chapterId: Number(e.target.value) })}
            >
              {chapters.map((c) => (
                <option key={c.chapterId} value={c.chapterId}>
                  {c.title}
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            번호 (URL)
            <Input
              value={form.lessonKey}
              onChange={(e) => updateLessonForm({ lessonKey: e.target.value })}
              placeholder="01"
            />
          </Field>
          <Field>
            강의 이름
            <Input
              value={form.label}
              onChange={(e) => updateLessonForm({ label: e.target.value })}
              placeholder="01. 변수와 자료형"
            />
          </Field>
          <Field>
            순서
            <Input
              type="number"
              value={form.sortOrder}
              onChange={(e) => updateLessonForm({ sortOrder: e.target.value })}
            />
          </Field>
        </FieldRow>
        <EditorBody $split={view === 'split'}>
          {view !== 'preview' ? (
            <MarkdownTextarea
              value={form.content}
              onChange={(e) => updateLessonForm({ content: e.target.value })}
              placeholder={'## 챕터 제목\n\n본문을 입력하세요.\n\n```java\nSystem.out.println("Hello");\n```'}
              spellCheck={false}
            />
          ) : null}
          {view !== 'edit' ? (
            <PreviewBox>
              <Languages_LessonMarkdown title={lessonTitle(form.label)} content={form.content} />
            </PreviewBox>
          ) : null}
        </EditorBody>
        <HelpText>
          <code>##</code> 큰 제목(오른쪽 내비게이터에 챕터로 표시) · <code>###</code> 소제목 ·{' '}
          <code>####</code> 작은 제목 · <code>**굵게**</code> · <code>`코드`</code> · <code>```java</code>{' '}
          코드 블록 · <code>&gt;</code> 안내 박스 · <code>![](/images/...)</code> 이미지 ·{' '}
          <code>| 표 |</code> · 줄바꿈은 그대로 반영 · 본문을 비워 두면 "준비 중"으로 표시돼요 · 저장:
          Cmd/Ctrl + S
        </HelpText>
        <ActionRow>
          <div style={{ display: 'flex', gap: 8 }}>
            {editor.lessonId !== null ? (
              <Button type="button" $variant="danger" onClick={deleteLesson}>
                강의 삭제
              </Button>
            ) : null}
            {viewUrl ? (
              <Button type="button" onClick={() => window.open(viewUrl, '_blank')}>
                강의 페이지에서 보기 ↗
              </Button>
            ) : null}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button type="button" onClick={() => confirmLeave() && setEditor(null)}>
              닫기
            </Button>
            <Button type="button" $variant="primary" disabled={saving} onClick={saveLesson}>
              {saving ? '저장 중…' : '저장'}
            </Button>
          </div>
        </ActionRow>
      </EditorPanel>
    );
  };

  return (
    <Wrap>
      <Container>
        <LeftContainer>
          <LeftTopProfile />
          <LeftMenus />
        </LeftContainer>
        <RightContainer>
          <PageTitleBar>강의 관리</PageTitleBar>
          <LanguageTabs>
            {LANGUAGES.map((l) => (
              <LanguageTab
                key={l.key}
                type="button"
                $active={language === l.key}
                onClick={() => handleLanguage(l.key)}
              >
                {l.name}
              </LanguageTab>
            ))}
          </LanguageTabs>

          {message ? (
            <div style={{ padding: '12px 15px 0' }}>
              <Message $error={message.error}>{message.text}</Message>
            </div>
          ) : null}

          <div style={{ paddingTop: 12 }}>{renderEditor()}</div>

          <Toolbar>
            <span>
              {loading
                ? '불러오는 중…'
                : `챕터 ${chapters.length}개 · 강의 ${lessonCount}편 (준비 중 ${emptyCount}편)`}
            </span>
            <Button type="button" $variant="primary" onClick={() => editChapter(null)}>
              + 챕터 추가
            </Button>
          </Toolbar>

          {chapters.map((chapter) => {
            const open = openChapters.has(chapter.chapterId);
            return (
              <ChapterCard key={chapter.chapterId}>
                <ChapterHead onClick={() => toggleChapter(chapter.chapterId)}>
                  <span>{open ? '▾' : '▸'}</span>
                  <ChapterHeadTitle>{chapter.title}</ChapterHeadTitle>
                  <Badge $empty={false}>{chapter.contents.length}편</Badge>
                  <Button
                    type="button"
                    style={{ color: '#fff' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      editChapter(chapter);
                    }}
                  >
                    수정
                  </Button>
                  <Button
                    type="button"
                    style={{ color: '#fff' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      newLesson(chapter);
                    }}
                  >
                    + 강의
                  </Button>
                </ChapterHead>
                {open
                  ? chapter.contents.map((lesson) => (
                      <LessonRow
                        key={lesson.lessonId}
                        $selected={editor?.kind === 'lesson' && editor.lessonId === lesson.lessonId}
                        onClick={() => openLesson(lesson.lessonId)}
                      >
                        <LessonLabel>{lesson.label}</LessonLabel>
                        {!lesson.hasContent ? <Badge $empty>준비 중</Badge> : null}
                      </LessonRow>
                    ))
                  : null}
              </ChapterCard>
            );
          })}
        </RightContainer>
      </Container>
    </Wrap>
  );
};

export default Admin_Study;
