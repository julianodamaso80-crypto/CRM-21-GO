import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.join(__dirname, '..', 'public', 'criativos');

const CRIATIVOS = [
  { id: 'criativo-leilao', name: 'criativo-leilao-80-fipe' },
  { id: 'criativo-app', name: 'criativo-app-6-cota' },
  { id: 'criativo-susep', name: 'criativo-susep-confianca' },
];

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1200, deviceScaleFactor: 2 });

  // Create output dir
  const fs = await import('fs');
  if (!fs.existsSync(OUTPUT)) fs.mkdirSync(OUTPUT, { recursive: true });

  for (let i = 0; i < CRIATIVOS.length; i++) {
    const c = CRIATIVOS[i];
    const url = `http://localhost:3000/criativos`;
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

    // Click the right tab
    const tabs = await page.$$('button');
    for (const tab of tabs) {
      const text = await page.evaluate(el => el.textContent, tab);
      if (
        (i === 0 && text.includes('Leilão')) ||
        (i === 1 && text.includes('App')) ||
        (i === 2 && text.includes('SUSEP'))
      ) {
        await tab.click();
        break;
      }
    }

    await new Promise(r => setTimeout(r, 500));

    // Find the criativo element
    const el = await page.$(`#${c.id}`);
    if (el) {
      const filePath = path.join(OUTPUT, `${c.name}.png`);
      await el.screenshot({ path: filePath, type: 'png' });
      console.log(`✓ Exportado: ${filePath}`);
    } else {
      console.log(`✗ Elemento #${c.id} não encontrado`);
    }
  }

  await browser.close();
  console.log('\nPronto! PNGs em:', OUTPUT);
}

main().catch(console.error);
