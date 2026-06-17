import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const OUT_DIR = "public/illustrations";

const jobs = [
  {
    in: "/Users/anuarharb/.cursor/projects/Users-anuarharb-Hacker-Tech-Centre/assets/Captura_de_pantalla_2026-06-17_a_la_s__2.40.14_a._m.-e85d1f05-9c1c-4d86-9bda-529759c36b14.png",
    out: "sticker-ring-hand.png",
  },
  {
    in: "/Users/anuarharb/.cursor/projects/Users-anuarharb-Hacker-Tech-Centre/assets/Captura_de_pantalla_2026-06-17_a_la_s__2.40.25_a._m.-d0a06802-91d9-4aab-85ff-82c044d753d2.png",
    out: "sticker-keyboard.png",
  },
  {
    in: "/Users/anuarharb/.cursor/projects/Users-anuarharb-Hacker-Tech-Centre/assets/Captura_de_pantalla_2026-06-17_a_la_s__2.40.33_a._m.-54da10c8-cb69-4aa9-82a1-7e07fded795a.png",
    out: "sticker-hands-loop.png",
  },
];

// Pixel is "background white" if all channels are near 255.
const WHITE = 236;

async function processOne({ in: input, out }) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const visited = new Uint8Array(width * height);
  const isWhite = (p) => {
    const o = p * channels;
    return data[o] >= WHITE && data[o + 1] >= WHITE && data[o + 2] >= WHITE;
  };

  // BFS flood fill from every border pixel through connected white regions.
  const stack = [];
  for (let x = 0; x < width; x++) {
    stack.push(x); // top row
    stack.push((height - 1) * width + x); // bottom row
  }
  for (let y = 0; y < height; y++) {
    stack.push(y * width); // left col
    stack.push(y * width + (width - 1)); // right col
  }

  let cleared = 0;
  while (stack.length) {
    const p = stack.pop();
    if (visited[p]) continue;
    visited[p] = 1;
    if (!isWhite(p)) continue;
    data[p * channels + 3] = 0; // transparent
    cleared++;
    const x = p % width;
    const y = (p - x) / width;
    if (x > 0) stack.push(p - 1);
    if (x < width - 1) stack.push(p + 1);
    if (y > 0) stack.push(p - width);
    if (y < height - 1) stack.push(p + width);
  }

  await sharp(data, { raw: { width, height, channels } })
    .png()
    .trim({ threshold: 0 }) // crop fully transparent margins
    .toFile(`${OUT_DIR}/${out}`);

  console.log(`✓ ${out} — ${cleared} px transparentados (${width}x${height})`);
}

await mkdir(OUT_DIR, { recursive: true });
for (const job of jobs) await processOne(job);
console.log("Listo.");
