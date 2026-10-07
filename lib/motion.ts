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
