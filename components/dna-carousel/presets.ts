/**
 * Colour presets for the helix.
 *
 * The images carry the colour, so a preset is the room they hang in: the
 * backdrop, the tone behind an image while it loads, the fringe colours of the
 * RGB split, and how dark the cast shadows fall.
 *
 * The split pair is a warm/cool couple on purpose — a red fringe on one edge
 * and a blue one on the other is what a real lens does out of focus, so the
 * blur reads as depth of field instead of as a smudge.
 */
export const presets = {
  linen: {
    background: "#dcdad3",
    card: "#1a1a1a",
    shadow: "0, 0, 0",
    splitA: "rgba(255, 0, 70, 0.42)",
    splitB: "rgba(0, 170, 255, 0.42)",
    focus: "rgba(20, 20, 20, 0.55)",
  },

  ink: {
    background: "#0c0c0e",
    card: "#1c1c20",
    shadow: "0, 0, 0",
    splitA: "rgba(255, 40, 90, 0.5)",
    splitB: "rgba(40, 190, 255, 0.5)",
    focus: "rgba(255, 255, 255, 0.6)",
  },

  paper: {
    background: "#f6f5f2",
    card: "#e4e2dc",
    shadow: "40, 34, 24",
    splitA: "rgba(255, 60, 60, 0.36)",
    splitB: "rgba(0, 150, 255, 0.36)",
    focus: "rgba(20, 20, 20, 0.5)",
  },
};

export type DnaPreset = keyof typeof presets;
export type DnaColours = (typeof presets)["linen"];

export default presets;
