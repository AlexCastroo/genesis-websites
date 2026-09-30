/**
 * Generates the MOVA brand assets (monogram icons, logo and default share image).
 * Replace with the final brand files when available.
 *   pnpm tsx scripts/generate-placeholders.ts
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = new URL('..', import.meta.url);
const out = (path: string) => fileURLToPath(new URL(path, root));

const CREAM = '#fcf9f4';
const ESPRESSO = '#33251d';
const BROWN = '#755844';

/** "M" monogram in a serif face on cream, used for favicon, touch icon and schema logo. */
const monogram = (size: number, radius: number) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="${radius}" fill="${CREAM}"/>
      <text x="32" y="46" text-anchor="middle" font-family="EB Garamond, Georgia, 'Times New Roman', serif"
        font-size="42" fill="${ESPRESSO}">M</text>
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

await sharp(monogram(512, 0)).png().toFile(out('public/logo.png'));
await sharp(monogram(180, 0)).png().toFile(out('public/apple-touch-icon.png'));
writeFileSync(
  out('public/favicon.ico'),
  pngToIco(await sharp(monogram(32, 12)).png().toBuffer(), 32),
);
writeFileSync(
  out('public/favicon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${CREAM}"/><text x="32" y="46" text-anchor="middle" font-family="EB Garamond, Georgia, 'Times New Roman', serif" font-size="42" fill="${ESPRESSO}">M</text></svg>\n`,
);

// Share image: studio photo with a warm scrim and the wordmark.
const overlay = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.35" stop-color="${ESPRESSO}" stop-opacity="0"/>
      <stop offset="1" stop-color="${ESPRESSO}" stop-opacity="0.85"/>
    </linearGradient></defs>
    <rect width="1200" height="630" fill="url(#g)"/>
    <text x="80" y="520" font-family="EB Garamond, Georgia, serif" font-style="italic" font-size="120"
      letter-spacing="14" fill="${CREAM}">MOVA</text>
    <text x="84" y="570" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="24"
      letter-spacing="5" fill="#d9c2b6">PILATES REFORMER · SALAMANCA, MADRID</text>
    <rect x="84" y="590" width="120" height="3" fill="${BROWN}"/>
  </svg>`,
);
await sharp(out('src/assets/mova/hero-studio.jpg'))
  .resize(1200, 630, { fit: 'cover' })
  .composite([{ input: overlay }])
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(out('public/og-default.jpg'));

console.log(
  'Brand assets written: public/{logo.png,apple-touch-icon.png,favicon.ico,favicon.svg,og-default.jpg}',
);
