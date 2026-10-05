/* Prints QR matrices for versions 1 to 5. Compare with the python 'segno' library (see HANDOFF.md). */
global.window={};global.TextEncoder=TextEncoder;
require('../qr.js');
const caps={1:17,2:32,3:53,4:78,5:106};const out={};
for(const v in caps){const s="https://x.io/"+("abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".repeat(3)).slice(0,caps[v]-13);out[v]={s,m:window.hvQR(s).map(r=>r.map(x=>x?1:0).join(''))}}
console.log(JSON.stringify(out));
