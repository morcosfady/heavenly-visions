/* Tiny QR code maker for the live game join code (byte mode, error level L, versions 1 to 5).
   window.hvQR(text) returns an array of rows, each row an array of booleans (true = dark module). */
(function(){
const VER={1:{n:26,e:7,al:[]},2:{n:44,e:10,al:[6,18]},3:{n:70,e:15,al:[6,22]},4:{n:100,e:20,al:[6,26]},5:{n:134,e:26,al:[6,30]}};
const EXP=new Array(512),LOG=new Array(256);
(function(){let x=1;for(let i=0;i<255;i++){EXP[i]=x;LOG[x]=i;x<<=1;if(x&256)x^=0x11d}for(let i=255;i<512;i++)EXP[i]=EXP[i-255]})();
const mul=(a,b)=>a&&b?EXP[LOG[a]+LOG[b]]:0;
function rsEc(data,n){let g=[1];for(let i=0;i<n;i++){const ng=new Array(g.length+1).fill(0);g.forEach((c,j)=>{ng[j]^=c;ng[j+1]^=mul(c,EXP[i])});g=ng}
  const r=new Array(n).fill(0);data.forEach(b=>{const f=b^r[0];r.shift();r.push(0);if(f)g.slice(1).forEach((c,j)=>{r[j]^=mul(c,f)})});return r}

function buildMatrix(v,codewords,mask){
  const size=17+4*v,M=Array.from({length:size},()=>new Array(size).fill(null)),fn=Array.from({length:size},()=>new Array(size).fill(false));
  const set=(r,c,val)=>{if(r<0||c<0||r>=size||c>=size)return;M[r][c]=val;fn[r][c]=true};
  const finder=(r,c)=>{for(let i=-1;i<=7;i++)for(let j=-1;j<=7;j++){const d=Math.max(Math.abs(i-3),Math.abs(j-3));set(r+i,c+j,d!==2&&d!==4&&i>=0&&i<=6&&j>=0&&j<=6)}};
  finder(0,0);finder(0,size-7);finder(size-7,0);
  for(let i=8;i<size-8;i++){set(6,i,i%2===0);set(i,6,i%2===0)}
  const al=VER[v].al;al.forEach(r=>al.forEach(c=>{if((r===6&&c===6)||(r===6&&c===al[al.length-1])||(c===6&&r===al[al.length-1]))return;
    for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++)set(r+i,c+j,Math.max(Math.abs(i),Math.abs(j))!==1)}));
  for(let i=0;i<9;i++){if(!fn[8][i])set(8,i,false);if(!fn[i][8])set(i,8,false)}
  for(let i=0;i<8;i++){set(8,size-1-i,false);set(size-1-i,8,false)}
  set(size-8,8,true);
  const bits=[];codewords.forEach(b=>{for(let i=7;i>=0;i--)bits.push((b>>i)&1)});
  let k=0,up=true;
  for(let c=size-1;c>0;c-=2){if(c===6)c--;
    for(let t=0;t<size;t++){const r=up?size-1-t:t;
      for(let j=0;j<2;j++){const cc=c-j;if(fn[r][cc])continue;let bit=k<bits.length?bits[k]:0;k++;
        const m=[(r+cc)%2===0,r%2===0,cc%3===0,(r+cc)%3===0,(Math.floor(r/2)+Math.floor(cc/3))%2===0,(r*cc)%2+(r*cc)%3===0,((r*cc)%2+(r*cc)%3)%2===0,((r+cc)%2+(r*cc)%3)%2===0][mask];
        M[r][cc]=!!bit!==m}}
    up=!up}
  // format info: level L = 01
  let f=(1<<3|mask)<<10,g=0x537;for(let i=14;i>=10;i--)if((f>>i)&1)f^=g<<(i-10);
  const fmt=(((1<<3|mask)<<10)|f)^0x5412,bit=i=>((fmt>>i)&1)===1;
  for(let i=0;i<=5;i++)M[i][8]=bit(i);M[7][8]=bit(6);M[8][8]=bit(7);M[8][7]=bit(8);for(let i=9;i<15;i++)M[8][14-i]=bit(i);
  for(let i=0;i<8;i++)M[8][size-1-i]=bit(i);for(let i=8;i<15;i++)M[size-15+i][8]=bit(i);
  return M}

function penalty(M){const n=M.length;let p=0;
  for(let pass=0;pass<2;pass++){for(let i=0;i<n;i++){let run=1;for(let j=1;j<n;j++){const a=pass?M[j][i]:M[i][j],b=pass?M[j-1][i]:M[i][j-1];if(a===b){run++;if(run===5)p+=3;else if(run>5)p++}else run=1}}}
  for(let i=0;i<n-1;i++)for(let j=0;j<n-1;j++){const s=M[i][j];if(s===M[i][j+1]&&s===M[i+1][j]&&s===M[i+1][j+1])p+=3}
  const pat=[true,false,true,true,true,false,true,false,false,false,false],rev=pat.slice().reverse();
  for(let pass=0;pass<2;pass++)for(let i=0;i<n;i++)for(let j=0;j<=n-11;j++){let a=true,b=true;for(let k=0;k<11;k++){const x=pass?M[j+k][i]:M[i][j+k];if(x!==pat[k])a=false;if(x!==rev[k])b=false}if(a||b)p+=40}
  let dark=0;M.forEach(r=>r.forEach(x=>{if(x)dark++}));p+=Math.floor(Math.abs(dark*100/(n*n)-50)/5)*10;return p}

window.hvQR=function(text){
  const bytes=Array.from(new TextEncoder().encode(text));let v=0;
  for(const k of [1,2,3,4,5]){if(bytes.length<=VER[k].n-VER[k].e-2){v=k;break}}
  if(!v)throw new Error("QR text too long");
  const cap=VER[v].n-VER[v].e,bits=[],push=(val,len)=>{for(let i=len-1;i>=0;i--)bits.push((val>>i)&1)};
  push(4,4);push(bytes.length,8);bytes.forEach(b=>push(b,8));
  push(0,Math.min(4,cap*8-bits.length));while(bits.length%8)bits.push(0);
  const data=[];for(let i=0;i<bits.length;i+=8){let b=0;for(let j=0;j<8;j++)b=(b<<1)|bits[i+j];data.push(b)}
  for(let pad=0;data.length<cap;pad++)data.push(pad%2?0x11:0xec);
  const all=data.concat(rsEc(data,VER[v].e));
  let best=null,bestP=1e9;for(let m=0;m<8;m++){const M=buildMatrix(v,all,m),p=penalty(M);if(p<bestP){bestP=p;best=M}}
  return best};
window.hvQRsvg=function(text,px){const M=hvQR(text),n=M.length,q=4,s=n+q*2;
  let d="";M.forEach((r,y)=>r.forEach((x,i)=>{if(x)d+="M"+(i+q)+" "+(y+q)+"h1v1h-1z"}));
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+s+' '+s+'" width="'+(px||200)+'" height="'+(px||200)+'" shape-rendering="crispEdges"><rect width="'+s+'" height="'+s+'" fill="#fff"/><path d="'+d+'" fill="#111"/></svg>'};
})();
