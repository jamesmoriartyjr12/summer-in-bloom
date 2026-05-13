# Public assets

Drop the following files in this directory before running:

- `hero.mp4` — looping video background for the Hero section
- `hero-poster.jpg` — optional poster frame shown before the video loads

For production, also download the Figma image assets and add them here:

- `fund-details-image.jpg` — the motion-blur image in the Fund Details section
- `fund-thesis-background.jpg` — the blurred background image in Fund Thesis

Then update the image constants in `components/sections/FundDetails.tsx` and `FundThesis.tsx` to point at the local paths.
