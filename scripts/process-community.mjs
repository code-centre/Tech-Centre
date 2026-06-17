import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const OUT_DIR = "public/community";
const ASSETS = "/Users/anuarharb/.cursor/projects/Users-anuarharb-Hacker-Tech-Centre/assets";

// source file -> output slug + alt text
const photos = [
  ["E6614DC8-FBB5-49E2-A521-B2296E910EBE-414bd691-e117-449d-8513-723a1831ef36.png", "sesion-fca", "Sesión presencial en el centro frente a la proyección"],
  ["b5a58d5a-34e4-4248-affb-e4a2a337f8c8-9bba86a0-8ad4-4665-b9b3-e99107de634c.png", "charla-noche", "Charla nocturna al aire libre bajo el banner 'Despierta el genio tech'"],
  ["6C4F1C25-A1F7-4C49-9A12-FDE90EE69892-d337d141-5c31-4ea0-a3e3-1def5c21f40d.png", "equipo-selfie", "Estudiantes construyendo en equipo con sus laptops"],
  ["IMG_0885-cf82a2d9-ecc7-4d75-b4a2-234d719f489c.png", "audiencia-clase", "Asistentes atentos durante una clase presencial"],
  ["IMG_6230-aa06bf60-2842-468c-a403-79bc3720c4db.png", "practica-laptops", "Práctica en vivo programando sobre laptops"],
  ["IMG_0901-943ab93b-529d-4798-adbe-0d0eebe482c7.png", "comunidad-dos", "Miembros de la comunidad Tech Centre en clase"],
  ["IMG_0869-94f9b6c6-81d7-411d-88ae-e64ff3172c04.png", "manos-teclado", "Manos sobre el teclado escribiendo código"],
  ["IMG_5946-8cd2237f-be15-43c2-a9e8-fe52e703ddaf.png", "evento-aire-libre", "Evento comunitario nocturno al aire libre"],
  ["IMG_6612-204f5ca0-7024-4c40-b5bf-82a39d90c554.png", "sede-codigo-abierto", "Fachada de la sede Código Abierto en Barranquilla"],
  ["IMG_6861-8cc11eb8-f7cd-4c3a-bfeb-5d17c625174c.png", "demo-herramientas", "Demostración en vivo de herramientas de IA"],
  ["IMG_6292-b7d2a26d-3fd6-459a-8ccc-43aad7e1cbdb.png", "sesion-presencial", "Comunidad reunida en una sesión presencial"],
  ["IMG_6831-85ca5030-8109-440d-a139-aa01c0bf7780.png", "laboratorio-codigo", "Laboratorio de programación con proyección de código"],
  ["IMG_6436-c938759c-294a-453e-8fdd-56485895a7fa.png", "trabajo-datos", "Trabajando con datos reales en clase"],
];

await mkdir(OUT_DIR, { recursive: true });

const manifest = [];
for (const [file, slug, alt] of photos) {
  const out = `${slug}.webp`;
  const meta = await sharp(`${ASSETS}/${file}`)
    .rotate() // honor EXIF orientation
    .resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(`${OUT_DIR}/${out}`);
  manifest.push({ src: `/community/${out}`, alt, w: meta.width, h: meta.height });
  console.log(`✓ ${out} (${meta.width}x${meta.height}, ${(meta.size / 1024).toFixed(0)}kb)`);
}

console.log("\nMANIFEST:\n" + JSON.stringify(manifest, null, 2));
