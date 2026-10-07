/**
 * Header travel. These values are the contract in design/MOTION.md.
 * Color and the phone mark stay on the chrome snap. The bar's own move does not.
 */

export const chromeSnap = {
  duration: 0.2,
  ease: [0.2, 0.8, 0.2, 1] as const,
};

export const headerTravel = {
  /** The bar stays while the page is inside this distance of the top. */
  hold: 150,
  /** One direction must travel this far before the bar commits. */
  intent: 24,
  duration: 0.65,
  ease: [0.22, 1, 0.36, 1] as const,
};
