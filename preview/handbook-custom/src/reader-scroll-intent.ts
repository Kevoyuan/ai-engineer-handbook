/**
 * Pure scroll-direction controller for the immersive Reader.
 * Chrome changes only after sustained user movement and a short dwell time.
 * CSS must not resize the scroll owner when chrome visibility changes.
 */
export type ScrollChromeState = {
  lastY: number;
  direction: -1 | 0 | 1;
  travel: number;
  visible: boolean;
  switchedAt: number;
};

export const CHROME_SCROLL = {
  topReveal: 70,
  hideDistance: 64,
  revealDistance: 104,
  cooldownMs: 450,
  noisePx: 0.8,
  jumpPx: 700,
} as const;

export function makeScrollChromeState(y = 0, visible = true): ScrollChromeState {
  return { lastY: y, direction: 0, travel: 0, visible, switchedAt: -Infinity };
}

export function resetScrollChrome(
  state: ScrollChromeState,
  y: number,
  visible: boolean,
  now: number,
): void {
  state.lastY = Math.max(0, y);
  state.direction = 0;
  state.travel = 0;
  state.visible = visible;
  state.switchedAt = now;
}

/**
 * Returns a new visibility only when a real transition is warranted.
 * null means no state change, so React doesn't rerender on every scroll tick.
 */
export function advanceScrollChrome(
  state: ScrollChromeState,
  y: number,
  now: number,
  locked = false,
): boolean | null {
  const currentY = Math.max(0, y);
  const delta = currentY - state.lastY;
  state.lastY = currentY;

  if (locked || currentY < CHROME_SCROLL.topReveal) {
    state.direction = 0;
    state.travel = 0;
    if (!state.visible) {
      state.visible = true;
      state.switchedAt = now;
      return true;
    }
    return null;
  }

  // Ignore subpixel scroll anchoring and one-off programmatic jumps.
  if (!Number.isFinite(delta) || Math.abs(delta) < CHROME_SCROLL.noisePx) return null;
  if (Math.abs(delta) > CHROME_SCROLL.jumpPx) {
    state.direction = 0;
    state.travel = 0;
    return null;
  }

  const direction: -1 | 1 = delta > 0 ? 1 : -1;
  if (direction !== state.direction) {
    state.direction = direction;
    state.travel = 0; // require a full deliberate reverse gesture
  }
  state.travel = Math.min(200, state.travel + Math.abs(delta));

  const nextVisible = direction < 0;
  const threshold = nextVisible
    ? CHROME_SCROLL.revealDistance
    : CHROME_SCROLL.hideDistance;

  if (state.visible === nextVisible) {
    state.travel = 0;
    return null;
  }
  if (state.travel < threshold || now - state.switchedAt < CHROME_SCROLL.cooldownMs)
    return null;

  state.visible = nextVisible;
  state.switchedAt = now;
  state.direction = 0;
  state.travel = 0;
  return nextVisible;
}
