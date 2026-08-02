import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, 'temporary screenshots');
fs.mkdirSync(outDir, { recursive: true });

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';
const width = parseInt(process.argv[4] || '1440', 10);
const height = parseInt(process.argv[5] || '900', 10);

function nextIndex() {
  const files = fs.readdirSync(outDir).filter(f => /^screenshot-(\d+)/.test(f));
  const nums = files.map(f => parseInt(f.match(/^screenshot-(\d+)/)[1], 10));
  return nums.length ? Math.max(...nums) + 1 : 1;
}

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const browser = await puppeteer.launch({
  executablePath: CHROME_PATH,
  headless: true,
  args: ['--no-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width, height, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
await new Promise(r => setTimeout(r, 300));

const idx = nextIndex();
const suffix = label ? `-${label}` : '';
const outPath = path.join(outDir, `screenshot-${idx}${suffix}.png`);
await page.screenshot({ path: outPath, fullPage: true });

await browser.close();
console.log(outPath);
