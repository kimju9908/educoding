import React, { JSX, RefObject, useCallback, useEffect, useRef, useState } from 'react';

import {
  ScrollNavInner,
  ScrollNavMarker,
  ScrollNavProgress,
  ScrollNavProgressHead,
  ScrollNavRail,
  ScrollNavRipple,
  ScrollNavTooltip,
  ScrollNavTooltipParent,
  ScrollNavTooltipText,
  ScrollNavTrack,
} from '../../../styles/study/Study_ChapterScrollNav';

type Section = {
  label: string;
  level: 1 | 2; // 1 = 챕터, 2 = 챕터 안의 세부 항목
  parent: string | null; // 세부 항목이 속한 챕터 이름
  ratio: number; // 본문 전체 높이 대비 위치 (0~1)
  el: HTMLElement;
};

type RailLayout = {
  left: number;
  top: number;
  height: number; // 마커가 놓이는 안쪽 높이
  inset: boolean; // 본문 오른쪽 여백이 좁아 본문 안쪽에 겹쳐 놓였는지
};

type ChapterScrollNavProps = {
  scrollRef: RefObject<HTMLDivElement | null>; // 실제로 스크롤되는 영역 (Layout의 MainContent)
  contentRef: RefObject<HTMLDivElement | null>; // 본문 영역 (RightContainer)
  onInsetChange?: (inset: boolean) => void;
  // 트랙에 표시할 요소 (기본값: 강의 상세 페이지의 챕터/소제목)
  headingSelector?: string;
  // 이 id를 가진 요소는 챕터, 나머지는 세부 항목으로 표시
  chapterIds?: string[];
};

const DEFAULT_HEADING_SELECTOR = '[id="classcontentstitle1"], [id="classcontentstitle2"]';
const DEFAULT_CHAPTER_IDS = ['classcontentstitle1'];
const RAIL_WIDTH = 44;
const RAIL_PADDING = 14; // 캡슐 위아래 여백 (styles의 padding과 같은 값)
const GUTTER_MIN_SPACE = RAIL_WIDTH + 36; // 본문 오른쪽 여백이 이보다 넓으면 여백에 배치
// Dock 효과: 마우스 주변 MAGNIFY_RANGE(px) 안의 마커가 길어짐
const MAGNIFY_RANGE = 44;
const BASE_WIDTH = { 1: 14, 2: 7 } as const;
const MAX_WIDTH = { 1: 28, 2: 20 } as const;
const CHAPTER_PICK_BONUS = 4; // 챕터와 세부 항목이 겹칠 때 챕터를 조금 더 잘 잡히게

const Languages_ChapterScrollNav = ({
  scrollRef,
  contentRef,
  onInsetChange,
  headingSelector = DEFAULT_HEADING_SELECTOR,
  chapterIds = DEFAULT_CHAPTER_IDS,
}: ChapterScrollNavProps): JSX.Element | null => {
  const [sections, setSections] = useState<Section[]>([]);
  const [layout, setLayout] = useState<RailLayout | null>(null);
  const [progress, setProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [pointerY, setPointerY] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState(-1);
  const [ripples, setRipples] = useState<{ id: number; y: number }[]>([]);
  const frameRef = useRef<number | null>(null);

  const measure = useCallback((): void => {
    const root = contentRef.current;
    const scroller = scrollRef.current;
    if (!root || !scroller) return;

    const rootRect = root.getBoundingClientRect();
    const scrollerRect = scroller.getBoundingClientRect();
    const total = root.offsetHeight || 1;

    // 접힌 챕터 안의 항목(display: none)은 offsetParent가 null이라 자동으로 빠짐
    let currentChapter: string | null = null;
    const found: Section[] = Array.from(root.querySelectorAll<HTMLElement>(headingSelector))
      .filter((el) => el.offsetParent !== null && el.textContent?.trim())
      .map((el) => {
        const label = (el.textContent ?? '').trim();
        const level = chapterIds.includes(el.id) ? 1 : 2;
        if (level === 1) currentChapter = label;
        return {
          label,
          level,
          parent: level === 2 ? currentChapter : null,
          ratio: Math.min(Math.max((el.getBoundingClientRect().top - rootRect.top) / total, 0), 1),
          el,
        };
      });
    // 챕터 제목이 없는 강의는 소제목을 챕터로 취급
    const normalized = found.some((s) => s.level === 1)
      ? found
      : found.map((s) => ({ ...s, level: 1 as const, parent: null }));
    setSections(normalized);

    // 본문 오른쪽 여백이 넉넉하면 여백에, 아니면 본문 오른쪽 끝 안쪽에
    const inset = window.innerWidth - rootRect.right < GUTTER_MIN_SPACE;
    const top = scrollerRect.top + 20;
    const outerHeight = Math.max(window.innerHeight - top - 110, 160);
    setLayout({
      left: inset ? rootRect.right - RAIL_WIDTH - 8 : rootRect.right + 18,
      top,
      height: outerHeight - RAIL_PADDING * 2,
      inset,
    });

    // 읽고 있는 위치 = 화면 세로 가운데 (클릭 시 항목을 가운데로 옮기므로 기준을 맞춤)
    const readingLine = scrollerRect.top + scroller.clientHeight / 2;
    setProgress(Math.min(Math.max((readingLine - rootRect.top) / total, 0), 1));

    // 화면 가운데를 지난 마지막 챕터를 현재 챕터로
    let current = -1;
    normalized.forEach((s, i) => {
      if (s.level === 1 && s.el.getBoundingClientRect().top <= readingLine + 4) current = i;
    });
    setActiveIndex(current);
  }, [contentRef, scrollRef, headingSelector, chapterIds]);

  const scheduleMeasure = useCallback((): void => {
    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      measure();
    });
  }, [measure]);

  useEffect(() => {
    const root = contentRef.current;
    const scroller = scrollRef.current;
    if (!root || !scroller) return undefined;

    scheduleMeasure();
    scroller.addEventListener('scroll', scheduleMeasure, { passive: true });
    window.addEventListener('resize', scheduleMeasure);
    // 내용이 비동기로 로드되거나 챕터를 접고 펼치면 높이가 바뀌므로 다시 계산
    const resizeObserver = new ResizeObserver(scheduleMeasure);
    resizeObserver.observe(root);
    const mutationObserver = new MutationObserver(scheduleMeasure);
    mutationObserver.observe(root, { childList: true, subtree: true });

    return (): void => {
      scroller.removeEventListener('scroll', scheduleMeasure);
      window.removeEventListener('resize', scheduleMeasure);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [contentRef, scrollRef, scheduleMeasure]);

  useEffect(() => {
    if (layout) onInsetChange?.(layout.inset);
  }, [layout?.inset, onInsetChange]);

  if (!layout || sections.length === 0) return null;

  const markerY = (s: Section): number => s.ratio * layout.height;

  const nearestIndex = (y: number): number => {
    let best = -1;
    let bestDist = Infinity;
    sections.forEach((s, i) => {
      const dist = Math.abs(markerY(s) - y) - (s.level === 1 ? CHAPTER_PICK_BONUS : 0);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    return best;
  };

  const scrollToSection = (index: number): void => {
    const scroller = scrollRef.current;
    const target = sections[index as number];
    if (!scroller || !target) return;
    // 클릭한 항목이 화면 세로 가운데에 오도록
    const elRect = target.el.getBoundingClientRect();
    const delta = elRect.top - scroller.getBoundingClientRect().top;
    const centerOffset = scroller.clientHeight / 2 - elRect.height / 2;
    scroller.scrollTo({ top: scroller.scrollTop + delta - centerOffset, behavior: 'smooth' });
  };

  const localY = (e: React.MouseEvent<HTMLElement>): number =>
    e.clientY - layout.top - RAIL_PADDING;

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>): void => {
    const y = localY(e);
    setPointerY(y);
    setHoverIndex(nearestIndex(y));
  };

  const handleMouseLeave = (): void => {
    setPointerY(null);
    setHoverIndex(-1);
  };

  const handleClick = (e: React.MouseEvent<HTMLElement>): void => {
    const index = nearestIndex(localY(e));
    if (index < 0) return;
    const id = Date.now();
    setRipples((prev) => [...prev, { id, y: markerY(sections[index as number]) }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 500);
    scrollToSection(index);
  };

  // Dock 효과: 마우스와 가까울수록 길게 (smoothstep 곡선)
  const markerWidth = (s: Section): number => {
    const base = BASE_WIDTH[s.level];
    if (pointerY === null) return base;
    const t = Math.max(0, 1 - Math.abs(markerY(s) - pointerY) / MAGNIFY_RANGE);
    const eased = t * t * (3 - 2 * t);
    return base + (MAX_WIDTH[s.level] - base) * eased;
  };

  const hovered = hoverIndex >= 0 ? sections[hoverIndex as number] : null;
  const progressY = progress * layout.height;

  return (
    <ScrollNavRail
      aria-label="챕터 바로가기"
      style={{ left: layout.left, top: layout.top, height: layout.height + RAIL_PADDING * 2 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <ScrollNavInner>
        <ScrollNavTrack />
        <ScrollNavProgress style={{ height: progressY }} />
        <ScrollNavProgressHead style={{ top: progressY }} />
        {sections.map((s, i) => (
          <ScrollNavMarker
            key={`${s.label}-${i}`}
            type="button"
            tabIndex={s.level === 1 ? 0 : -1}
            aria-label={`${s.label}(으)로 이동`}
            $level={s.level}
            $active={i === activeIndex}
            $hovered={i === hoverIndex}
            style={{ top: markerY(s), width: markerWidth(s) }}
            onFocus={() => setHoverIndex(i)}
            onBlur={() => setHoverIndex(-1)}
            onClick={(e) => {
              // 키보드(Enter)로 누른 경우만 여기로 옴 (마우스 클릭은 패널이 처리)
              e.stopPropagation();
              scrollToSection(i);
            }}
          />
        ))}
        {ripples.map((r) => (
          <ScrollNavRipple key={r.id} style={{ top: r.y }} />
        ))}
        {hovered ? (
          <ScrollNavTooltip
            key={hoverIndex}
            $level={hovered.level}
            style={{ top: markerY(hovered) }}
          >
            {hovered.level === 2 && hovered.parent ? (
              <ScrollNavTooltipParent>{hovered.parent} ›</ScrollNavTooltipParent>
            ) : null}
            <ScrollNavTooltipText>{hovered.label}</ScrollNavTooltipText>
          </ScrollNavTooltip>
        ) : null}
      </ScrollNavInner>
    </ScrollNavRail>
  );
};

export default Languages_ChapterScrollNav;
