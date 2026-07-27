import sharp from "sharp";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const OUT_DIR = path.join(process.cwd(), "public/Bloom Portfolio Images");
const ORIGINAL_REF = "350a9cc"; // last commit before logo crop

const FILES = [
  "Jamie_Small.png",
  "Jamie_Large.png",
  "Meridian_Small.png",
  "Meridian_Large.png",
  "WatchCheck_Small.png",
  "WatchCheck_Large.png",
  "Sunny_Small.png",
  "Sunny_Large.png",
  "Feno_Small.png",
  "Feno_Large.png",
  "TeeCommerce_Small.png",
  "TeeCommerce_Large.png",
  "Milly_Small.png",
  "Milly_Large.png",
  "Orion_Small.png",
  "Orion_Large.png",
  "FanFix_Small.png",
  "FanFix_Large.png",
];

// White logos sit in the bottom-left corner of every portfolio asset.
const DEFAULT_CROP = { left: 0.32, top: 0, width: 0.68, height: 0.84 };
// Feno subject is already centered — only trim the bottom logo band.
const FENO_CROP = { left: 0.04, top: 0, width: 0.92, height: 0.87 };

const CROP_BY_FILE = {
  "Feno_Small.png": FENO_CROP,
  "Feno_Large.png": FENO_CROP,
};

function readOriginal(file) {
  const repoPath = `public/Bloom Portfolio Images/${file}`;
  try {
    return execSync(`git show ${ORIGINAL_REF}:"${repoPath}"`, {
      cwd: process.cwd(),
      stdio: ["ignore", "pipe", "ignore"],
      maxBuffer: 20 * 1024 * 1024,
    });
  } catch {
    return null;
  }
}

async function cropLogo(input, file) {
  const crop = CROP_BY_FILE[file] ?? DEFAULT_CROP;
  const meta = await sharp(input).metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;

  const left = Math.round(w * crop.left);
  const top = Math.round(h * crop.top);
  const width = Math.round(w * crop.width);
  const height = Math.round(h * crop.height);

  return sharp(input)
    .extract({ left, top, width, height })
    .resize(w, h, { fit: "cover", position: "centre" })
    .png()
    .toBuffer();
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const file of FILES) {
    const input = readOriginal(file);
    if (!input) {
      console.warn(`skip ${file} (no original in git)`);
      continue;
    }
    const output = await cropLogo(input, file);
    fs.writeFileSync(path.join(OUT_DIR, file), output);
    console.log(`cropped ${file}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
