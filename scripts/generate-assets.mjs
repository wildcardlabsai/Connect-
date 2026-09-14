/* ==========================================================================
   Generates the static brand assets in public/ from vector sources.

   Run with:  npm run gen:assets

   Inter ships as woff2, which the SVG renderer cannot read, so the script
   decompresses the static weights to TrueType into a local cache and points
   fontconfig at it for the duration of the run. Nothing is installed system
   wide and nothing is downloaded.
   ========================================================================== */

import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { decompress } from 'wawoff2';

import { faviconSvg, ogSvg } from './brand-svg.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC_DIR = resolve(ROOT, 'public');
const CACHE_DIR = resolve(ROOT, 'node_modules/.cache/connectcymru-fonts');

const WEIGHTS = ['400', '500', '600', '700'];

async function prepareFonts() {
  mkdirSync(CACHE_DIR, { recursive: true });

  for (const weight of WEIGHTS) {
    const source = resolve(
      ROOT,
      `node_modules/@fontsource/inter/files/inter-latin-${weight}-normal.woff2`,
    );
    const ttf = await decompress(await readFile(source));
    writeFileSync(resolve(CACHE_DIR, `Inter-${weight}.ttf`), Buffer.from(ttf));
  }

  const configPath = resolve(CACHE_DIR, 'fonts.conf');
  writeFileSync(
    configPath,
    `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>${CACHE_DIR}</dir>
  <dir>/usr/share/fonts</dir>
  <cachedir>${CACHE_DIR}/fc-cache</cachedir>
</fontconfig>
`,
  );

  process.env.FONTCONFIG_FILE = configPath;

  try {
    execFileSync('fc-cache', ['-f', CACHE_DIR], { stdio: 'ignore' });
  } catch {
    // fc-cache is optional; fontconfig will scan the directory itself.
  }
}

async function main() {
  await prepareFonts();

  // Imported after fontconfig is pointed at the cache.
  const { default: sharp } = await import('sharp');

  mkdirSync(PUBLIC_DIR, { recursive: true });

  // Favicon stays a vector so it is crisp at any size.
  writeFileSync(resolve(PUBLIC_DIR, 'favicon.svg'), `${faviconSvg(64)}\n`);

  await sharp(Buffer.from(faviconSvg(180)))
    .png()
    .toFile(resolve(PUBLIC_DIR, 'apple-touch-icon.png'));

  await sharp(Buffer.from(ogSvg()))
    .png()
    .toFile(resolve(PUBLIC_DIR, 'og.png'));

  console.log('Wrote public/favicon.svg, public/apple-touch-icon.png, public/og.png');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
