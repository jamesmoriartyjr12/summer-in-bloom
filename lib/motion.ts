/**
 * Header travel. These values are the contract in design/MOTION.md.
 * Color and the phone mark stay on the chrome snap. The bar's own move does not.
 */

export const chromeSnap = {
  duration: 0.2,
  ease: [0.2, 0.8, 0.2, 1] as const,
};

export const headerTravel = {
  /** The locked word hides the bar once it is this close to the bar's bottom edge. */
  clearance: 40,
  duration: 0.65,
  ease: [0.22, 1, 0.36, 1] as const,
};

/** Media and the card handoff. Same curve as the header travel. */
export const mediaEase = headerTravel.ease;

/** Sample a cubic-bezier ease. `t` is clamped to 0–1. */
export function sampleEase(ease: readonly [number, number, number, number], t: number) {
  const clamped = Math.max(0, Math.min(1, t));
  const [x1, y1, x2, y2] = ease;
  const at = (a: number, b: number, u: number) => {
    const v = 1 - u;
    return 3 * v * v * u * a + 3 * v * u * u * b + u * u * u;
  };
  let u = clamped;
  for (let i = 0; i < 6; i++) {
    const slope = 3 * (1 - u) * (1 - u) * x1 + 6 * (1 - u) * u * (x2 - x1) + 3 * u * u * (1 - x2);
    if (Math.abs(slope) < 1e-6) break;
    u = Math.max(0, Math.min(1, u - (at(x1, x2, u) - clamped) / slope));
  }
  return at(y1, y2, u);
}
