/**
 * Local visual check: full-page-ish screenshot of the running dev/preview server.
 *   pnpm screenshot disciplinas --width=375 --height=6000 --no-js   ('home' = /)
 * Paths are given without the leading slash so Git Bash on Windows does not rewrite them.
 * Output: .superpowers/shots/<slug>-<width>[-nojs].png
 * Uses CHROME_PATH or the default Chrome/Edge install locations.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const target = args.find((arg) => !arg.startsWith('--')) ?? 'home';
const path = target === 'home' ? '/' : `/${target.replace(/^\/+/, '')}`;
const option = (name: string, fallback: string) =>
  args.find((arg) => arg.startsWith(`--${name}=`))?.split('=')[1] ?? fallback;
const width = Number(option('width', '1280'));
const height = Number(option('height', '4000'));
const base = option('base', 'http://127.0.0.1:4321');
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

// Chrome exits 0 even when the page fails to load: check the server first.
const probe = await fetch(`${base}${path}`).catch(() => undefined);
if (!probe?.ok) {
  console.error(`${base}${path} is not reachable (HTTP ${probe?.status ?? 'no response'}). Start pnpm preview first.`);
  process.exit(1);
}

const slug = path === '/' ? 'home' : path.replace(/^\/|\/$/g, '').replace(/\//g, '_');
mkdirSync('.superpowers/shots', { recursive: true });
const out = resolve(option('out', `.superpowers/shots/${slug}-${width}${noJs ? '-nojs' : ''}.png`));

// Chrome's window cannot be narrower than ~500 px: smaller viewports are emulated
// with an iframe of the requested width inside a 500 px window.
// The wrapper is written into dist/ (served by `pnpm preview`, same origin) and removed after.
const MIN_WINDOW = 500;
const pageUrl = `${base}${path}`;
const wrapper = resolve('dist/__viewport.html');
const narrow = width < MIN_WINDOW;
if (narrow) {
  writeFileSync(
    wrapper,
    `<!doctype html><body style="margin:0"><iframe src="${path}" width="${width}" height="${height}" style="border:0;display:block"></iframe></body>`,
  );
}
const url = narrow ? `${base}/__viewport.html` : pageUrl;

execFileSync(
  chrome,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    `--window-size=${Math.max(width, MIN_WINDOW)},${height}`,
    '--virtual-time-budget=4000',
    ...(noJs ? ['--blink-settings=scriptEnabled=false'] : []),
    `--screenshot=${out}`,
    url,
  ],
  { stdio: 'ignore' },
);
if (narrow) rmSync(wrapper, { force: true });
console.log(out);
