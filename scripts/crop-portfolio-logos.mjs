import sharp from "sharp";
import fs from "fs";
import path from "path";

const BASE_URL =
  "https://summer-in-bloom-git-main-jamesmoriartyjr12s-projects.vercel.app/Bloom%20Portfolio%20Images";
const OUT_DIR = path.join(process.cwd(), "public/Bloom Portfolio Images");

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
  "OuterProduct_Small.png",
  "OuterProduct_Large.png",
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
const CROP = { left: 0.24, top: 0, width: 0.76, height: 0.86 };

async function cropLogo(input) {
  const meta = await sharp(input).metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;

  const left = Math.round(w * CROP.left);
  const top = Math.round(h * CROP.top);
  const width = Math.round(w * CROP.width);
  const height = Math.round(h * CROP.height);

  return sharp(input)
    .extract({ left, top, width, height })
    .resize(w, h, { fit: "cover", position: "centre" })
    .png()
    .toBuffer();
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const file of FILES) {
    const url = `${BASE_URL}/${file}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`skip ${file} (${res.status})`);
      continue;
    }
    const input = Buffer.from(await res.arrayBuffer());
    const output = await cropLogo(input);
    fs.writeFileSync(path.join(OUT_DIR, file), output);
    console.log(`cropped ${file}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
