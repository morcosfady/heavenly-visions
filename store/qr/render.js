/* Renders poster.html to PDF (US Letter) and PNG, and a half page flyer. Run: NODE_PATH=<pw>/node_modules node store/qr/render.js
   Needs the Chrome that Playwright can drive (see tests/pw-routes.js). QR code: python -c "import segno..." (see README.md here). */
const { chromium } = require('playwright-core');
const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true });
  const p = await b.newPage({ viewport: { width: 816, height: 1056 }, deviceScaleFactor: 3 });
  await p.goto('file:///' + path.join(__dirname, 'poster.html').replace(/\\/g, '/'));
  await p.waitForTimeout(2500);
  await p.screenshot({ path: path.join(__dirname, 'heavenly-visions-qr-poster.png'), fullPage: false });
  await p.pdf({ path: path.join(__dirname, 'heavenly-visions-qr-poster.pdf'), width: '8.5in', height: '11in', printBackground: true, pageRanges: '1' });
  await b.close();
  console.log('done');
})();
