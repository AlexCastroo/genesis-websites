/**
 * One-off: downloads the Stitch mock-up images listed in docs/design/stitch/images.json
 * into src/assets/mova/ (re-encoded JPEG, max 1600 px wide). They are AI-generated
 * placeholders — replace them with real photography before launch.
 *   pnpm tsx scripts/fetch-stitch-images.ts
 */
import { mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

interface StitchImage {
  i: number;
  src: string;
}

const NAMES: Record<number, string> = {
  2: 'hero-live-preview',
  3: 'manifesto-group',
  4: 'practice-reformer',
  5: 'practice-mat',
  6: 'practice-restorative',
  7: 'ritual-tea',
  8: 'ritual-dressing-room',
  9: 'hero-studio',
  10: 'arch-studio',
  11: 'studio-main-room',
  12: 'studio-tea-detail',
  13: 'founder',
  14: 'team-clara',
  15: 'team-elena',
  16: 'team-marina',
  17: 'space-reformer-room',
  18: 'space-dressing-room',
  19: 'space-mat-room',
  20: 'space-tea-lounge',
  21: 'discipline-reformer-core',
  22: 'discipline-mat-flow',
  23: 'discipline-jumpboard',
  24: 'discipline-maternity',
  25: 'discipline-yin',
  26: 'pricing-savasana',
  27: 'pricing-reformer',
};

const root = new URL('..', import.meta.url);
const list = JSON.parse(
  readFileSync(new URL('docs/design/stitch/images.json', root), 'utf8'),
) as StitchImage[];
const outDir = fileURLToPath(new URL('src/assets/mova/', root));
mkdirSync(outDir, { recursive: true });

let count = 0;
for (const image of list) {
  const name = NAMES[image.i];
  if (!name) continue;
  const url =
    image.src.includes('googleusercontent.com') && !/=[whs]\d+/.test(image.src)
      ? `${image.src}=w1600`
      : image.src;
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`Failed to download #${image.i} (${name}): HTTP ${response.status}`);
    process.exit(1);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  await sharp(buffer)
    .resize({ width: 1600, withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(`${outDir}${name}.jpg`);
  count += 1;
}

console.log(`${count} images → src/assets/mova/`);
