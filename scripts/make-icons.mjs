// Generates the PWA icons from the hero photo.
// A full-scene crop turns to grey mush at home-screen size (spec §7), so this
// crops tight on the standing figure before resizing.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SRC = "public/tkn-kb-hero.jpg";
const OUT = "public/icons";

// Fractions of the source image, framing the standing figure head-to-thigh.
const CROP = { left: 0.42, top: 0.19, width: 0.36, height: 0.36 };

const SIZES = [
  { file: "icon-192.png", size: 192 },
  { file: "icon-512.png", size: 512 },
  { file: "apple-touch-icon.png", size: 180 },
];

const meta = await sharp(SRC).metadata();
const { width: W, height: H } = meta;
console.log(`source: ${W}x${H}`);

// Square crop in source pixels, clamped to the image bounds.
const side = Math.round(Math.min(CROP.width * W, CROP.height * H));
const left = Math.max(0, Math.min(W - side, Math.round(CROP.left * W)));
const top = Math.max(0, Math.min(H - side, Math.round(CROP.top * H)));
console.log(`crop: ${side}x${side} at (${left}, ${top})`);

await mkdir(OUT, { recursive: true });

for (const { file, size } of SIZES) {
  await sharp(SRC)
    .extract({ left, top, width: side, height: side })
    .resize(size, size, { fit: "cover" })
    .png({ quality: 90 })
    .toFile(`${OUT}/${file}`);
  console.log(`wrote ${OUT}/${file} (${size}x${size})`);
}
