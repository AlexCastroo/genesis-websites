/**
 * Local visual check: full-page-ish screenshot of the running dev/preview server.
 *   pnpm screenshot disciplinas --width=375 --height=6000 --no-js   ('home' = /)
 * Paths are given without the leading slash so Git Bash on Windows does not rewrite them.
 * Output: .superpowers/shots/<slug>-<width>[-nojs].png
 * Uses CHROME_PATH or the default Chrome/Edge install locations.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const target = args.find((arg) => !arg.startsWith('--')) ?? 'home';
const path = target === 'home' ? '/' : `/${target.replace(/^\/+/, '')}`;
const option = (name: string, fallback: string) =>
  args.find((arg) => arg.startsWith(`--${name}=`))?.split('=')[1] ?? fallback;
const width = Number(option('width', '1280'));
const height = Number(option('height', '4000'));
const base = option('base', 'http://localhost:4321');
const noJs = args.includes('--no-js');

const candidates = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter((candidate): candidate is string => Boolean(candidate));
const chrome = candidates.find((candidate) => existsSync(candidate));
if (!chrome) {
  console.error('Chrome not found: set CHROME_PATH');
  process.exit(1);
}

const slug = path === '/' ? 'home' : path.replace(/^\/|\/$/g, '').replace(/\//g, '_');
mkdirSync('.superpowers/shots', { recursive: true });
const out = resolve(option('out', `.superpowers/shots/${slug}-${width}${noJs ? '-nojs' : ''}.png`));

execFileSync(
  chrome,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    `--window-size=${width},${height}`,
    '--virtual-time-budget=4000',
    ...(noJs ? ['--blink-settings=scriptEnabled=false'] : []),
    `--screenshot=${out}`,
    `${base}${path}`,
  ],
  { stdio: 'ignore' },
);
console.log(out);
