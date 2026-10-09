# QR poster

Prints a poster that sends people to the app: https://heavenlyvisions.app/

- `heavenly-visions-qr-poster.pdf` (US Letter) and `.png`: print these.
- `qr-code.svg` / `qr-code.png`: the plain QR code (error correction level Q) for flyers, stickers, WhatsApp.
- `poster.html` is the design, `render.js` makes the PDF and PNG (Playwright + Chrome).
- To make the QR again for another link: `python -c "import segno; q=segno.make('URL', error='q'); q.save('qr-code.svg', scale=10, border=4, dark='#141A2B')"` and `q.save('qr-code.png', scale=40, border=4, dark='#141A2B')`.
- Checked with a QR reader (zxing-cpp): decodes correctly, also from a small low resolution copy.
