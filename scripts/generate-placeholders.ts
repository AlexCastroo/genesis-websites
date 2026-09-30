/**
 * Generates neutral placeholder images. Run once per new project, then replace them with brand assets:
 *   pnpm tsx scripts/generate-placeholders.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = new URL('..', import.meta.url);
const out = (path: string) => fileURLToPath(new URL(path, root));

const mark = (size: number) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0a0a0a"/><circle cx="32" cy="32" r="12" fill="#b91c1c"/></svg>`,
  );

const scene = (width: number, height: number) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect width="100%" height="100%" fill="#f4f4f5"/>
      <circle cx="${width * 0.72}" cy="${height * 0.42}" r="${height * 0.28}" fill="#e4e4e7"/>
      <rect x="${width * 0.08}" y="${height * 0.3}" width="${width * 0.4}" height="${height * 0.08}" rx="8" fill="#0a0a0a"/>
      <rect x="${width * 0.08}" y="${height * 0.45}" width="${width * 0.3}" height="${height * 0.04}" rx="6" fill="#a1a1aa"/>
      <rect x="0" y="${height - 16}" width="${width}" height="16" fill="#b91c1c"/>
    </svg>`,
  );

/** Wraps a PNG in a single-image .ico container (PNG-in-ICO is supported by all modern browsers). */
function pngToIco(png: Buffer, size: number): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size, 0);
  entry.writeUInt8(size, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(header.length + entry.length, 12);
  return Buffer.concat([header, entry, png]);
}

mkdirSync(out('src/assets/'), { recursive: true });
mkdirSync(out('public/'), { recursive: true });

await sharp(scene(1600, 1067)).jpeg({ quality: 80 }).toFile(out('src/assets/hero.jpg'));
await sharp(scene(1200, 630)).jpeg({ quality: 85 }).toFile(out('public/og-default.jpg'));
await sharp(mark(512)).png().toFile(out('public/logo.png'));
await sharp(mark(180)).flatten({ background: '#ffffff' }).png().toFile(out('public/apple-touch-icon.png'));
writeFileSync(out('public/favicon.ico'), pngToIco(await sharp(mark(32)).png().toBuffer(), 32));

console.log(
  'Placeholders written: src/assets/hero.jpg, public/{og-default.jpg,logo.png,apple-touch-icon.png,favicon.ico}',
);
