"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type BrandReviewStickySidebarProps = {
  children: ReactNode;
};

type PanelStyle = {
  position: "fixed";
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  zIndex: number;
};

function getPinnedTopOffset(): number {
  const header = document.querySelector<HTMLElement>(
    '[data-dashboard="admin"] header',
  );
  const headerBottom = header?.getBoundingClientRect().bottom ?? 64;
  return headerBottom + 16;
}

/**
 * Keeps review actions pinned on the right, aligned below the admin topbar (xl+).
 */
export function BrandReviewStickySidebar({
  children,
}: BrandReviewStickySidebarProps) {
  const placeholderRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelStyle, setPanelStyle] = useState<PanelStyle | null>(null);

  useEffect(() => {
    const placeholder = placeholderRef.current;
    const panel = panelRef.current;
    if (!placeholder || !panel) return;

    const main = placeholder.closest("main");

    const sync = () => {
      if (window.innerWidth < 1280) {
        placeholder.style.minHeight = "";
        setPanelStyle(null);
        return;
      }

      const topOffset = getPinnedTopOffset();
      const panelHeight = panel.offsetHeight;
      placeholder.style.minHeight = `${panelHeight}px`;

      const rect = placeholder.getBoundingClientRect();
      const maxHeight = window.innerHeight - topOffset - 16;

      if (rect.top > topOffset) {
        setPanelStyle(null);
        return;
      }

      let top = topOffset;
      const bottomLimit = rect.bottom - Math.min(panelHeight, maxHeight);
      if (bottomLimit < topOffset) {
        top = bottomLimit;
      }

      setPanelStyle({
        position: "fixed",
        top,
        left: rect.left,
        width: rect.width,
        maxHeight,
        zIndex: 20,
      });
    };

    sync();

    const scrollTarget = main ?? window;
    scrollTarget.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", sync);

    const ro = new ResizeObserver(sync);
    ro.observe(placeholder);
    ro.observe(panel);
    if (main) ro.observe(main);

    const header = document.querySelector<HTMLElement>(
      '[data-dashboard="admin"] header',
    );
    if (header) ro.observe(header);

    return () => {
      scrollTarget.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", sync);
      ro.disconnect();
      placeholder.style.minHeight = "";
    };
  }, []);

  const fixedStyles: CSSProperties | undefined = panelStyle
    ? {
        position: panelStyle.position,
        top: panelStyle.top,
        left: panelStyle.left,
        width: panelStyle.width,
        maxHeight: panelStyle.maxHeight,
        zIndex: panelStyle.zIndex,
        overflowY: "auto",
      }
    : undefined;

  return (
    <div ref={placeholderRef} className="xl:col-span-2">
      <div
        ref={panelRef}
        className="space-y-6"
        style={fixedStyles}
      >
        {children}
      </div>
    </div>
  );
}
