import { useEffect, type RefObject } from "react";
import { layout, prepare } from "@chenglou/pretext";

/** Reserve text height after the actual fonts load; native text still handles wrapping. */
export function usePretextLayout(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const container = root.current;
    if (!container) return;
    let active = true;
    let frame = 0;
    const prepared = new Map<HTMLElement, {
      text: string;
      font: string;
      handle: ReturnType<typeof prepare>;
    }>();
    const measure = () => {
      frame = 0;
      if (!active) return;
      const elements = container.querySelectorAll<HTMLElement>(
        ".sim-message p, .sim-pending p",
      );
      const visible = new Set(elements);
      for (const element of prepared.keys()) {
        if (!visible.has(element)) prepared.delete(element);
      }
      for (const element of elements) {
        if (element.clientWidth <= 0) continue;
        const style = getComputedStyle(element);
        const font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        const text = element.textContent ?? "";
        let cached = prepared.get(element);
        if (!cached || cached.text !== text || cached.font !== font) {
          cached = { text, font, handle: prepare(text, font) };
          prepared.set(element, cached);
        }
        const result = layout(cached.handle, element.clientWidth,
          Number.parseFloat(style.lineHeight));
        const height = `${Math.ceil(result.height)}px`;
        if (element.style.minHeight !== height) element.style.minHeight = height;
        element.dataset.pretextLines = String(result.lineCount);
      }
    };
    const schedule = () => {
      if (active && !frame) frame = requestAnimationFrame(measure);
    };
    const resize = new ResizeObserver(schedule);
    const mutation = new MutationObserver(schedule);
    void document.fonts.ready.then(() => {
      if (!active) return;
      resize.observe(container);
      mutation.observe(container, { childList: true, subtree: true, characterData: true });
      schedule();
    });
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutation.disconnect();
      for (const element of prepared.keys()) {
        element.style.removeProperty("min-height");
        delete element.dataset.pretextLines;
      }
    };
  }, [root]);
}
