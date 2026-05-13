// ═══════════════════════════════════════
// STATE
// ═══════════════════════════════════════
const state = {
  layoutIdx: 0,
  images: {},
  borderColor: '#a78bfa',
  bgColor: '#0c0c10',
  borderWidth: 5,
  cornerRadius: 8,
  gap: 8,
  padding: 14,
  canvasW: 800,
  canvasH: 600,
  theme: 'dark',
  addingToSlot: null,
  layoutRatios: {},          // Armazena as proporções dos layouts prontos
  fillMode: 'contain',       // 'contain' ou 'stretch'
  customLayout: null,        // objeto árvore quando modo custom ativo
  activeLayoutId: 'g22',     // id do layout ativo (string) ou 'custom'
};

function isCustomMode() { return state.activeLayoutId === 'custom'; }
function getTotalSlots() {
  if (isCustomMode() && state.customLayout) return countSlots(state.customLayout);
  return LAYOUTS[state.layoutIdx].slots;
}
function countSlots(node) {
  if (node.type === 'slot') return 1;
  if (node.children) return node.children.reduce((sum, ch) => sum + countSlots(ch), 0);
  return 0;
}
function collectSlotIndices(node, start=0) {
  // retorna array de índices lineares para cada leaf
  const indices = [];
  function walk(n) {
    if (n.type === 'slot') { indices.push(start++); }
    else if (n.children) { n.children.forEach(ch => walk(ch)); }
  }
  walk(node);
  return indices;
}

// ═══════════════════════════════════════
// LAYOUTS DEFINITION (existing)
// ═══════════════════════════════════════
const LAYOUTS = [
  { cat:'Grids', name:'Grade 2×2', id:'g22', slots:4,
    thumb:(s)=>{rects(s,[[3,3,35,26],[42,3,35,26],[3,33,35,24],[42,33,35,24]]);},
    resizers: [{label:'Largura Colunas', k:0, d:0.5}, {label:'Altura Linhas', k:1, d:0.5}],
    render:(c,W,H,si,opt)=>{
      const{bw,bc,cr,gap,pad}=opt; const rx=state.layoutRatios[0]||0.5, ry=state.layoutRatios[1]||0.5;
      const cw1=(W-pad*2-gap)*rx, cw2=(W-pad*2-gap)*(1-rx), ch1=(H-pad*2-gap)*ry, ch2=(H-pad*2-gap)*(1-ry);
      img(c,si(0),pad,pad,cw1,ch1,bw,bc,cr,opt); img(c,si(1),pad+cw1+gap,pad,cw2,ch1,bw,bc,cr,opt);
      img(c,si(2),pad,pad+ch1+gap,cw1,ch2,bw,bc,cr,opt); img(c,si(3),pad+cw1+gap,pad+ch1+gap,cw2,ch2,bw,bc,cr,opt);
    }
  },
  { cat:'Grids', name:'Grade 3×2', id:'g32', slots:6,
    thumb:(s)=>{for(let c=0;c<3;c++)for(let r=0;r<2;r++)rect(s,3+c*26,3+r*28,22,24);},
    render:(c,W,H,si,opt)=>grid(c,3,2,W,H,si,opt,(W-opt.pad*2-opt.gap*2)/3,(H-opt.pad*2-opt.gap)/2)
  },
  { cat:'Grids', name:'Grade 4×2', id:'g42', slots:8,
    thumb:(s)=>{for(let c=0;c<4;c++)for(let r=0;r<2;r++)rect(s,2+c*20,3+r*28,17,24);},
    render:(c,W,H,si,opt)=>grid(c,4,2,W,H,si,opt,(W-opt.pad*2-opt.gap*3)/4,(H-opt.pad*2-opt.gap)/2)
  },
  { cat:'Compostos', name:'Destaque', id:'feat', slots:3,
    thumb:(s)=>{rect(s,3,3,44,54);rect(s,51,3,26,25);rect(s,51,32,26,25);},
    resizers: [{label:'Divisão', k:0, d:0.6}],
    render:(c,W,H,si,opt)=>{const{gap,pad,bw,bc,cr}=opt; const r=state.layoutRatios[0]||0.6; const fw=(W-pad*2-gap)*r, sw=W-pad*2-gap-fw, fh=H-pad*2, sh=(fh-gap)/2; img(c,si(0),pad,pad,fw,fh,bw,bc,cr,opt); img(c,si(1),pad+fw+gap,pad,sw,sh,bw,bc,cr,opt); img(c,si(2),pad+fw+gap,pad+sh+gap,sw,sh,bw,bc,cr,opt);}
  },
  { cat:'Compostos', name:'Destaque L', id:'featl', slots:3,
    thumb:(s)=>{rect(s,3,3,26,25);rect(s,3,32,26,25);rect(s,33,3,44,54);},
    resizers: [{label:'Divisão', k:0, d:0.38}],
    render:(c,W,H,si,opt)=>{const{gap,pad,bw,bc,cr}=opt; const r=state.layoutRatios[0]||0.38; const sw=(W-pad*2-gap)*r, fw=W-pad*2-gap-sw, fh=H-pad*2, sh=(fh-gap)/2; img(c,si(0),pad,pad,sw,sh,bw,bc,cr,opt); img(c,si(1),pad,pad+sh+gap,sw,sh,bw,bc,cr,opt); img(c,si(2),pad+sw+gap,pad,fw,fh,bw,bc,cr,opt);}
  },
  { cat:'Compostos', name:'Mosaico 5', id:'mos5', slots:5,
    thumb:(s)=>{rect(s,3,3,36,30);rect(s,43,3,34,30);for(let i=0;i<3;i++)rect(s,3+i*26,37,22,20);},
    resizers: [{label:'Altura Superior', k:0, d:0.58}],
    render:(c,W,H,si,opt)=>{const{gap,pad,bw,bc,cr}=opt; const r=state.layoutRatios[0]||0.58; const tw=(W-pad*2-gap)/2, th=(H-pad*2-gap)*r, bh=H-pad*2-th-gap, bw2=(W-pad*2-gap*2)/3; img(c,si(0),pad,pad,tw,th,bw,bc,cr,opt); img(c,si(1),pad+tw+gap,pad,tw,th,bw,bc,cr,opt); for(let i=0;i<3;i++)img(c,si(i+2),pad+i*(bw2+gap),pad+th+gap,bw2,bh,bw,bc,cr,opt);}
  },
  { cat:'Compostos', name:'Mosaico 7', id:'mos7', slots:7,
    thumb:(s)=>{rect(s,3,3,36,30);rect(s,43,3,34,30);rect(s,3,37,16,20);rect(s,23,37,16,20);rect(s,43,37,16,20);rect(s,63,37,6,20);rect(s,63,3,14,30);},
    resizers: [{label:'Altura Superior', k:0, d:0.55}],
    render:(c,W,H,si,opt)=>{const{gap,pad,bw,bc,cr}=opt; const r=state.layoutRatios[0]||0.55; const th=(H-pad*2-gap)*r, bh=H-pad*2-th-gap; const row1w=(W-pad*2-gap*2)/3, row2w=(W-pad*2-gap*3)/4; img(c,si(0),pad,pad,row1w,th,bw,bc,cr,opt); img(c,si(1),pad+row1w+gap,pad,row1w,th,bw,bc,cr,opt); img(c,si(2),pad+row1w*2+gap*2,pad,row1w,th,bw,bc,cr,opt); for(let i=0;i<4;i++)img(c,si(i+3),pad+i*(row2w+gap),pad+th+gap,row2w,bh,bw,bc,cr,opt);}
  },
  { cat:'Compostos', name:'Trio H', id:'trioh', slots:3,
    thumb:(s)=>{for(let i=0;i<3;i++)rect(s,3+i*26,3,22,54);},
    resizers: [{label:'Célula 1', k:0, d:0.33}, {label:'Célula 2', k:1, d:0.33}],
    render:(c,W,H,si,opt)=>{const{gap,pad,bw,bc,cr}=opt; const r1=state.layoutRatios[0]||0.33, r2=state.layoutRatios[1]||0.33; const avail=W-pad*2-gap*2; const w1=avail*r1, w2=avail*r2, w3=avail*(1-r1-r2); img(c,si(0),pad,pad,w1,H-pad*2,bw,bc,cr,opt); img(c,si(1),pad+w1+gap,pad,w2,H-pad*2,bw,bc,cr,opt); img(c,si(2),pad+w1+w2+gap*2,pad,w3,H-pad*2,bw,bc,cr,opt);}
  },
  { cat:'Compostos', name:'Trio V', id:'triov', slots:3,
    thumb:(s)=>{for(let i=0;i<3;i++)rect(s,3,3+i*19,74,16);},
    resizers: [{label:'Célula 1', k:0, d:0.33}, {label:'Célula 2', k:1, d:0.33}],
    render:(c,W,H,si,opt)=>{const{gap,pad,bw,bc,cr}=opt; const r1=state.layoutRatios[0]||0.33, r2=state.layoutRatios[1]||0.33; const avail=H-pad*2-gap*2; const h1=avail*r1, h2=avail*r2, h3=avail*(1-r1-r2); img(c,si(0),pad,pad,W-pad*2,h1,bw,bc,cr,opt); img(c,si(1),pad,pad+h1+gap,W-pad*2,h2,bw,bc,cr,opt); img(c,si(2),pad,pad+h1+h2+gap*2,W-pad*2,h3,bw,bc,cr,opt);}
  },
  { cat:'Compostos', name:'Dual V', id:'dualv', slots:2,
    thumb:(s)=>{rect(s,3,3,34,54);rect(s,43,3,34,54);},
    resizers: [{label:'Divisão', k:0, d:0.5}],
    render:(c,W,H,si,opt)=>{const{gap,pad,bw,bc,cr}=opt; const r=state.layoutRatios[0]||0.5; const cw=(W-pad*2-gap)*r, ch=H-pad*2; img(c,si(0),pad,pad,cw,ch,bw,bc,cr,opt); img(c,si(1),pad+cw+gap,pad,W-pad*2-cw-gap,ch,bw,bc,cr,opt);}
  },
  { cat:'Compostos', name:'Dual H', id:'dualh', slots:2,
    thumb:(s)=>{rect(s,3,3,74,24);rect(s,3,32,74,25);},
    resizers: [{label:'Divisão', k:0, d:0.5}],
    render:(c,W,H,si,opt)=>{const{gap,pad,bw,bc,cr}=opt; const r=state.layoutRatios[0]||0.5; const cw=W-pad*2, ch=(H-pad*2-gap)*r; img(c,si(0),pad,pad,cw,ch,bw,bc,cr,opt); img(c,si(1),pad,pad+ch+gap,cw,H-pad*2-ch-gap,bw,bc,cr,opt);}
  },
  { cat:'Compostos', name:'L-Shape', id:'lshape', slots:4,
    thumb:(s)=>{rect(s,3,3,44,34);rect(s,51,3,26,54);rect(s,3,41,20,16);rect(s,27,41,20,16);},
    resizers: [{label:'Largura Lateral', k:0, d:0.38}, {label:'Altura Divisão', k:1, d:0.55}],
    render:(c,W,H,si,opt)=>{const{gap,pad,bw,bc,cr}=opt; const rL=state.layoutRatios[0]||0.38, rH=state.layoutRatios[1]||0.55; const rw=(W-pad*2-gap)*rL, fw=W-pad*2-gap-rw, fh=(H-pad*2-gap)*rH, bh=H-pad*2-fh-gap, bw2=(fw-gap)/2; img(c,si(0),pad,pad,fw,fh,bw,bc,cr,opt); img(c,si(1),pad+fw+gap,pad,rw,H-pad*2,bw,bc,cr,opt); img(c,si(2),pad,pad+fh+gap,bw2,bh,bw,bc,cr,opt); img(c,si(3),pad+bw2+gap,pad+fh+gap,bw2,bh,bw,bc,cr,opt);}
  },
  { cat:'Compostos', name:'Solo', id:'solo', slots:1,
    thumb:(s)=>{rect(s,3,3,74,54);},
    render:(c,W,H,si,opt)=>{const{gap,pad,bw,bc,cr}=opt;img(c,si(0),pad,pad,W-pad*2,H-pad*2,bw,bc,cr,opt);}
  },
  // Formas mantidas como antes...
  { cat:'Formas', name:'Coração', id:'heart', slots:1,
    thumb:(s)=>{svgPath(s,'M40 47 C39 44,8 40,8 22 C8 8,18 4,28 14 C35 4,52 4,52 22 C52 40,41 44,40 47 Z');},
    render:(c,W,H,si,opt)=>{const cx=W/2,cy=H/2-H*0.03,sz=Math.min(W,H)*0.76;shapeClip(c,si(0),cx-sz/2,cy-sz/2,sz,sz,opt,()=>{c.save();c.translate(cx,cy);const s=sz/240;c.scale(s,s);c.beginPath();c.moveTo(0,50);c.bezierCurveTo(-8,30,-80,20,-80,-15);c.bezierCurveTo(-80,-60,-40,-80,0,-40);c.bezierCurveTo(40,-80,80,-60,80,-15);c.bezierCurveTo(80,20,8,30,0,50);c.closePath();c.restore();});}
  },
  { cat:'Formas', name:'2 Corações', id:'dblheart', slots:2,
    thumb:(s)=>{svgPath(s,'M22 34 C21.5 32,6 29,6 18 C6 9,12 6,18 12 C22 6.5,30 9,30 18 C30 29,22.5 32,22 34 Z');svgPath(s,'M58 34 C57.5 32,42 29,42 18 C42 9,48 6,54 12 C58 6.5,66 9,66 18 C66 29,58.5 32,58 34 Z');},
    render:(c,W,H,si,opt)=>{const sz=Math.min(W*0.44,H*0.76),cy=H/2-H*0.02;[[W*0.27,cy],[W*0.73,cy]].forEach(([cx,y],i)=>{shapeClip(c,si(i),cx-sz/2,y-sz/2,sz,sz,opt,()=>{c.save();c.translate(cx,y);const s=sz/240;c.scale(s,s);c.beginPath();c.moveTo(0,50);c.bezierCurveTo(-8,30,-80,20,-80,-15);c.bezierCurveTo(-80,-60,-40,-80,0,-40);c.bezierCurveTo(40,-80,80,-60,80,-15);c.bezierCurveTo(80,20,8,30,0,50);c.closePath();c.restore();});});}
  },
  { cat:'Formas', name:'Estrela 5', id:'star5', slots:1, thumb:(s)=>{svgPath(s,starD(40,30,26,5));}, render:(c,W,H,si,opt)=>{const cx=W/2,cy=H/2,r=Math.min(W,H)*0.42;shapeClip(c,si(0),cx-r,cy-r,r*2,r*2,opt,()=>starPath(c,cx,cy,r,5));} },
  { cat:'Formas', name:'Estrela 6', id:'star6', slots:1, thumb:(s)=>{svgPath(s,starD(40,30,26,6));}, render:(c,W,H,si,opt)=>{const cx=W/2,cy=H/2,r=Math.min(W,H)*0.42;shapeClip(c,si(0),cx-r,cy-r,r*2,r*2,opt,()=>starPath(c,cx,cy,r,6));} },
  { cat:'Formas', name:'Círculo', id:'circle', slots:1, thumb:(s)=>{svgCirc(s,40,30,25);}, render:(c,W,H,si,opt)=>{const cx=W/2,cy=H/2,r=Math.min(W,H)*0.43;shapeClip(c,si(0),cx-r,cy-r,r*2,r*2,opt,()=>{c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);});} },
  { cat:'Formas', name:'Oval', id:'oval', slots:1, thumb:(s)=>{svgEllipse(s,40,30,36,24);}, render:(c,W,H,si,opt)=>{const cx=W/2,cy=H/2,rx=W*0.44,ry=H*0.43;shapeClip(c,si(0),cx-rx,cy-ry,rx*2,ry*2,opt,()=>{c.beginPath();c.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);});} },
  { cat:'Formas', name:'Diamante', id:'diamond', slots:1, thumb:(s)=>{svgPoly(s,'40,4 70,30 40,56 10,30');}, render:(c,W,H,si,opt)=>{const cx=W/2,cy=H/2,dw=Math.min(W,H)*0.82,dh=Math.min(W,H)*0.86;shapeClip(c,si(0),cx-dw/2,cy-dh/2,dw,dh,opt,()=>diamondPath(c,cx,cy,dw,dh));} },
  { cat:'Formas', name:'Hexágono', id:'hex', slots:1, thumb:(s)=>{let pts='';for(let i=0;i<6;i++){const a=Math.PI/3*i-Math.PI/6,x=40+25*Math.cos(a),y=30+25*Math.sin(a);pts+=x+','+y+' ';}svgPoly(s,pts.trim());}, render:(c,W,H,si,opt)=>{const cx=W/2,cy=H/2,r=Math.min(W,H)*0.43;shapeClip(c,si(0),cx-r,cy-r,r*2,r*2,opt,()=>hexPath(c,cx,cy,r));} },
  { cat:'Formas', name:'Triângulo', id:'tri', slots:1, thumb:(s)=>{svgPoly(s,'40,4 73,56 7,56');}, render:(c,W,H,si,opt)=>{const p=opt.pad,cx=W/2;shapeClip(c,si(0),p,p,W-p*2,H-p*2,opt,()=>{c.beginPath();c.moveTo(cx,p);c.lineTo(W-p,H-p);c.lineTo(p,H-p);c.closePath();});} },
  { cat:'Formas', name:'3 Círculos', id:'circ3', slots:3, thumb:(s)=>{svgCirc(s,20,30,16);svgCirc(s,40,30,16);svgCirc(s,60,30,16);}, render:(c,W,H,si,opt)=>{const r=Math.min(W/3,H)*0.4,cy=H/2;const centers=[W/6,W/2,W*5/6];centers.forEach((cx,i)=>{shapeClip(c,si(i),cx-r,cy-r,r*2,r*2,opt,()=>{c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);});});} },
  { cat:'Formas', name:'Arco', id:'arch', slots:1, thumb:(s)=>{svgPath(s,'M14,56 L14,32 Q14,4 40,4 Q66,4 66,32 L66,56 Z');}, render:(c,W,H,si,opt)=>{const p=opt.pad,cw=W-p*2,ch=H-p*2,cx=W/2,r=cw/2;shapeClip(c,si(0),p,p,cw,ch,opt,()=>{c.beginPath();c.moveTo(p,p+r);c.arc(cx,p+r,r,Math.PI,0);c.lineTo(p+cw,p+ch);c.lineTo(p,p+ch);c.closePath();});} },
];

// ═══════════════════════════════════════
// SVG THUMB HELPERS
// ═══════════════════════════════════════
function ns(tag){return document.createElementNS('http://www.w3.org/2000/svg',tag);}
function rect(p,x,y,w,h,r=3){const e=ns('rect');e.setAttribute('x',x);e.setAttribute('y',y);e.setAttribute('width',w);e.setAttribute('height',h);e.setAttribute('rx',r);e.setAttribute('fill','var(--accent-glow)');e.setAttribute('fill-opacity','0.35');e.setAttribute('stroke','var(--accent)');e.setAttribute('stroke-width','2.2');p.appendChild(e);}
function rects(p,arr){arr.forEach(a=>rect(p,...a));}
function svgPath(p,d){const e=ns('path');e.setAttribute('d',d);e.setAttribute('fill','var(--accent-glow)');e.setAttribute('fill-opacity','0.35');e.setAttribute('stroke','var(--accent)');e.setAttribute('stroke-width','2.2');p.appendChild(e);}
function svgCirc(p,cx,cy,r){const e=ns('circle');e.setAttribute('cx',cx);e.setAttribute('cy',cy);e.setAttribute('r',r);e.setAttribute('fill','var(--accent-glow)');e.setAttribute('fill-opacity','0.35');e.setAttribute('stroke','var(--accent)');e.setAttribute('stroke-width','2.2');p.appendChild(e);}
function svgEllipse(p,cx,cy,rx,ry){const e=ns('ellipse');e.setAttribute('cx',cx);e.setAttribute('cy',cy);e.setAttribute('rx',rx);e.setAttribute('ry',ry);e.setAttribute('fill','var(--accent-glow)');e.setAttribute('fill-opacity','0.35');e.setAttribute('stroke','var(--accent)');e.setAttribute('stroke-width','2.2');p.appendChild(e);}
function svgPoly(p,pts){const e=ns('polygon');e.setAttribute('points',pts);e.setAttribute('fill','var(--accent-glow)');e.setAttribute('fill-opacity','0.35');e.setAttribute('stroke','var(--accent)');e.setAttribute('stroke-width','2.2');p.appendChild(e);}
function starD(cx,cy,r,pts){let d='';for(let i=0;i<pts*2;i++){const a=(i*Math.PI)/pts-Math.PI/2,rd=i%2===0?r:r*0.42,x=cx+Math.cos(a)*rd,y=cy+Math.sin(a)*rd;d+=(i===0?'M':'L')+x.toFixed(1)+' '+y.toFixed(1);}return d+'Z';}

// ═══════════════════════════════════════
// CANVAS DRAW HELPERS
// ═══════════════════════════════════════
const canvas = document.getElementById('collageCanvas');
const ctx = canvas.getContext('2d');

function getOpt() {
  return { bw: state.borderWidth, bc: state.borderColor, cr: state.cornerRadius, gap: state.gap, pad: state.padding, bg: state.bgColor };
}

function grid(c,cols,rows,W,H,si,opt,cw,ch){
  const{gap,pad,bw,bc,cr}=opt;
  for(let r=0;r<rows;r++)for(let col=0;col<cols;col++){const x=pad+col*(cw+gap),y=pad+r*(ch+gap);img(c,si(r*cols+col),x,y,cw,ch,bw,bc,cr,opt);}
}
function img(c,image,x,y,w,h,bw,bc,cr,opt){
  if (state.isHitTesting) {
    const {x: hX, y: hY} = state.isHitTesting;
    if (hX >= x && hX <= x + w && hY >= y && hY <= y + h) {
      if (image && typeof image.isSlotIdx === 'number') state.isHitTesting.result = image.isSlotIdx;
    }
    return;
  }
  c.save();c.beginPath();if(cr>0)c.roundRect(x,y,w,h,cr);else c.rect(x,y,w,h);c.clip();
  const dark=state.theme==='dark';c.fillStyle=dark?'#1f1f2c':'#ede9f8';c.fillRect(x,y,w,h);
  if(image && image.width){
    if(state.fillMode==='stretch'){c.drawImage(image,x,y,w,h);}
    else{const iw=image.width,ih=image.height;const scale=Math.min(w/iw,h/ih);const sw=iw*scale,sh=ih*scale;const dx=x+(w-sw)/2,dy=y+(h-sh)/2;c.drawImage(image,dx,dy,sw,sh);}
  }
  else drawEmpty(c,x,y,w,h,opt);
  c.restore();
  if(bw>0){c.save();c.beginPath();if(cr>0)c.roundRect(x,y,w,h,cr);else c.rect(x,y,w,h);c.strokeStyle=bc;c.lineWidth=bw;c.stroke();c.restore();}
}
function shapeClip(c,image,x,y,w,h,opt,pathFn){
  const{bw,bc,bg}=opt;c.save();pathFn();c.clip();
  if (state.isHitTesting) {
    const {x: hX, y: hY} = state.isHitTesting;
    if (hX >= x && hX <= x + w && hY >= y && hY <= y + h) {
      if (image && typeof image.isSlotIdx === 'number') state.isHitTesting.result = image.isSlotIdx;
    }
    return;
  }
  const dark=state.theme==='dark';c.fillStyle=dark?'#1f1f2c':'#ede9f8';c.fillRect(x,y,w,h);
  if(image && image.width){
    if(state.fillMode==='stretch'){c.drawImage(image,x,y,w,h);}
    else{const iw=image.width,ih=image.height;const scale=Math.min(w/iw,h/ih);const sw=iw*scale,sh=ih*scale;const cx_=x+(w-sw)/2,cy_=y+(h-sh)/2;c.drawImage(image,cx_,cy_,sw,sh);}
  }
  else drawEmpty(c,x,y,w,h,opt);
  c.restore();
  if(bw>0){c.save();pathFn();c.strokeStyle=bc;c.lineWidth=bw;c.stroke();c.restore();}
}
function drawEmpty(c,x,y,w,h,opt){
  const dark=state.theme==='dark';c.fillStyle=dark?'#1f1f2c':'#ede9f8';c.fillRect(x-2,y-2,w+4,h+4);
  c.strokeStyle=dark?'rgba(167,139,250,0.25)':'rgba(124,58,237,0.25)';c.lineWidth=1;const cx_=x+w/2,cy_=y+h/2;const s=Math.min(w,h)*0.15;
  c.beginPath();c.moveTo(cx_-s,cy_);c.lineTo(cx_+s,cy_);c.moveTo(cx_,cy_-s);c.lineTo(cx_,cy_+s);c.stroke();
  c.fillStyle=dark?'rgba(167,139,250,0.35)':'rgba(124,58,237,0.35)';c.font=`${Math.max(10,Math.min(14,w*0.1))}px 'DM Sans', sans-serif`;c.textAlign='center';c.textBaseline='middle';c.fillText('+ foto',cx_,cy_+s+14);
}
function starPath(c,cx,cy,r,pts=5){c.beginPath();for(let i=0;i<pts*2;i++){const a=(i*Math.PI)/pts-Math.PI/2,rd=i%2===0?r:r*0.42;const x=cx+Math.cos(a)*rd,y=cy+Math.sin(a)*rd;i===0?c.moveTo(x,y):c.lineTo(x,y);}c.closePath();}
function diamondPath(c,cx,cy,w,h){c.beginPath();c.moveTo(cx,cy-h/2);c.lineTo(cx+w/2,cy);c.lineTo(cx,cy+h/2);c.lineTo(cx-w/2,cy);c.closePath();}
function hexPath(c,cx,cy,r){c.beginPath();for(let i=0;i<6;i++){const a=Math.PI/3*i-Math.PI/6;c.lineTo(cx+r*Math.cos(a),cy+r*Math.sin(a));}c.closePath();}

// ═══════════════════════════════════════
// CUSTOM LAYOUT RENDER
// ═══════════════════════════════════════
function renderCustomLayout(c,W,H,node,si,opt){
  function renderNode(n, x, y, w, h, slotIdx){
    if (n.type === 'slot') {
      const imgEl = si(slotIdx.val);
      img(c, imgEl, x, y, w, h, opt.bw, opt.bc, opt.cr, opt);
      slotIdx.val++;
      return;
    }
    if (!n.children || n.children.length === 0) return;
    const dir = n.direction; // 'row' ou 'column'
    const totalRatio = n.children.reduce((s,ch)=>s+(ch.ratio||1),0);
    const gap = opt.gap;
    let pos = 0;
    const mainSize = dir==='row' ? w : h;
    const crossSize = dir==='row' ? h : w;
    const gapTotal = gap * (n.children.length - 1);
    const availMain = mainSize - gapTotal;
    n.children.forEach(ch => {
      const ratio = ch.ratio || 1;
      const childMain = (availMain * ratio) / totalRatio;
      const childX = dir==='row' ? x + pos : x;
      const childY = dir==='row' ? y : y + pos;
      const childW = dir==='row' ? childMain : w;
      const childH = dir==='row' ? h : childMain;
      renderNode(ch, childX, childY, childW, childH, slotIdx);
      pos += childMain + gap;
    });
  }
  const slotIdx = { val: 0 };
  const areaX = opt.pad, areaY = opt.pad, areaW = W - opt.pad*2, areaH = H - opt.pad*2;
  renderNode(node, areaX, areaY, areaW, areaH, slotIdx);
}

// ═══════════════════════════════════════
// HIT TEST HELPER
// ═══════════════════════════════════════
function getSlotAt(x, y) {
  const W = canvas.width, H = canvas.height;
  const opt = getOpt();
  const mockCtx = {
    save(){}, restore(){}, beginPath(){}, clip(){}, rect(){}, roundRect(){}, drawImage(){}, fillRect(){}, stroke(){}, moveTo(){}, lineTo(){}, arc(){}, ellipse(){}, closePath(){}, translate(){}, scale(){}, fillText(){},
    set fillStyle(v){}, set strokeStyle(v){}, set lineWidth(v){}, set font(v){}, set textAlign(v){}, set textBaseline(v){}
  };
  state.isHitTesting = { x, y, result: -1 };
  const si = i => ({ isSlotIdx: i });
  if (isCustomMode() && state.customLayout) {
    renderCustomLayout(mockCtx, W, H, state.customLayout, si, opt);
  } else {
    LAYOUTS[state.layoutIdx].render(mockCtx, W, H, si, opt);
  }
  const res = state.isHitTesting.result;
  delete state.isHitTesting;
  return res;
}

// ═══════════════════════════════════════
// RENDER COLLAGE
// ═══════════════════════════════════════
function renderCollage(){
  const W=canvas.width, H=canvas.height;
  const opt = getOpt();
  ctx.fillStyle = state.bgColor;
  ctx.fillRect(0,0,W,H);
  if (isCustomMode() && state.customLayout) {
    renderCustomLayout(ctx, W, H, state.customLayout, i => state.images[i] ? state.images[i].el : null, opt);
  } else {
    const lay = LAYOUTS[state.layoutIdx];
    const si = i => state.images[i] ? state.images[i].el : null;
    lay.render(ctx, W, H, si, opt);
  }
}
function resizeCanvas(){ canvas.width=state.canvasW; canvas.height=state.canvasH; renderCollage(); resizeAnnotationCanvas(); }


// ═══════════════════════════════════════
// UI BUILDERS
// ═══════════════════════════════════════
function buildSidebar(){
  const sb = document.getElementById('sidebarLayouts');
  sb.innerHTML = '';
  let cat = null;
  LAYOUTS.forEach((lay,idx)=>{
    if(lay.cat!==cat){cat=lay.cat;const ce=document.createElement('div');ce.className='layout-category';ce.textContent=cat;sb.appendChild(ce);}
    const thumb=makeThumb(lay,idx,false);sb.appendChild(thumb);
  });
  // Add custom entry
  const customThumb = document.createElement('div');
  customThumb.className = 'layout-thumb custom-thumb';
  customThumb.id = 'customLayoutBtn';
  customThumb.innerHTML = '<div class="custom-icon">⚙️</div><div class="layout-name">Custom</div>';
  customThumb.addEventListener('click', ()=> activateCustomMode());
  sb.appendChild(customThumb);
  updateLayoutActiveState();
}

function makeThumb(lay,idx,active){ /* unused param active, kept for compat */ }
function makeThumb(lay,idx){
  const s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('viewBox','0 0 80 60');lay.thumb(s);
  const d=document.createElement('div');d.className='layout-thumb';d.dataset.idx=idx;d.dataset.layoutId=lay.id;
  d.appendChild(s);const n=document.createElement('div');n.className='layout-name';n.textContent=lay.name;d.appendChild(n);
  d.addEventListener('click',()=>selectLayout(idx));
  return d;
}
function updateLayoutActiveState(){
  document.querySelectorAll('.layout-thumb').forEach(t=>{
    const lid = t.dataset.layoutId;
    if (isCustomMode()) {
      t.classList.toggle('active', t.id === 'customLayoutBtn');
    } else {
      t.classList.toggle('active', lid === state.activeLayoutId);
    }
  });
}
function selectLayout(idx){
  state.activeLayoutId = LAYOUTS[idx].id;
  state.layoutIdx = idx;
  state.customLayout = null;
  state.layoutRatios = {};
  updateLayoutActiveState();
  buildSlotPanel();
  buildMobSlots();
  renderCollage();
  document.getElementById('builderPanel').style.display = 'none';
  document.getElementById('slotPanelContainer').style.display = '';
}
function activateCustomMode(){
  state.activeLayoutId = 'custom';
  if (!state.customLayout) {
    // default: single slot
    state.customLayout = { type:'container', direction:'row', children:[{ type:'slot', ratio:1 }] };
  }
  updateLayoutActiveState();
  buildBuilderUI();
  buildSlotPanel();
  buildMobSlots();
  renderCollage();
  document.getElementById('builderPanel').style.display = 'block';
  document.getElementById('slotPanelContainer').style.display = 'none';
}

// ═══════════════════════════════════════
// CUSTOM LAYOUT BUILDER UI
// ═══════════════════════════════════════
function buildBuilderUI(){
  const panel = document.getElementById('builderPanel');
  if (!isCustomMode() || !state.customLayout) { panel.style.display='none'; return; }
  panel.innerHTML = '';
  panel.style.display = 'block';

  const title = document.createElement('div');
  title.className = 'rp-section-title';
  title.textContent = 'Layout Builder';
  panel.appendChild(title);

  const treeDiv = document.createElement('div');
  treeDiv.className = 'builder-tree';
  buildNodeUI(treeDiv, state.customLayout, null, 0);
  panel.appendChild(treeDiv);

  const btnRow = document.createElement('div');
  btnRow.className = 'builder-btn-row';
  btnRow.style.marginTop = '8px';
  const addRowBtn = document.createElement('button');
  addRowBtn.className = 'builder-btn primary';
  addRowBtn.textContent = '+ Linha';
  addRowBtn.addEventListener('click', ()=>{
    if (state.customLayout.direction === 'column') {
      // already column, add child row container?
      const slotIdx = findFirstSlot(state.customLayout);
      if (slotIdx >=0) splitSlot(slotIdx, 'row', 2);
    } else {
      // change direction or wrap
      if (state.customLayout.children.length === 1 && state.customLayout.children[0].type==='slot') {
        state.customLayout.direction = 'column';
        state.customLayout.children = [{type:'slot',ratio:1},{type:'slot',ratio:1}];
      } else {
        // add a row: wrap current in column, add new row
        const old = state.customLayout;
        state.customLayout = { type:'container', direction:'column', children:[
          { ...old, ratio:1 },
          { type:'container', direction:'row', children:[{type:'slot',ratio:1}], ratio:1 }
        ]};
      }
    }
    buildBuilderUI(); buildSlotPanel(); buildMobSlots(); renderCollage();
  });
  btnRow.appendChild(addRowBtn);
  const addColBtn = document.createElement('button');
  addColBtn.className = 'builder-btn primary';
  addColBtn.textContent = '+ Coluna';
  addColBtn.addEventListener('click', ()=>{
    if (state.customLayout.direction === 'row') {
      const slotIdx = findFirstSlot(state.customLayout);
      if (slotIdx >=0) splitSlot(slotIdx, 'column', 2);
    } else {
      if (state.customLayout.children.length === 1 && state.customLayout.children[0].type==='slot') {
        state.customLayout.direction = 'row';
        state.customLayout.children = [{type:'slot',ratio:1},{type:'slot',ratio:1}];
      } else {
        const old = state.customLayout;
        state.customLayout = { type:'container', direction:'row', children:[
          { ...old, ratio:1 },
          { type:'container', direction:'column', children:[{type:'slot',ratio:1}], ratio:1 }
        ]};
      }
    }
    buildBuilderUI(); buildSlotPanel(); buildMobSlots(); renderCollage();
  });
  btnRow.appendChild(addColBtn);
  const resetBtn = document.createElement('button');
  resetBtn.className = 'builder-btn danger';
  resetBtn.textContent = 'Reset';
  resetBtn.addEventListener('click', ()=>{
    state.customLayout = { type:'container', direction:'row', children:[{type:'slot',ratio:1}] };
    buildBuilderUI(); buildSlotPanel(); buildMobSlots(); renderCollage();
  });
  btnRow.appendChild(resetBtn);
  panel.appendChild(btnRow);
}

function buildNodeUI(parentEl, node, parent, depth){
  if (node.type === 'slot') return;
  const containerDiv = document.createElement('div');
  containerDiv.className = 'builder-node';
  const header = document.createElement('div');
  header.className = 'builder-node-header';
  const label = document.createElement('span');
  label.className = 'builder-node-label';
  label.textContent = node.direction === 'row' ? 'Linha (horizontal)' : 'Coluna (vertical)';
  header.appendChild(label);
  containerDiv.appendChild(header);

  node.children.forEach((child, idx) => {
    const childDiv = document.createElement('div');
    childDiv.className = 'builder-child';
    const typeIcon = child.type === 'slot' ? '🖼️' : (child.direction==='row'?'↔️':'↕️');
    const slotText = child.type === 'slot' ? `Slot` : `Container`;
    childDiv.innerHTML = `<span class="slot-index">${typeIcon}</span><span class="slot-status">${slotText}</span>`;

    if (child.type === 'slot') {
      const ratioInput = document.createElement('input');
      ratioInput.type = 'number'; ratioInput.min = 0.1; ratioInput.step = 0.1; ratioInput.value = child.ratio || 1;
      ratioInput.style.width = '40px';
      ratioInput.addEventListener('input', e => {
        child.ratio = parseFloat(e.target.value) || 1;
        renderCollage();
      });
      childDiv.appendChild(ratioInput);
      const splitBtn = document.createElement('button');
      splitBtn.className = 'builder-btn';
      splitBtn.textContent = 'Dividir';
      splitBtn.addEventListener('click', ()=>{
        splitSlotInTree(node, idx);
        buildBuilderUI(); buildSlotPanel(); buildMobSlots(); renderCollage();
      });
      childDiv.appendChild(splitBtn);
    } else {
      // container child
      buildNodeUI(containerDiv, child, node, depth+1);
      const delBtn = document.createElement('button');
      delBtn.className = 'builder-btn danger';
      delBtn.textContent = 'Remover';
      delBtn.addEventListener('click', ()=>{
        node.children.splice(idx, 1);
        if (node.children.length === 0) node.children.push({type:'slot', ratio:1});
        buildBuilderUI(); buildSlotPanel(); buildMobSlots(); renderCollage();
      });
      childDiv.appendChild(delBtn);
    }
    containerDiv.appendChild(childDiv);
  });

  // Add slot button
  const addSlotBtn = document.createElement('button');
  addSlotBtn.className = 'builder-btn';
  addSlotBtn.textContent = '+ Adicionar slot';
  addSlotBtn.addEventListener('click', ()=>{
    node.children.push({type:'slot', ratio:1});
    buildBuilderUI(); buildSlotPanel(); buildMobSlots(); renderCollage();
  });
  containerDiv.appendChild(addSlotBtn);

  parentEl.appendChild(containerDiv);
}

function findFirstSlot(node, path=[]){
  if (node.type === 'slot') return path;
  if (node.children) {
    for (let i=0; i<node.children.length; i++) {
      const res = findFirstSlot(node.children[i], [...path, i]);
      if (res) return res;
    }
  }
  return null;
}
function getNodeByPath(root, path) {
  let n = root;
  for (const idx of path) n = n.children[idx];
  return n;
}
function splitSlot(slotPath, direction, count=2) {
  // slotPath: array of indices from root to the slot's parent container, last index is slot child index
  if (slotPath.length === 0) return;
  const parentPath = slotPath.slice(0, -1);
  const slotIdx = slotPath[slotPath.length-1];
  const parent = parentPath.length === 0 ? state.customLayout : getNodeByPath(state.customLayout, parentPath);
  const slotNode = parent.children[slotIdx];
  if (slotNode.type !== 'slot') return;
  const newChildren = [];
  for (let i=0; i<count; i++) newChildren.push({type:'slot', ratio:1});
  parent.children[slotIdx] = { type:'container', direction, children: newChildren, ratio: slotNode.ratio || 1 };
}
function splitSlotInTree(parentNode, childIdx) {
  const slotNode = parentNode.children[childIdx];
  if (slotNode.type !== 'slot') return;
  const dir = parentNode.direction === 'row' ? 'column' : 'row';
  parentNode.children[childIdx] = { type:'container', direction: dir, children: [{type:'slot',ratio:1},{type:'slot',ratio:1}], ratio: slotNode.ratio || 1 };
}

// ═══════════════════════════════════════
// SLOT PANEL (shared)
// ═══════════════════════════════════════
function buildSlotPanel(){
  const list = document.getElementById('slotList');
  list.innerHTML = '';
  
  // Ajuste da Imagem Section
  const fillTitle = document.createElement('div'); fillTitle.className = 'rp-section-title'; fillTitle.textContent = 'Enquadramento'; list.appendChild(fillTitle);
  const fillRow = document.createElement('div'); fillRow.className = 'ratio-control';
  fillRow.innerHTML = `<label>Modo</label><select id="fillModeSelect" class="select-input">
    <option value="contain" ${state.fillMode==='contain'?'selected':''}>Ajustar (Sem Corte)</option>
    <option value="stretch" ${state.fillMode==='stretch'?'selected':''}>Esticar (Preencher)</option>
  </select>`;
  fillRow.querySelector('select').addEventListener('change', e => { state.fillMode = e.target.value; renderCollage(); });
  list.appendChild(fillRow);

  // Proporções Section
  const curLay = LAYOUTS[state.layoutIdx];
  if (!isCustomMode() && curLay.resizers) {
    const title = document.createElement('div'); title.className = 'rp-section-title'; title.textContent = 'Proporções'; list.appendChild(title);
    curLay.resizers.forEach(res => {
      const row = document.createElement('div'); row.className = 'ratio-control';
      row.innerHTML = `<label>${res.label}</label><input type="range" min="0.1" max="0.9" step="0.01" value="${state.layoutRatios[res.k] || res.d}">`;
      row.querySelector('input').addEventListener('input', e => { state.layoutRatios[res.k] = +e.target.value; renderCollage(); });
      list.appendChild(row);
    });
  }

  const totalSlots = getTotalSlots();
  for (let i=0; i<totalSlots; i++) {
    const item = document.createElement('div');
    item.className = 'slot-item';
    const lbl = document.createElement('div'); lbl.className = 'slot-label'; lbl.textContent = 'F'+(i+1); item.appendChild(lbl);
    const thumb = document.createElement('div'); thumb.className = 'slot-thumb';
    if (state.images[i]) { const im = document.createElement('img'); im.src = state.images[i].src; thumb.appendChild(im); }
    else { const plus = document.createElement('span'); plus.className = 'plus'; plus.textContent = '+'; thumb.appendChild(plus); }
    thumb.addEventListener('click', ()=> openFilePicker(i)); item.appendChild(thumb);
    const actions = document.createElement('div'); actions.className = 'slot-actions';
    const editBtn = document.createElement('button'); editBtn.className = 'slot-mini-btn'; editBtn.textContent = state.images[i] ? 'Trocar' : 'Adicionar';
    editBtn.addEventListener('click', ()=> openFilePicker(i)); actions.appendChild(editBtn);
    if (state.images[i]) {
      const delBtn = document.createElement('button'); delBtn.className = 'slot-mini-btn del'; delBtn.textContent = 'Remover';
      delBtn.addEventListener('click', ()=>{ delete state.images[i]; buildSlotPanel(); buildMobSlots(); renderCollage(); });
      actions.appendChild(delBtn);
    }
    item.appendChild(actions); list.appendChild(item);
  }
}

// ═══════════════════════════════════════
// MOBILE SHEET (simplified)
// ═══════════════════════════════════════
let currentSheet = null;
function openSheet(which){
  const sheet = document.getElementById('mobileSheet');
  const title = document.getElementById('sheetTitle');
  const content = document.getElementById('sheetContent');
  document.querySelectorAll('.mob-tab').forEach(t=>t.classList.remove('active'));
  if (currentSheet === which && sheet.classList.contains('open')) { sheet.classList.remove('open'); currentSheet = null; return; }
  currentSheet = which; sheet.classList.add('open');
  if (which === 'layouts') { document.getElementById('mobTabLayouts').classList.add('active'); title.textContent='Layouts'; buildMobLayouts(content); }
  else if (which === 'photos') { document.getElementById('mobTabPhotos').classList.add('active'); title.textContent='Fotos'; buildMobSlots(content); }
  else if (which === 'style') { document.getElementById('mobTabStyle').classList.add('active'); title.textContent='Estilo'; buildMobStyle(content); }
}
function buildMobLayouts(container){
  container.innerHTML = ''; const grid = document.createElement('div'); grid.className='mob-layout-grid';
  LAYOUTS.forEach((lay,idx)=>{
    const item=document.createElement('div'); item.className='mob-layout-item'+(idx===state.layoutIdx&&!isCustomMode()?' active':'');
    item.dataset.idx=idx; const s=document.createElementNS('http://www.w3.org/2000/svg','svg'); s.setAttribute('viewBox','0 0 80 60'); lay.thumb(s);
    item.appendChild(s); const n=document.createElement('span'); n.textContent=lay.name; item.appendChild(n);
    item.addEventListener('click',()=>{ selectLayout(idx); openSheet('photos'); });
    grid.appendChild(item);
  });
  // custom
  const customItem = document.createElement('div'); customItem.className='mob-layout-item'+(isCustomMode()?' active':'');
  customItem.innerHTML = '<span style="font-size:24px;">⚙️</span><span>Custom</span>';
  customItem.addEventListener('click',()=>{ activateCustomMode(); openSheet('photos'); });
  grid.appendChild(customItem);
  container.appendChild(grid);
}
function buildMobSlots(container){
  const target = container || document.getElementById('sheetContent');
  if (!target) return; target.innerHTML = '';
  const totalSlots = getTotalSlots();
  const list = document.createElement('div'); list.className = 'mob-slot-list';
  for (let i=0; i<totalSlots; i++) {
    const item = document.createElement('div'); item.className = 'mob-slot-item';
    const th = document.createElement('div'); th.className = 'mob-slot-thumb';
    if (state.images[i]) { const im = document.createElement('img'); im.src = state.images[i].src; th.appendChild(im); }
    else { th.textContent = '+'; th.style.fontSize='20px'; th.style.color='var(--text-muted)'; }
    th.addEventListener('click', ()=> openFilePicker(i)); item.appendChild(th);
    const info = document.createElement('div'); info.className='mob-slot-info';
    const nm = document.createElement('div'); nm.className='mob-slot-name'; nm.textContent = 'Foto '+(i+1); info.appendChild(nm);
    const st = document.createElement('div'); st.className='mob-slot-status'; st.textContent = state.images[i] ? 'Carregada ✓' : 'Vazia'; info.appendChild(st);
    item.appendChild(info);
    const btns = document.createElement('div'); btns.className='mob-slot-btns';
    const editB = document.createElement('button'); editB.className='mob-slot-mini'; editB.textContent = state.images[i] ? 'Trocar' : 'Add';
    editB.addEventListener('click', ()=> openFilePicker(i)); btns.appendChild(editB);
    if (state.images[i]) { const delB = document.createElement('button'); delB.className='mob-slot-mini'; delB.textContent='✕'; delB.style.color='#f87171'; delB.addEventListener('click',()=>{ delete state.images[i]; buildMobSlots(); buildSlotPanel(); renderCollage(); }); btns.appendChild(delB); }
    item.appendChild(btns); list.appendChild(item);
  }
  const addBtn = document.createElement('button'); addBtn.className='add-photos-btn'; addBtn.innerHTML='+ Adicionar múltiplas fotos'; addBtn.style.width='100%';
  addBtn.addEventListener('click',()=>{ state.addingToSlot=null; document.getElementById('fileInput').click(); });
  target.appendChild(list); target.appendChild(addBtn);
}
function buildMobStyle(container){
  container.innerHTML = `
    <div class="mob-controls">
      <div class="mob-ctrl-row"><span class="mob-ctrl-label">Fundo</span><input type="color" id="mobBgColor" value="${state.bgColor}"></div>
      <div class="mob-ctrl-row"><span class="mob-ctrl-label">Borda</span><input type="color" id="mobBorderColor" value="${state.borderColor}"></div>
      <div class="mob-ctrl-row"><span class="mob-ctrl-label">Espessura</span><input type="range" id="mobBorderWidth" min="0" max="24" value="${state.borderWidth}"><span id="mobBwVal">${state.borderWidth}</span></div>
      <div class="mob-ctrl-row"><span class="mob-ctrl-label">Raio canto</span><input type="range" id="mobCorner" min="0" max="40" value="${state.cornerRadius}"><span id="mobCrVal">${state.cornerRadius}</span></div>
      <div class="mob-ctrl-row">
        <span class="mob-ctrl-label">Enquadre</span>
        <select id="mobFillMode" class="select-input" style="flex:1;">
          <option value="contain" ${state.fillMode==='contain'?'selected':''}>Ajustar</option>
          <option value="stretch" ${state.fillMode==='stretch'?'selected':''}>Esticar</option>
        </select>
      </div>
      <div class="mob-ctrl-row"><span class="mob-ctrl-label">Espaço</span><input type="range" id="mobGap" min="0" max="30" value="${state.gap}"><span id="mobGapVal">${state.gap}</span></div>
      <div class="mob-ctrl-row"><span class="mob-ctrl-label">Margem</span><input type="range" id="mobPad" min="0" max="40" value="${state.padding}"><span id="mobPadVal">${state.padding}</span></div>
    </div>`;
  document.getElementById('mobBgColor').addEventListener('input',e=>{state.bgColor=e.target.value;document.getElementById('bgColor').value=state.bgColor;renderCollage();});
  document.getElementById('mobBorderColor').addEventListener('input',e=>{state.borderColor=e.target.value;document.getElementById('borderColor').value=state.borderColor;renderCollage();});
  document.getElementById('mobBorderWidth').addEventListener('input',e=>{state.borderWidth=+e.target.value;document.getElementById('mobBwVal').textContent=state.borderWidth;document.getElementById('borderWidth').value=state.borderWidth;document.getElementById('bwVal').textContent=state.borderWidth;renderCollage();});
  document.getElementById('mobFillMode').addEventListener('change',e=>{state.fillMode=e.target.value; buildSlotPanel(); renderCollage();});
  document.getElementById('mobCorner').addEventListener('input',e=>{state.cornerRadius=+e.target.value;document.getElementById('mobCrVal').textContent=state.cornerRadius;renderCollage();});
  document.getElementById('mobGap').addEventListener('input',e=>{state.gap=+e.target.value;document.getElementById('mobGapVal').textContent=state.gap;renderCollage();});
  document.getElementById('mobPad').addEventListener('input',e=>{state.padding=+e.target.value;document.getElementById('mobPadVal').textContent=state.padding;renderCollage();});
}

document.getElementById('canvasArea').addEventListener('click',()=>{const sheet=document.getElementById('mobileSheet');if(sheet.classList.contains('open')){sheet.classList.remove('open');currentSheet=null;}});

// ═══════════════════════════════════════
// FILE HANDLING
// ═══════════════════════════════════════
function openFilePicker(slot){ state.addingToSlot = slot; document.getElementById('singleFileInput').click(); }
document.getElementById('singleFileInput').addEventListener('change', e=>{const file=e.target.files[0];if(!file)return;loadImageFile(file,state.addingToSlot??0);e.target.value='';});
document.getElementById('fileInput').addEventListener('change', e=>{
  const files=Array.from(e.target.files); const total=getTotalSlots();
  files.forEach((file,fi)=>{ let slot=fi; if(state.addingToSlot!==null)slot=state.addingToSlot; else{for(let s=0;s<total;s++){if(!state.images[s]){slot=s;break;}}slot=Math.min(fi,total-1);}loadImageFile(file,slot);});
  state.addingToSlot=null; e.target.value='';
});
function loadImageFile(file,slot){
  const reader=new FileReader(); reader.onload=ev=>{const el=new Image();el.onload=()=>{state.images[slot]={el,src:ev.target.result};buildSlotPanel();buildMobSlots();renderCollage();};el.src=ev.target.result;};reader.readAsDataURL(file);
}
document.getElementById('addPhotosBtn').addEventListener('click',()=>{state.addingToSlot=null;document.getElementById('fileInput').click();});

// ═══════════════════════════════════════
// DRAG & DROP
// ═══════════════════════════════════════
const canvasArea = document.getElementById('canvasArea');
const dropOverlay = document.getElementById('dropOverlay');
canvasArea.addEventListener('dragover',e=>{e.preventDefault();dropOverlay.classList.add('active');});
canvasArea.addEventListener('dragleave',e=>{if(!canvasArea.contains(e.relatedTarget))dropOverlay.classList.remove('active');});
canvasArea.addEventListener('drop',e=>{
  e.preventDefault();dropOverlay.classList.remove('active');
  const files = Array.from(e.dataTransfer.files).filter(f=>f.type.startsWith('image/'));
  if (files.length === 0) return;
  
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (canvas.height / rect.height);
  const targetSlot = getSlotAt(x, y);
  
  const total = getTotalSlots();
  let startSlot = targetSlot;
  if (startSlot === -1) {
    for(let s=0; s<total; s++) { if(!state.images[s]) { startSlot=s; break; } }
    if (startSlot === -1) startSlot = 0;
  }
  
  files.forEach((file, fi) => {
    const slot = Math.min(startSlot + fi, total - 1);
    loadImageFile(file, slot);
  });
});

// ═══════════════════════════════════════
// CONTROLS
// ═══════════════════════════════════════
document.getElementById('bgColor').addEventListener('input',e=>{state.bgColor=e.target.value;renderCollage();});
document.getElementById('borderColor').addEventListener('input',e=>{state.borderColor=e.target.value;renderCollage();});
document.getElementById('borderWidth').addEventListener('input',e=>{state.borderWidth=+e.target.value;document.getElementById('bwVal').textContent=state.borderWidth;renderCollage();});
document.getElementById('cornerRadius').addEventListener('input',e=>{state.cornerRadius=+e.target.value;document.getElementById('crVal').textContent=state.cornerRadius;document.getElementById('cornerRadiusR').value=state.cornerRadius;document.getElementById('crValR').textContent=state.cornerRadius;renderCollage();});
document.getElementById('cornerRadiusR').addEventListener('input',e=>{state.cornerRadius=+e.target.value;document.getElementById('crValR').textContent=state.cornerRadius;document.getElementById('cornerRadius').value=state.cornerRadius;document.getElementById('crVal').textContent=state.cornerRadius;renderCollage();});
document.getElementById('gapRange').addEventListener('input',e=>{state.gap=+e.target.value;document.getElementById('gapVal').textContent=state.gap;renderCollage();});
document.getElementById('paddingRange').addEventListener('input',e=>{state.padding=+e.target.value;document.getElementById('padVal').textContent=state.padding;renderCollage();});
document.getElementById('annotationColor').addEventListener('input',e=>{annotationState.defaultColor=e.target.value;});


const themeBtn = document.getElementById('themeBtn');
themeBtn.addEventListener('click',()=>{
  state.theme=state.theme==='dark'?'light':'dark'; document.documentElement.setAttribute('data-theme',state.theme);
  if(state.theme==='light'){document.getElementById('bgColor').value='#f0eff8';state.bgColor='#f0eff8';themeBtn.innerHTML=`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;}
  else{document.getElementById('bgColor').value='#0c0c10';state.bgColor='#0c0c10';themeBtn.innerHTML=`<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`;}
  renderCollage();
});
document.getElementById('clearBtn').addEventListener('click',()=>{state.images={};buildSlotPanel();buildMobSlots();renderCollage();showToast('Collage limpa ✓');});
document.getElementById('sizeGrid').addEventListener('click',e=>{const btn=e.target.closest('.size-btn');if(!btn)return;document.querySelectorAll('.size-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');state.canvasW=+btn.dataset.w;state.canvasH=+btn.dataset.h;resizeCanvas();});
document.getElementById('downloadBtn').addEventListener('click',()=>{const link=document.createElement('a');link.download='collagecraft.png';link.href=canvas.toDataURL('image/png',1.0);link.click();showToast('Download iniciado ↓');});
function showToast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2400);}

// ═══════════════════════════════════════
// ANNOTATIONS
// ═══════════════════════════════════════
const annotationState = {
  currentTool: null,
  annotations: [],
  isDrawing: false,
  drawStart: { x: 0, y: 0 },
  tempAnnotation: null,
  movingIdx: -1,
  moveOffset: { x: 0, y: 0 },
  defaultColor: '#f472b6',
  defaultLineWidth: 2.5,
  fontSize: 16,
};

const annCanvas = document.getElementById('annotationCanvas');
const annCtx = annCanvas ? annCanvas.getContext('2d') : null;
const textOverlay = document.getElementById('textInputOverlay');
const textInput = document.getElementById('floatingTextInput');

function resizeAnnotationCanvas() {
  if (!annCanvas) return;
  annCanvas.width = canvas.width;
  annCanvas.height = canvas.height;
  renderAnnotations();
}

function getAnnMousePos(e) {
  if (!annCanvas) return { x: 0, y: 0 };
  const rect = annCanvas.getBoundingClientRect();
  const scaleX = annCanvas.width / rect.width;
  const scaleY = annCanvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  };
}

function renderAnnotations() {
  if (!annCtx) return;
  annCtx.clearRect(0, 0, annCanvas.width, annCanvas.height);
  annotationState.annotations.forEach(ann => drawOneAnnotation(annCtx, ann));
}

function drawOneAnnotation(context, ann) {
  context.save();
  context.strokeStyle = ann.color || annotationState.defaultColor;
  context.fillStyle = ann.color || annotationState.defaultColor;
  context.lineWidth = ann.lineWidth || annotationState.defaultLineWidth;
  context.lineCap = 'round';
  context.lineJoin = 'round';

  switch (ann.type) {
    case 'circle':
      context.beginPath();
      context.arc(ann.x, ann.y, ann.r, 0, Math.PI * 2);
      context.stroke();
      break;
    case 'rect':
      context.strokeRect(ann.x, ann.y, ann.w, ann.h);
      break;
    case 'stroke':
      if (!ann.points || ann.points.length < 2) break;
      context.beginPath();
      context.moveTo(ann.points[0].x, ann.points[0].y);
      for (let i = 1; i < ann.points.length; i++) context.lineTo(ann.points[i].x, ann.points[i].y);
      context.stroke();
      break;
    case 'line':
      context.beginPath();
      context.moveTo(ann.x1, ann.y1);
      context.lineTo(ann.x2, ann.y2);
      context.stroke();
      break;
    case 'arrow':
      drawOneArrow(context, ann.x1, ann.y1, ann.x2, ann.y2);
      break;
    case 'text':

      context.font = `${ann.fontSize || annotationState.fontSize}px 'DM Sans', sans-serif`;
      context.fillStyle = ann.color || annotationState.defaultColor;
      context.textBaseline = 'top';
      context.fillText(ann.text, ann.x, ann.y);
      break;
    case 'bubble':
      drawOneBubble(context, ann.x, ann.y, ann.w, ann.h);
      break;
  }
  context.restore();
}

function drawOneArrow(context, x1, y1, x2, y2) {
  const headLen = 12;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.beginPath();
  context.moveTo(x2, y2);
  context.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
  context.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
  context.closePath();
  context.fill();
}

function drawOneBubble(context, x, y, w, h) {
  const r = Math.min(12, w * 0.15, h * 0.15);
  const tailW = 10, tailH = 14, tailX = x + w * 0.35;
  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + w - r, y);
  context.quadraticCurveTo(x + w, y, x + w, y + r);
  context.lineTo(x + w, y + h - r);
  context.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  context.lineTo(tailX + tailW, y + h);
  context.quadraticCurveTo(tailX, y + h + tailH * 0.4, tailX, y + h + tailH);
  context.quadraticCurveTo(tailX, y + h + tailH * 0.4, tailX - tailW, y + h);
  context.lineTo(x + r, y + h);
  context.quadraticCurveTo(x, y + h, x, y + h - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
  context.closePath();
  context.globalAlpha = 0.12;
  context.fill();
  context.globalAlpha = 1;
  context.stroke();
}


// Tool selection
if (annCanvas) {
  document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tool = btn.dataset.tool;
      if (tool === 'undo') { undoAnnotation(); return; }
      if (tool === 'redo') { redoAnnotation(); return; }
      if (tool === 'clear') { clearAnnotations(); return; }
      if (tool === 'apply') { applyAnnotations(); return; }

      document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
      if (annotationState.currentTool === tool) {
        annotationState.currentTool = null;
        annCanvas.style.cursor = 'crosshair';
      } else {
        annotationState.currentTool = tool;
        btn.classList.add('active');
        annCanvas.style.cursor = tool === 'move' ? 'move' : 'crosshair';
      }
    });
  });

  annCanvas.addEventListener('mousedown', e => {
    if (!annotationState.currentTool) return;
    const pos = getAnnMousePos(e);
    annotationState.isDrawing = true;
    annotationState.drawStart = pos;

    if (annotationState.currentTool === 'move') {
      for (let i = annotationState.annotations.length - 1; i >= 0; i--) {
        if (hitTestAnnotation(annotationState.annotations[i], pos.x, pos.y)) {
          annotationState.movingIdx = i;
          annotationState.moveOffset = {
            x: pos.x - getAnnotationOrigin(annotationState.annotations[i]).x,
            y: pos.y - getAnnotationOrigin(annotationState.annotations[i]).y
          };
          break;
        }
      }
      return;
    }

    if (annotationState.currentTool === 'text') {
      showFloatingTextInput(pos.x, pos.y);
      annotationState.isDrawing = false;
      return;
    }

    annotationState.tempAnnotation = createTempAnnotation(annotationState.currentTool, pos);
  });

  annCanvas.addEventListener('mousemove', e => {
    if (!annotationState.isDrawing) return;
    const pos = getAnnMousePos(e);

    if (annotationState.currentTool === 'move' && annotationState.movingIdx >= 0) {
      const ann = annotationState.annotations[annotationState.movingIdx];
      const origin = getAnnotationOrigin(ann);
      moveAnnotationBy(ann, pos.x - origin.x - annotationState.moveOffset.x, pos.y - origin.y - annotationState.moveOffset.y);
      renderAnnotations();
      return;
    }

    if (annotationState.tempAnnotation) {
      updateTempAnnotation(annotationState.tempAnnotation, pos);
      renderAnnotations();
      drawOneAnnotation(annCtx, annotationState.tempAnnotation);
    }
  });

  annCanvas.addEventListener('mouseup', e => {
    if (!annotationState.isDrawing) return;
    annotationState.isDrawing = false;

    if (annotationState.currentTool === 'move') {
      annotationState.movingIdx = -1;
      return;
    }

    if (annotationState.tempAnnotation) {
      const pos = getAnnMousePos(e);
      updateTempAnnotation(annotationState.tempAnnotation, pos);
      if (isValidTempAnnotation(annotationState.tempAnnotation)) {
        annotationState.annotations.push(annotationState.tempAnnotation);
      }
      annotationState.tempAnnotation = null;
      renderAnnotations();
    }
  });

  annCanvas.addEventListener('mouseleave', () => {
    if (annotationState.isDrawing && annotationState.tempAnnotation) {
      annotationState.isDrawing = false;
      annotationState.tempAnnotation = null;
      renderAnnotations();
    }
  });
}

function createTempAnnotation(type, pos) {
  const base = { type, color: annotationState.defaultColor, lineWidth: annotationState.defaultLineWidth };
  switch (type) {
    case 'circle': return { ...base, x: pos.x, y: pos.y, r: 0 };
    case 'rect': return { ...base, x: pos.x, y: pos.y, w: 0, h: 0 };
    case 'stroke': return { ...base, points: [{ x: pos.x, y: pos.y }] };
    case 'line': return { ...base, x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y };
    case 'arrow': return { ...base, x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y };
    case 'bubble': return { ...base, x: pos.x, y: pos.y, w: 0, h: 0 };
    default: return null;

  }
}

function updateTempAnnotation(ann, pos) {
  if (!ann) return;
  const start = annotationState.drawStart;
  switch (ann.type) {
    case 'circle':
      ann.r = Math.sqrt(Math.pow(pos.x - start.x, 2) + Math.pow(pos.y - start.y, 2));
      break;
    case 'rect':
    case 'bubble':
      ann.x = Math.min(start.x, pos.x);
      ann.y = Math.min(start.y, pos.y);
      ann.w = Math.abs(pos.x - start.x);
      ann.h = Math.abs(pos.y - start.y);
      break;
    case 'stroke':
      ann.points.push({ x: pos.x, y: pos.y });
      break;
    case 'line':
    case 'arrow':
      ann.x2 = pos.x; ann.y2 = pos.y;
      break;

  }
}

function isValidTempAnnotation(ann) {
  if (!ann) return false;
  switch (ann.type) {
    case 'circle': return ann.r > 3;
    case 'rect':
    case 'bubble': return ann.w > 5 && ann.h > 5;
    case 'stroke': return ann.points && ann.points.length > 2;
    case 'line':
    case 'arrow': return Math.abs(ann.x2 - ann.x1) > 3 || Math.abs(ann.y2 - ann.y1) > 3;
    default: return false;

  }
}

function hitTestAnnotation(ann, x, y) {
  const pad = 8;
  switch (ann.type) {
    case 'circle':
      const d = Math.sqrt((x - ann.x) ** 2 + (y - ann.y) ** 2);
      return d <= ann.r + pad;
    case 'rect':
    case 'bubble':
      return x >= ann.x - pad && x <= ann.x + ann.w + pad && y >= ann.y - pad && y <= ann.y + ann.h + pad;
    case 'stroke':
      return ann.points.some(p => Math.abs(p.x - x) < pad + 2 && Math.abs(p.y - y) < pad + 2);
    case 'line':
    case 'arrow':
      return distPointToSegment(x, y, ann.x1, ann.y1, ann.x2, ann.y2) < pad + 4;
    case 'text':

      annCtx.font = `${ann.fontSize || annotationState.fontSize}px 'DM Sans', sans-serif`;
      const m = annCtx.measureText(ann.text);
      return x >= ann.x - pad && x <= ann.x + m.width + pad && y >= ann.y - 18 && y <= ann.y + 6 + pad;
    default: return false;
  }
}

function getAnnotationOrigin(ann) {
  switch (ann.type) {
    case 'circle': return { x: ann.x - ann.r, y: ann.y - ann.r };
    case 'rect':
    case 'bubble':
    case 'text': return { x: ann.x, y: ann.y };
    case 'stroke': return { x: Math.min(...ann.points.map(p => p.x)), y: Math.min(...ann.points.map(p => p.y)) };
    case 'line':
    case 'arrow': return { x: Math.min(ann.x1, ann.x2), y: Math.min(ann.y1, ann.y2) };
    default: return { x: 0, y: 0 };

  }
}

function moveAnnotationBy(ann, dx, dy) {
  switch (ann.type) {
    case 'circle':
      ann.x += dx; ann.y += dy;
      break;
    case 'rect':
    case 'bubble':
    case 'text':
      ann.x += dx; ann.y += dy;
      break;
    case 'stroke':
      ann.points.forEach(p => { p.x += dx; p.y += dy; });
      break;
    case 'line':
    case 'arrow':
      ann.x1 += dx; ann.y1 += dy;
      ann.x2 += dx; ann.y2 += dy;
      break;
  }

}

function distPointToSegment(px, py, x1, y1, x2, y2) {
  const A = px - x1, B = py - y1, C = x2 - x1, D = y2 - y1;
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = lenSq !== 0 ? dot / lenSq : -1;
  let xx, yy;
  if (param < 0) { xx = x1; yy = y1; }
  else if (param > 1) { xx = x2; yy = y2; }
  else { xx = x1 + param * C; yy = y1 + param * D; }
  return Math.sqrt((px - xx) ** 2 + (py - yy) ** 2);
}

function showFloatingTextInput(x, y) {
  if (!annCanvas) return;
  const rect = annCanvas.getBoundingClientRect();
  const scaleX = rect.width / annCanvas.width;
  const scaleY = rect.height / annCanvas.height;
  textOverlay.style.left = (rect.left + x * scaleX) + 'px';
  textOverlay.style.top = (rect.top + y * scaleY) + 'px';
  textOverlay.style.display = 'block';
  textInput.value = '';
  textInput.focus();

  function onSubmit() {
    const text = textInput.value.trim();
    if (text) {
      annotationState.annotations.push({
        type: 'text', text, x, y,
        color: annotationState.defaultColor,
        fontSize: annotationState.fontSize,
      });
      renderAnnotations();
    }
    cleanup();
  }

  function onKey(e) {
    if (e.key === 'Enter') { e.preventDefault(); onSubmit(); }
    if (e.key === 'Escape') cleanup();
  }

  function cleanup() {
    textOverlay.style.display = 'none';
    textInput.removeEventListener('keydown', onKey);
  }

  textInput.addEventListener('keydown', onKey);
}


function undoAnnotation() {
  if (annotationState.annotations.length === 0) return;
  annotationState.annotations.pop();
  renderAnnotations();
  showToast('Desfeito ✓');
}

function clearAnnotations() {
  annotationState.annotations = [];
  annotationState.tempAnnotation = null;
  renderAnnotations();
  showToast('Anotações apagadas ✓');
}

function applyAnnotations() {
  if (annotationState.annotations.length === 0) return;
  annotationState.annotations.forEach(ann => drawOneAnnotation(ctx, ann));
  annotationState.annotations = [];
  annotationState.tempAnnotation = null;
  renderAnnotations();
  showToast('Anotações aplicadas ✓');
}

// ═══════════════════════════════════════
// INIT
// ═══════════════════════════════════════
buildSidebar();
buildSlotPanel();
resizeCanvas();

// Extra annotation editing: selection, color, text format, rotation, bubble tail and eraser.
Object.assign(annotationState, {
  selectedIdx: -1,
  dragMode: null,
  rotateStart: 0,
  startRotation: 0,
  bold: false,
  italic: false,
  redoStack: []
});

function getSelectedAnnotation() {
  return annotationState.annotations[annotationState.selectedIdx] || null;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getTextFont(ann) {
  const style = ann.italic ? 'italic ' : '';
  const weight = ann.bold ? '700 ' : '';
  return `${style}${weight}${ann.fontSize || annotationState.fontSize}px 'DM Sans', sans-serif`;
}

function normalizeRect(x, y, w, h) {
  return { x: w < 0 ? x + w : x, y: h < 0 ? y + h : y, w: Math.abs(w), h: Math.abs(h) };
}

function getAnnotationBounds(ann) {
  switch (ann.type) {
    case 'circle':
      return { x: ann.x - ann.r, y: ann.y - ann.r, w: ann.r * 2, h: ann.r * 2 };
    case 'rect':
      return normalizeRect(ann.x, ann.y, ann.w, ann.h);
    case 'bubble': {
      const tipX = ann.tailX ?? ann.x + ann.w * 0.35;
      const tipY = ann.tailY ?? ann.y + ann.h + 18;
      const minX = Math.min(ann.x, tipX);
      const minY = Math.min(ann.y, tipY);
      const maxX = Math.max(ann.x + ann.w, tipX);
      const maxY = Math.max(ann.y + ann.h, tipY);
      return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
    }
    case 'stroke': {
      const xs = ann.points.map(p => p.x);
      const ys = ann.points.map(p => p.y);
      const minX = Math.min(...xs), minY = Math.min(...ys);
      return { x: minX, y: minY, w: Math.max(...xs) - minX, h: Math.max(...ys) - minY };
    }
    case 'line':
    case 'arrow': {
      const minX = Math.min(ann.x1, ann.x2), minY = Math.min(ann.y1, ann.y2);
      return { x: minX, y: minY, w: Math.abs(ann.x2 - ann.x1), h: Math.abs(ann.y2 - ann.y1) };
    }
    case 'text': {
      annCtx.save();
      annCtx.font = getTextFont(ann);
      const metrics = annCtx.measureText(ann.text);
      annCtx.restore();
      return { x: ann.x, y: ann.y, w: metrics.width, h: ann.fontSize || annotationState.fontSize };
    }
    default:
      return { x: 0, y: 0, w: 0, h: 0 };
  }
}

function getAnnotationCenter(ann) {
  const b = getAnnotationBounds(ann);
  return { x: b.x + b.w / 2, y: b.y + b.h / 2 };
}

function rotatePoint(x, y, cx, cy, deg) {
  const a = deg * Math.PI / 180;
  const cos = Math.cos(a), sin = Math.sin(a);
  const dx = x - cx, dy = y - cy;
  return { x: cx + dx * cos - dy * sin, y: cy + dx * sin + dy * cos };
}

function toLocalPoint(ann, x, y) {
  const c = getAnnotationCenter(ann);
  return rotatePoint(x, y, c.x, c.y, -(ann.rotation || 0));
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

function getRotateHandle(ann) {
  const b = getAnnotationBounds(ann);
  const c = getAnnotationCenter(ann);
  return rotatePoint(b.x + b.w / 2, b.y - 28, c.x, c.y, ann.rotation || 0);
}

function getBubbleTailHandle(ann) {
  const c = getAnnotationCenter(ann);
  return rotatePoint(ann.tailX ?? ann.x + ann.w * 0.35, ann.tailY ?? ann.y + ann.h + 18, c.x, c.y, ann.rotation || 0);
}

function drawHandle(context, x, y, r, color) {
  context.save();
  context.fillStyle = color;
  context.strokeStyle = '#ffffff';
  context.lineWidth = 2;
  context.beginPath();
  context.arc(x, y, r, 0, Math.PI * 2);
  context.fill();
  context.stroke();
  context.restore();
}

function drawSelectionHandles(context, ann) {
  const b = getAnnotationBounds(ann);
  const c = getAnnotationCenter(ann);
  const rotation = ann.rotation || 0;
  const corners = [
    rotatePoint(b.x, b.y, c.x, c.y, rotation),
    rotatePoint(b.x + b.w, b.y, c.x, c.y, rotation),
    rotatePoint(b.x + b.w, b.y + b.h, c.x, c.y, rotation),
    rotatePoint(b.x, b.y + b.h, c.x, c.y, rotation)
  ];
  context.save();
  context.strokeStyle = '#2dd4bf';
  context.fillStyle = '#2dd4bf';
  context.lineWidth = 1.5;
  context.setLineDash([5, 4]);
  context.beginPath();
  context.moveTo(corners[0].x, corners[0].y);
  corners.slice(1).forEach(p => context.lineTo(p.x, p.y));
  context.closePath();
  context.stroke();
  context.setLineDash([]);
  const rot = getRotateHandle(ann);
  context.beginPath();
  context.moveTo((corners[0].x + corners[1].x) / 2, (corners[0].y + corners[1].y) / 2);
  context.lineTo(rot.x, rot.y);
  context.stroke();
  drawHandle(context, rot.x, rot.y, 6, '#2dd4bf');
  if (ann.type === 'bubble') {
    const tail = getBubbleTailHandle(ann);
    drawHandle(context, tail.x, tail.y, 6, '#f472b6');
  }
  context.restore();
}

function renderAnnotations() {
  if (!annCtx) return;
  annCtx.clearRect(0, 0, annCanvas.width, annCanvas.height);
  annotationState.annotations.forEach((ann, idx) => {
    drawOneAnnotation(annCtx, ann);
    if (idx === annotationState.selectedIdx) drawSelectionHandles(annCtx, ann);
  });
}

function drawOneAnnotation(context, ann) {
  context.save();
  const center = getAnnotationCenter(ann);
  context.translate(center.x, center.y);
  context.rotate((ann.rotation || 0) * Math.PI / 180);
  context.translate(-center.x, -center.y);
  context.strokeStyle = ann.color || annotationState.defaultColor;
  context.fillStyle = ann.color || annotationState.defaultColor;
  context.lineWidth = ann.lineWidth || annotationState.defaultLineWidth;
  context.lineCap = 'round';
  context.lineJoin = 'round';

  switch (ann.type) {
    case 'circle':
      context.beginPath();
      context.arc(ann.x, ann.y, ann.r, 0, Math.PI * 2);
      context.stroke();
      break;
    case 'rect':
      context.strokeRect(ann.x, ann.y, ann.w, ann.h);
      break;
    case 'stroke':
      if (!ann.points || ann.points.length < 2) break;
      context.beginPath();
      context.moveTo(ann.points[0].x, ann.points[0].y);
      for (let i = 1; i < ann.points.length; i++) context.lineTo(ann.points[i].x, ann.points[i].y);
      context.stroke();
      break;
    case 'line':
      context.beginPath();
      context.moveTo(ann.x1, ann.y1);
      context.lineTo(ann.x2, ann.y2);
      context.stroke();
      break;
    case 'arrow':
      drawOneArrow(context, ann.x1, ann.y1, ann.x2, ann.y2);
      break;
    case 'text':
      context.font = getTextFont(ann);
      context.textBaseline = 'top';
      context.fillText(ann.text, ann.x, ann.y);
      break;
    case 'bubble':
      drawBubbleWithTail(context, ann);
      break;
  }
  context.restore();
}

function drawBubbleWithTail(context, ann) {
  const { x, y, w, h } = ann;
  const r = Math.min(12, w * 0.15, h * 0.15);
  const tailW = 12;
  const tailBaseX = clamp(ann.tailBaseX ?? x + w * 0.35, x + r + tailW, x + w - r - tailW);
  const tailTipX = ann.tailX ?? tailBaseX;
  const tailTipY = ann.tailY ?? y + h + 18;
  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + w - r, y);
  context.quadraticCurveTo(x + w, y, x + w, y + r);
  context.lineTo(x + w, y + h - r);
  context.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  context.lineTo(tailBaseX + tailW, y + h);
  context.quadraticCurveTo(tailTipX, tailTipY - 4, tailTipX, tailTipY);
  context.quadraticCurveTo(tailTipX, tailTipY - 4, tailBaseX - tailW, y + h);
  context.lineTo(x + r, y + h);
  context.quadraticCurveTo(x, y + h, x, y + h - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
  context.closePath();
  context.globalAlpha = 0.12;
  context.fill();
  context.globalAlpha = 1;
  context.stroke();
}

function hitTestAnnotation(ann, x, y) {
  const pad = 8;
  const local = toLocalPoint(ann, x, y);
  x = local.x;
  y = local.y;
  switch (ann.type) {
    case 'circle':
      return distance(x, y, ann.x, ann.y) <= ann.r + pad;
    case 'rect':
      return x >= ann.x - pad && x <= ann.x + ann.w + pad && y >= ann.y - pad && y <= ann.y + ann.h + pad;
    case 'bubble':
      return (x >= ann.x - pad && x <= ann.x + ann.w + pad && y >= ann.y - pad && y <= ann.y + ann.h + pad) ||
        distPointToSegment(x, y, ann.tailBaseX ?? ann.x + ann.w * 0.35, ann.y + ann.h, ann.tailX ?? ann.x + ann.w * 0.35, ann.tailY ?? ann.y + ann.h + 18) < pad + 4;
    case 'stroke':
      return ann.points.some(p => Math.abs(p.x - x) < pad + 2 && Math.abs(p.y - y) < pad + 2);
    case 'line':
    case 'arrow':
      return distPointToSegment(x, y, ann.x1, ann.y1, ann.x2, ann.y2) < pad + 4;
    case 'text': {
      annCtx.font = getTextFont(ann);
      const m = annCtx.measureText(ann.text);
      const fs = ann.fontSize || annotationState.fontSize;
      return x >= ann.x - pad && x <= ann.x + m.width + pad && y >= ann.y - pad && y <= ann.y + fs + pad;
    }
    default:
      return false;
  }
}

function selectAnnotationAt(x, y) {
  for (let i = annotationState.annotations.length - 1; i >= 0; i--) {
    if (hitTestAnnotation(annotationState.annotations[i], x, y)) {
      annotationState.selectedIdx = i;
      syncControlsFromSelection();
      renderAnnotations();
      return i;
    }
  }
  annotationState.selectedIdx = -1;
  renderAnnotations();
  return -1;
}

function hitTestHandle(x, y) {
  const ann = getSelectedAnnotation();
  if (!ann) return null;
  const rot = getRotateHandle(ann);
  if (distance(x, y, rot.x, rot.y) <= 10) return 'rotate';
  if (ann.type === 'bubble') {
    const tail = getBubbleTailHandle(ann);
    if (distance(x, y, tail.x, tail.y) <= 10) return 'tail';
  }
  return null;
}

function syncControlsFromSelection() {
  const selected = getSelectedAnnotation();
  if (!selected) return;
  const colorInput = document.getElementById('annotationColor');
  const fontSizeInput = document.getElementById('annotationFontSize');
  const boldBtn = document.getElementById('boldBtn');
  const italicBtn = document.getElementById('italicBtn');
  annotationState.countBeforeDraw = 0;
  if (selected.color) colorInput.value = selected.color;
  if (selected.type === 'text') {
    annotationState.fontSize = selected.fontSize || annotationState.fontSize;
    annotationState.bold = !!selected.bold;
    annotationState.italic = !!selected.italic;
    fontSizeInput.value = annotationState.fontSize;
    boldBtn.classList.toggle('active', annotationState.bold);
    italicBtn.classList.toggle('active', annotationState.italic);
  }
}

function eraseAt(x, y) {
  for (let i = annotationState.annotations.length - 1; i >= 0; i--) {
    if (hitTestAnnotation(annotationState.annotations[i], x, y)) {
      annotationState.redoStack = [];
      annotationState.annotations.splice(i, 1);
      annotationState.selectedIdx = -1;
      renderAnnotations();
      return true;
    }
  }
  return false;
}

function setupAdvancedAnnotationControls() {
  if (!annCanvas) return;
  const colorInput = document.getElementById('annotationColor');
  const fontSizeInput = document.getElementById('annotationFontSize');
  const boldBtn = document.getElementById('boldBtn');
  const italicBtn = document.getElementById('italicBtn');

  colorInput.addEventListener('input', e => {
    annotationState.defaultColor = e.target.value;
    const selected = getSelectedAnnotation();
    if (selected) {
      selected.color = e.target.value;
      renderAnnotations();
    }
  });

  fontSizeInput.addEventListener('input', e => {
    annotationState.fontSize = clamp(+e.target.value || 16, 8, 72);
    const selected = getSelectedAnnotation();
    if (selected && selected.type === 'text') {
      selected.fontSize = annotationState.fontSize;
      renderAnnotations();
    }
  });

  boldBtn.addEventListener('click', e => {
    e.stopImmediatePropagation();
    e.preventDefault();
    toggleTextFormat('bold');
  }, true);

  italicBtn.addEventListener('click', e => {
    e.stopImmediatePropagation();
    e.preventDefault();
    toggleTextFormat('italic');
  }, true);

  boldBtn.addEventListener('click', e => {
    e.stopPropagation();
    toggleTextFormat('bold');
  });

  italicBtn.addEventListener('click', e => {
    e.stopPropagation();
    toggleTextFormat('italic');
  });

  annCanvas.addEventListener('mousedown', advancedAnnotationMouseDown, true);
  annCanvas.addEventListener('mousemove', advancedAnnotationMouseMove, true);
  annCanvas.addEventListener('mouseup', advancedAnnotationMouseUp, true);
  annCanvas.addEventListener('mouseleave', advancedAnnotationMouseUp, true);
  annCanvas.addEventListener('mouseup', selectNewAnnotationAfterDraw);
  document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
    btn.addEventListener('click', () => {
      requestAnimationFrame(() => {
        annCanvas.classList.toggle('erasing', annotationState.currentTool === 'eraser');
        annCanvas.style.cursor = getCanvasCursorForTool(annotationState.currentTool);
      });
    });
  });
}

function getCanvasCursorForTool(tool) {
  if (tool === 'move' || tool === 'image-resize') return 'move';
  if (tool === 'eraser') return 'cell';
  if (tool === 'eyedropper') return 'copy';
  return 'crosshair';
}

function setAnnotationTool(tool) {
  annotationState.currentTool = tool;
  document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tool === tool);
  });
  if (annCanvas) {
    annCanvas.classList.toggle('erasing', tool === 'eraser');
    annCanvas.style.cursor = getCanvasCursorForTool(tool);
  }
}

function toggleTextFormat(prop) {
  annotationState[prop] = !annotationState[prop];
  document.getElementById(prop === 'bold' ? 'boldBtn' : 'italicBtn').classList.toggle('active', annotationState[prop]);
  const selected = getSelectedAnnotation();
  if (selected && selected.type === 'text') {
    selected[prop] = annotationState[prop];
    renderAnnotations();
  }
}

function advancedAnnotationMouseDown(e) {
  const pos = getAnnMousePos(e);
  const handle = hitTestHandle(pos.x, pos.y);
  if (handle) {
    e.stopImmediatePropagation();
    annotationState.isDrawing = true;
    annotationState.dragMode = handle;
    annotationState.movingIdx = annotationState.selectedIdx;
    const ann = getSelectedAnnotation();
    if (handle === 'rotate' && ann) {
      const center = getAnnotationCenter(ann);
      annotationState.rotateStart = Math.atan2(pos.y - center.y, pos.x - center.x);
      annotationState.startRotation = ann.rotation || 0;
    }
    return;
  }

  if (!annotationState.currentTool) {
    const idx = selectAnnotationAt(pos.x, pos.y);
    if (idx >= 0) e.stopImmediatePropagation();
    return;
  }

  if (annotationState.currentTool === 'eraser') {
    e.stopImmediatePropagation();
    annotationState.isDrawing = true;
    eraseAt(pos.x, pos.y);
    return;
  }

  if (annotationState.currentTool === 'move') {
    e.stopImmediatePropagation();
    const idx = selectAnnotationAt(pos.x, pos.y);
    annotationState.isDrawing = true;
    annotationState.dragMode = 'move';
    annotationState.movingIdx = idx;
    if (idx >= 0) {
      annotationState.moveOffset = {
        x: pos.x - getAnnotationOrigin(annotationState.annotations[idx]).x,
        y: pos.y - getAnnotationOrigin(annotationState.annotations[idx]).y
      };
    }
  } else {
    annotationState.countBeforeDraw = annotationState.annotations.length;
  }
}

function advancedAnnotationMouseMove(e) {
  if (!annotationState.isDrawing) return;
  if (!annotationState.dragMode && annotationState.currentTool !== 'eraser') return;
  e.stopImmediatePropagation();
  const pos = getAnnMousePos(e);

  if (annotationState.currentTool === 'eraser') {
    eraseAt(pos.x, pos.y);
    return;
  }

  const ann = annotationState.annotations[annotationState.movingIdx];
  if (!ann) return;

  if (annotationState.dragMode === 'move') {
    const origin = getAnnotationOrigin(ann);
    moveAnnotationBy(ann, pos.x - origin.x - annotationState.moveOffset.x, pos.y - origin.y - annotationState.moveOffset.y);
  } else if (annotationState.dragMode === 'rotate') {
    const center = getAnnotationCenter(ann);
    const angle = Math.atan2(pos.y - center.y, pos.x - center.x);
    ann.rotation = annotationState.startRotation + (angle - annotationState.rotateStart) * 180 / Math.PI;
  } else if (annotationState.dragMode === 'tail' && ann.type === 'bubble') {
    const local = toLocalPoint(ann, pos.x, pos.y);
    ann.tailX = local.x;
    ann.tailY = local.y;
    ann.tailBaseX = clamp(local.x, ann.x + 18, ann.x + ann.w - 18);
  }
  renderAnnotations();
}

function advancedAnnotationMouseUp(e) {
  if (!annotationState.isDrawing) return;
  if (!annotationState.dragMode && annotationState.currentTool !== 'eraser') return;
  e.stopImmediatePropagation();
  annotationState.isDrawing = false;
  annotationState.dragMode = null;
  annotationState.movingIdx = -1;
}

function selectNewAnnotationAfterDraw() {
  if (annotationState.annotations.length > annotationState.countBeforeDraw) {
    annotationState.redoStack = [];
    annotationState.selectedIdx = annotationState.annotations.length - 1;
    renderAnnotations();
  }
}

setupAdvancedAnnotationControls();
setupAnnotationAwareDownload();

function createTempAnnotation(type, pos) {
  const base = { type, color: annotationState.defaultColor, lineWidth: annotationState.defaultLineWidth, rotation: 0 };
  switch (type) {
    case 'circle': return { ...base, x: pos.x, y: pos.y, r: 0 };
    case 'rect': return { ...base, x: pos.x, y: pos.y, w: 0, h: 0 };
    case 'stroke': return { ...base, points: [{ x: pos.x, y: pos.y }] };
    case 'line': return { ...base, x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y };
    case 'arrow': return { ...base, x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y };
    case 'bubble': return { ...base, x: pos.x, y: pos.y, w: 0, h: 0, tailX: pos.x, tailY: pos.y, tailBaseX: pos.x };
    default: return null;
  }
}

function updateTempAnnotation(ann, pos) {
  if (!ann) return;
  const start = annotationState.drawStart;
  switch (ann.type) {
    case 'circle':
      ann.r = Math.sqrt(Math.pow(pos.x - start.x, 2) + Math.pow(pos.y - start.y, 2));
      break;
    case 'rect':
    case 'bubble':
      ann.x = Math.min(start.x, pos.x);
      ann.y = Math.min(start.y, pos.y);
      ann.w = Math.abs(pos.x - start.x);
      ann.h = Math.abs(pos.y - start.y);
      if (ann.type === 'bubble') {
        ann.tailBaseX = ann.x + ann.w * 0.35;
        ann.tailX = ann.tailBaseX;
        ann.tailY = ann.y + ann.h + 18;
      }
      break;
    case 'stroke':
      ann.points.push({ x: pos.x, y: pos.y });
      break;
    case 'line':
    case 'arrow':
      ann.x2 = pos.x;
      ann.y2 = pos.y;
      break;
  }
}

function moveAnnotationBy(ann, dx, dy) {
  switch (ann.type) {
    case 'circle':
      ann.x += dx;
      ann.y += dy;
      break;
    case 'rect':
    case 'text':
      ann.x += dx;
      ann.y += dy;
      break;
    case 'bubble':
      ann.x += dx;
      ann.y += dy;
      if (typeof ann.tailX === 'number') ann.tailX += dx;
      if (typeof ann.tailY === 'number') ann.tailY += dy;
      if (typeof ann.tailBaseX === 'number') ann.tailBaseX += dx;
      break;
    case 'stroke':
      ann.points.forEach(p => { p.x += dx; p.y += dy; });
      break;
    case 'line':
    case 'arrow':
      ann.x1 += dx;
      ann.y1 += dy;
      ann.x2 += dx;
      ann.y2 += dy;
      break;
  }
}

function showFloatingTextInput(x, y) {
  if (!annCanvas) return;
  const rect = annCanvas.getBoundingClientRect();
  const scaleX = rect.width / annCanvas.width;
  const scaleY = rect.height / annCanvas.height;
  textOverlay.style.left = (rect.left + x * scaleX) + 'px';
  textOverlay.style.top = (rect.top + y * scaleY) + 'px';
  textOverlay.style.display = 'block';
  textInput.value = '';
  textInput.focus();

  function onSubmit() {
    const text = textInput.value.trim();
    if (text) {
      annotationState.redoStack = [];
      annotationState.annotations.push({
        type: 'text',
        text,
        x,
        y,
        color: annotationState.defaultColor,
        fontSize: annotationState.fontSize,
        bold: annotationState.bold,
        italic: annotationState.italic,
        rotation: 0
      });
      annotationState.selectedIdx = annotationState.annotations.length - 1;
      renderAnnotations();
    }
    cleanup();
  }

  function onKey(e) {
    if (e.key === 'Enter') { e.preventDefault(); onSubmit(); }
    if (e.key === 'Escape') cleanup();
  }

  function cleanup() {
    textOverlay.style.display = 'none';
    textInput.removeEventListener('keydown', onKey);
  }

  textInput.addEventListener('keydown', onKey);
}

function undoAnnotation() {
  if (annotationState.annotations.length === 0) return;
  const ann = annotationState.annotations.pop();
  annotationState.redoStack.push(ann);
  annotationState.selectedIdx = Math.min(annotationState.selectedIdx, annotationState.annotations.length - 1);
  renderAnnotations();
  showToast('Desfeito');
}

function redoAnnotation() {
  if (!annotationState.redoStack || annotationState.redoStack.length === 0) return;
  const ann = annotationState.redoStack.pop();
  annotationState.annotations.push(ann);
  annotationState.selectedIdx = annotationState.annotations.length - 1;
  renderAnnotations();
  showToast('Refeito');
}

function clearAnnotations() {
  annotationState.redoStack = [];
  annotationState.annotations = [];
  annotationState.tempAnnotation = null;
  annotationState.selectedIdx = -1;
  renderAnnotations();
  showToast('Anotacoes apagadas');
}

function applyAnnotations() {
  if (annotationState.annotations.length === 0) return;
  annotationState.redoStack = [];
  const prevSelection = annotationState.selectedIdx;
  annotationState.selectedIdx = -1;
  annotationState.annotations.forEach(ann => drawOneAnnotation(ctx, ann));
  annotationState.annotations = [];
  annotationState.tempAnnotation = null;
  annotationState.selectedIdx = prevSelection;
  annotationState.selectedIdx = -1;
  renderAnnotations();
  showToast('Anotacoes aplicadas');
}

function setupAnnotationAwareDownload() {
  const downloadBtn = document.getElementById('downloadBtn');
  downloadBtn.addEventListener('click', e => {
    e.stopImmediatePropagation();
    e.preventDefault();
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const exportCtx = exportCanvas.getContext('2d');
    exportCtx.drawImage(canvas, 0, 0);
    annotationState.annotations.forEach(ann => drawOneAnnotation(exportCtx, ann));
    const link = document.createElement('a');
    link.download = 'collagecraft.png';
    link.href = exportCanvas.toDataURL('image/png', 1.0);
    link.click();
    showToast('Download iniciado');
  }, true);
}

// Slot image layers and in-canvas image transforms.
Object.assign(state, {
  slotRects: {},
  activeImageSlot: -1,
  activeImageLayer: -1,
  imageDrag: null
});

function normalizeSlotImages(slot) {
  const data = state.images[slot];
  if (!data) return null;
  if (!data.items) {
    data.items = [{ el: data.el, src: data.src, x: 0, y: 0, scale: 1, rotation: 0 }];
    data.active = 0;
  }
  data.items = data.items.filter(item => item && item.el);
  data.items.forEach(item => {
    if (typeof item.scale !== 'number') item.scale = 1;
    if (typeof item.scaleX !== 'number') item.scaleX = item.scale;
    if (typeof item.scaleY !== 'number') item.scaleY = item.scale;
  });
  if (data.items.length === 0) {
    delete state.images[slot];
    return null;
  }
  data.active = clamp(data.active ?? data.items.length - 1, 0, data.items.length - 1);
  data.el = data.items[data.active].el;
  data.src = data.items[data.active].src;
  return data;
}

function getSlotPayload(slot) {
  const data = normalizeSlotImages(slot);
  return data ? { ...data, isLayerStack: true, slot } : null;
}

function getLayerScaleX(item) {
  return typeof item.scaleX === 'number' ? item.scaleX : (item.scale || 1);
}

function getLayerScaleY(item) {
  return typeof item.scaleY === 'number' ? item.scaleY : (item.scale || 1);
}

function setLayerProportionalScale(item, scale) {
  item.scale = scale;
  item.scaleX = scale;
  item.scaleY = scale;
}

function renderCollage(){
  const W=canvas.width, H=canvas.height;
  const opt = getOpt();
  state.slotRects = {};
  ctx.fillStyle = state.bgColor;
  ctx.fillRect(0,0,W,H);
  if (isCustomMode() && state.customLayout) {
    renderCustomLayout(ctx, W, H, state.customLayout, i => getSlotPayload(i), opt);
  } else {
    const lay = LAYOUTS[state.layoutIdx];
    lay.render(ctx, W, H, i => getSlotPayload(i), opt);
  }
  renderAnnotations();
}

function img(c,image,x,y,w,h,bw,bc,cr,opt){
  if (image && typeof image.slot === 'number') state.slotRects[image.slot] = { x, y, w, h };
  if (state.isHitTesting) {
    const {x: hX, y: hY} = state.isHitTesting;
    if (hX >= x && hX <= x + w && hY >= y && hY <= y + h) {
      if (image && typeof image.isSlotIdx === 'number') state.isHitTesting.result = image.isSlotIdx;
    }
    return;
  }
  c.save();c.beginPath();if(cr>0)c.roundRect(x,y,w,h,cr);else c.rect(x,y,w,h);c.clip();
  const dark=state.theme==='dark';c.fillStyle=dark?'#1f1f2c':'#ede9f8';c.fillRect(x,y,w,h);
  if(image && image.isLayerStack){
    drawSlotLayerStack(c, image, x, y, w, h);
  } else if(image && image.width){
    if(state.fillMode==='stretch'){c.drawImage(image,x,y,w,h);}
    else{const iw=image.width,ih=image.height;const scale=Math.min(w/iw,h/ih);const sw=iw*scale,sh=ih*scale;const dx=x+(w-sw)/2,dy=y+(h-sh)/2;c.drawImage(image,dx,dy,sw,sh);}
  }
  else drawEmpty(c,x,y,w,h,opt);
  c.restore();
  if(bw>0){c.save();c.beginPath();if(cr>0)c.roundRect(x,y,w,h,cr);else c.rect(x,y,w,h);c.strokeStyle=bc;c.lineWidth=bw;c.stroke();c.restore();}
}

function shapeClip(c,image,x,y,w,h,opt,pathFn){
  const{bw,bc}=opt;c.save();pathFn();c.clip();
  if (state.isHitTesting) {
    const {x: hX, y: hY} = state.isHitTesting;
    if (hX >= x && hX <= x + w && hY >= y && hY <= y + h) {
      if (image && typeof image.isSlotIdx === 'number') state.isHitTesting.result = image.isSlotIdx;
    }
    c.restore();
    return;
  }
  if (image && typeof image.slot === 'number') state.slotRects[image.slot] = { x, y, w, h };
  const dark=state.theme==='dark';c.fillStyle=dark?'#1f1f2c':'#ede9f8';c.fillRect(x,y,w,h);
  if(image && image.isLayerStack) drawSlotLayerStack(c, image, x, y, w, h);
  else if(image && image.width){
    if(state.fillMode==='stretch'){c.drawImage(image,x,y,w,h);}
    else{const iw=image.width,ih=image.height;const scale=Math.min(w/iw,h/ih);const sw=iw*scale,sh=ih*scale;const cx_=x+(w-sw)/2,cy_=y+(h-sh)/2;c.drawImage(image,cx_,cy_,sw,sh);}
  }
  else drawEmpty(c,x,y,w,h,opt);
  c.restore();
  if(bw>0){c.save();pathFn();c.strokeStyle=bc;c.lineWidth=bw;c.stroke();c.restore();}
}

function getLayerDrawInfo(item, rect) {
  const iw = item.el.width, ih = item.el.height;
  const base = state.fillMode === 'stretch' ? Math.max(rect.w / iw, rect.h / ih) : Math.min(rect.w / iw, rect.h / ih);
  const w = iw * base * getLayerScaleX(item);
  const h = ih * base * getLayerScaleY(item);
  return {
    cx: rect.x + rect.w / 2 + (item.x || 0),
    cy: rect.y + rect.h / 2 + (item.y || 0),
    w, h,
    rotation: item.rotation || 0
  };
}

function drawSlotLayerStack(c, payload, x, y, w, h) {
  const rect = { x, y, w, h };
  payload.items.forEach(item => {
    const d = getLayerDrawInfo(item, rect);
    c.save();
    c.translate(d.cx, d.cy);
    c.rotate(d.rotation * Math.PI / 180);
    c.drawImage(item.el, -d.w / 2, -d.h / 2, d.w, d.h);
    c.restore();
  });
}

function renderAnnotations() {
  if (!annCtx) return;
  annCtx.clearRect(0, 0, annCanvas.width, annCanvas.height);
  annotationState.annotations.forEach((ann, idx) => {
    drawOneAnnotation(annCtx, ann);
    if (idx === annotationState.selectedIdx) drawSelectionHandles(annCtx, ann);
  });
  if (annotationState.currentTool === 'image-resize') drawActiveImageSelection(annCtx);
}

function drawActiveImageSelection(context) {
  const data = normalizeSlotImages(state.activeImageSlot);
  const rect = state.slotRects[state.activeImageSlot];
  if (!data || !rect || state.activeImageLayer < 0) return;
  const item = data.items[state.activeImageLayer];
  if (!item) return;
  const d = getLayerDrawInfo(item, rect);
  const corners = [
    rotatePoint(d.cx - d.w / 2, d.cy - d.h / 2, d.cx, d.cy, d.rotation),
    rotatePoint(d.cx + d.w / 2, d.cy - d.h / 2, d.cx, d.cy, d.rotation),
    rotatePoint(d.cx + d.w / 2, d.cy + d.h / 2, d.cx, d.cy, d.rotation),
    rotatePoint(d.cx - d.w / 2, d.cy + d.h / 2, d.cx, d.cy, d.rotation)
  ];
  context.save();
  context.strokeStyle = '#60a5fa';
  context.fillStyle = '#60a5fa';
  context.lineWidth = 1.5;
  context.setLineDash([4, 3]);
  context.beginPath();
  context.moveTo(corners[0].x, corners[0].y);
  corners.slice(1).forEach(p => context.lineTo(p.x, p.y));
  context.closePath();
  context.stroke();
  context.setLineDash([]);
  corners.forEach(p => drawHandle(context, p.x, p.y, 5, '#60a5fa'));
  context.restore();
}

function hitTestImageLayer(x, y) {
  const activeHandle = hitSpecificImageLayer(state.activeImageSlot, state.activeImageLayer, x, y, 'handles');
  if (activeHandle) return activeHandle;

  const slots = Object.keys(state.slotRects).map(Number).sort((a,b)=>b-a);
  for (const slot of slots) {
    const data = normalizeSlotImages(slot);
    const rect = state.slotRects[slot];
    if (!data || !rect) continue;
    for (let layer = data.items.length - 1; layer >= 0; layer--) {
      const hit = hitSpecificImageLayer(slot, layer, x, y, false);
      if (hit) return hit;
    }
  }
  return null;
}

function hitSpecificImageLayer(slot, layer, x, y, mode='all') {
  const data = normalizeSlotImages(slot);
  const rect = state.slotRects[slot];
  if (!data || !rect || layer < 0 || !data.items[layer]) return null;
  const item = data.items[layer];
  const d = getLayerDrawInfo(item, rect);
  const local = rotatePoint(x, y, d.cx, d.cy, -d.rotation);
  const localCorners = [
    { x: d.cx - d.w / 2, y: d.cy - d.h / 2 },
    { x: d.cx + d.w / 2, y: d.cy - d.h / 2 },
    { x: d.cx + d.w / 2, y: d.cy + d.h / 2 },
    { x: d.cx - d.w / 2, y: d.cy + d.h / 2 }
  ];
  const resizeHit = localCorners.some(p => distance(local.x, local.y, p.x, p.y) <= 28);
  if (resizeHit) return makeImageLayerHit(slot, layer, 'resize', item, d, x, y);
  if (mode === 'handles') return null;
  const inside = local.x >= d.cx - d.w / 2 && local.x <= d.cx + d.w / 2 && local.y >= d.cy - d.h / 2 && local.y <= d.cy + d.h / 2;
  return inside ? makeImageLayerHit(slot, layer, 'move', item, d, x, y) : null;
}

function makeImageLayerHit(slot, layer, handle, item, drawInfo, x, y) {
  return {
    slot,
    layer,
    handle,
    start: {
      x, y,
      cx: drawInfo.cx,
      cy: drawInfo.cy,
      itemX: item.x || 0,
      itemY: item.y || 0,
      scale: Math.max(getLayerScaleX(item), getLayerScaleY(item)),
      scaleX: getLayerScaleX(item),
      scaleY: getLayerScaleY(item),
      dist: distance(x, y, drawInfo.cx, drawInfo.cy) || 1
    }
  };
}

function setupImageLayerEditing() {
  annCanvas.addEventListener('mousedown', e => {
    if (annotationState.currentTool !== 'image-resize') return;
    state.imageDrag = null;
    const pos = getAnnMousePos(e);
    const hit = hitTestImageLayer(pos.x, pos.y);
    e.stopImmediatePropagation();
    if (!hit) {
      state.activeImageSlot = -1;
      state.activeImageLayer = -1;
      renderAnnotations();
      return;
    }
    state.activeImageSlot = hit.slot;
    state.activeImageLayer = hit.layer;
    state.imageDrag = hit;
    const data = normalizeSlotImages(hit.slot);
    if (data) data.active = hit.layer;
    buildSlotPanel();
    renderAnnotations();
  }, true);

  annCanvas.addEventListener('mousemove', e => {
    if (annotationState.currentTool !== 'image-resize' || !state.imageDrag) return;
    e.stopImmediatePropagation();
    const pos = getAnnMousePos(e);
    const data = normalizeSlotImages(state.imageDrag.slot);
    if (!data) return;
    const item = data.items[state.imageDrag.layer];
    if (!item) return;
    if (state.imageDrag.handle === 'resize') {
      const nextDist = distance(pos.x, pos.y, state.imageDrag.start.cx, state.imageDrag.start.cy) || 1;
      const ratio = nextDist / state.imageDrag.start.dist;
      item.scaleX = clamp(state.imageDrag.start.scaleX * ratio, 0.05, 8);
      item.scaleY = clamp(state.imageDrag.start.scaleY * ratio, 0.05, 8);
      item.scale = Math.max(item.scaleX, item.scaleY);
    } else {
      item.x = state.imageDrag.start.itemX + pos.x - state.imageDrag.start.x;
      item.y = state.imageDrag.start.itemY + pos.y - state.imageDrag.start.y;
    }
    renderCollage();
  }, true);

  const stopImageDrag = () => {
    state.imageDrag = null;
  };
  annCanvas.addEventListener('mouseup', stopImageDrag, true);
  annCanvas.addEventListener('mouseleave', stopImageDrag, true);
  document.addEventListener('mouseup', stopImageDrag, true);
  document.addEventListener('pointerup', stopImageDrag, true);
  window.addEventListener('blur', () => { state.imageDrag = null; });
}

function buildSlotPanel(){
  const list = document.getElementById('slotList');
  list.innerHTML = '';
  const fillTitle = document.createElement('div'); fillTitle.className = 'rp-section-title'; fillTitle.textContent = 'Enquadramento'; list.appendChild(fillTitle);
  const fillRow = document.createElement('div'); fillRow.className = 'ratio-control';
  fillRow.innerHTML = `<label>Modo</label><select id="fillModeSelect" class="select-input">
    <option value="contain" ${state.fillMode==='contain'?'selected':''}>Ajustar (Sem Corte)</option>
    <option value="stretch" ${state.fillMode==='stretch'?'selected':''}>Esticar (Preencher)</option>
  </select>`;
  fillRow.querySelector('select').addEventListener('change', e => { state.fillMode = e.target.value; renderCollage(); });
  list.appendChild(fillRow);

  const sizeTitle = document.createElement('div'); sizeTitle.className = 'rp-section-title'; sizeTitle.textContent = 'Proporcoes'; list.appendChild(sizeTitle);
  const heightRow = document.createElement('div'); heightRow.className = 'ratio-control';
  heightRow.innerHTML = `<label>Altura</label><input type="range" min="100" max="5000" step="10" value="${state.canvasH}"><span class="range-val">${state.canvasH}</span>`;
  heightRow.querySelector('input').addEventListener('input', e => {
    state.canvasH = clamp(+e.target.value || state.canvasH, 100, 5000);
    heightRow.querySelector('.range-val').textContent = state.canvasH;
    resizeCanvas();
  });
  list.appendChild(heightRow);

  const curLay = LAYOUTS[state.layoutIdx];
  if (!isCustomMode() && curLay.resizers) {
    curLay.resizers.forEach(res => {
      const row = document.createElement('div'); row.className = 'ratio-control';
      row.innerHTML = `<label>${res.label}</label><input type="range" min="0.1" max="0.9" step="0.01" value="${state.layoutRatios[res.k] || res.d}">`;
      row.querySelector('input').addEventListener('input', e => { state.layoutRatios[res.k] = +e.target.value; renderCollage(); });
      list.appendChild(row);
    });
  }

  const totalSlots = getTotalSlots();
  for (let i=0; i<totalSlots; i++) {
    const data = normalizeSlotImages(i);
    const item = document.createElement('div');
    item.className = 'slot-item';
    const lbl = document.createElement('div'); lbl.className = 'slot-label'; lbl.textContent = 'F'+(i+1); item.appendChild(lbl);
    const thumb = document.createElement('div'); thumb.className = 'slot-thumb';
    if (data) { const im = document.createElement('img'); im.src = data.items[data.active].src; thumb.appendChild(im); }
    else { const plus = document.createElement('span'); plus.className = 'plus'; plus.textContent = '+'; thumb.appendChild(plus); }
    thumb.addEventListener('click', ()=> openFilePicker(i)); item.appendChild(thumb);
    const actions = document.createElement('div'); actions.className = 'slot-actions';
    const addBtn = document.createElement('button'); addBtn.className = 'slot-mini-btn'; addBtn.textContent = data ? '+ Imagem' : 'Adicionar';
    addBtn.addEventListener('click', ()=> openFilePicker(i)); actions.appendChild(addBtn);
    const multiBtn = document.createElement('button'); multiBtn.className = 'slot-mini-btn'; multiBtn.textContent = '+ Varias';
    multiBtn.addEventListener('click', ()=>{ state.addingToSlot = i; document.getElementById('fileInput').click(); }); actions.appendChild(multiBtn);
    if (data) {
      const activeLayer = data.items[data.active];
      if (activeLayer) {
        const addImageScaleRow = (label, value, onInput) => {
          const row = document.createElement('div');
          row.className = 'ratio-control image-scale-control';
          row.innerHTML = `<label>${label}</label><input type="range" min="0.05" max="4" step="0.01" value="${value}"><span class="range-val">${Math.round(value * 100)}%</span>`;
          row.querySelector('input').addEventListener('input', e => {
            const next = +e.target.value;
            row.querySelector('.range-val').textContent = `${Math.round(next * 100)}%`;
            state.activeImageSlot = i;
            state.activeImageLayer = data.active;
            onInput(next);
            renderCollage();
          });
          actions.appendChild(row);
        };
        addImageScaleRow('Proporcao', Math.max(getLayerScaleX(activeLayer), getLayerScaleY(activeLayer)), value => setLayerProportionalScale(activeLayer, value));
        addImageScaleRow('Largura', getLayerScaleX(activeLayer), value => {
          activeLayer.scaleX = value;
          activeLayer.scale = Math.max(getLayerScaleX(activeLayer), getLayerScaleY(activeLayer));
        });
        addImageScaleRow('Altura', getLayerScaleY(activeLayer), value => {
          activeLayer.scaleY = value;
          activeLayer.scale = Math.max(getLayerScaleX(activeLayer), getLayerScaleY(activeLayer));
        });
      }
      data.items.forEach((layer, idx) => {
        const layerBtn = document.createElement('button');
        layerBtn.className = 'slot-mini-btn';
        layerBtn.textContent = `${idx === data.active ? 'Ativa ' : ''}Img ${idx + 1}`;
        layerBtn.addEventListener('click', () => {
          data.active = idx;
          state.activeImageSlot = i;
          state.activeImageLayer = idx;
          buildSlotPanel();
          renderAnnotations();
        });
        actions.appendChild(layerBtn);
      });
      const delBtn = document.createElement('button'); delBtn.className = 'slot-mini-btn del'; delBtn.textContent = 'Remover ativa';
      delBtn.addEventListener('click', ()=>{
        data.items.splice(data.active, 1);
        data.active = Math.max(0, data.active - 1);
        normalizeSlotImages(i);
        state.activeImageSlot = -1;
        state.activeImageLayer = -1;
        buildSlotPanel(); buildMobSlots(); renderCollage();
      });
      actions.appendChild(delBtn);
    }
    item.appendChild(actions); list.appendChild(item);
  }
}

function loadImageFile(file,slot){
  const reader=new FileReader();
  reader.onload=ev=>{
    const el=new Image();
    el.onload=()=>{
      if (!state.images[slot]) {
        state.images[slot] = { items: [], active: 0 };
      } else if (!state.images[slot].items) {
        state.images[slot].items = [{ el: state.images[slot].el, src: state.images[slot].src, x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1, rotation: 0 }];
        state.images[slot].active = 0;
      }
      state.images[slot].items.push({ el, src: ev.target.result, x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1, rotation: 0 });
      state.images[slot].active = state.images[slot].items.length - 1;
      state.images[slot].el = el;
      state.images[slot].src = ev.target.result;
      state.activeImageSlot = slot;
      state.activeImageLayer = state.images[slot].active;
      setAnnotationTool('image-resize');
      buildSlotPanel();buildMobSlots();renderCollage();
    };
    el.src=ev.target.result;
  };
  reader.readAsDataURL(file);
}

function createTempAnnotation(type, pos) {
  const isBrush = type === 'brush';
  const base = { type: isBrush ? 'stroke' : type, color: annotationState.defaultColor, lineWidth: isBrush ? 8 : annotationState.defaultLineWidth, rotation: 0 };
  switch (type) {
    case 'brush':
    case 'stroke': return { ...base, points: [{ x: pos.x, y: pos.y }] };
    case 'circle': return { ...base, x: pos.x, y: pos.y, r: 0 };
    case 'rect': return { ...base, x: pos.x, y: pos.y, w: 0, h: 0 };
    case 'line': return { ...base, x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y };
    case 'arrow': return { ...base, x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y };
    case 'bubble': return { ...base, x: pos.x, y: pos.y, w: 0, h: 0, tailX: pos.x, tailY: pos.y, tailBaseX: pos.x };
    default: return null;
  }
}

function sampleAnnotationColor(x, y) {
  const sample = document.createElement('canvas');
  sample.width = canvas.width;
  sample.height = canvas.height;
  const sampleCtx = sample.getContext('2d');
  sampleCtx.drawImage(canvas, 0, 0);
  annotationState.annotations.forEach(ann => drawOneAnnotation(sampleCtx, ann));
  const pixel = sampleCtx.getImageData(clamp(Math.round(x), 0, sample.width - 1), clamp(Math.round(y), 0, sample.height - 1), 1, 1).data;
  const color = `#${[pixel[0], pixel[1], pixel[2]].map(v => v.toString(16).padStart(2, '0')).join('')}`;
  annotationState.defaultColor = color;
  document.getElementById('annotationColor').value = color;
  showToast('Cor capturada');
}

const previousAdvancedMouseDown = advancedAnnotationMouseDown;
advancedAnnotationMouseDown = function(e) {
  const pos = getAnnMousePos(e);
  if (annotationState.currentTool === 'eyedropper') {
    e.stopImmediatePropagation();
    sampleAnnotationColor(pos.x, pos.y);
    return;
  }
  if (annotationState.currentTool === 'eraser') {
    e.stopImmediatePropagation();
    e.preventDefault();
    annotationState.isDrawing = true;
    eraseAt(pos.x, pos.y);
    return;
  }
  previousAdvancedMouseDown(e);
};

setupImageLayerEditing();
setupAnnotationToolPreCapture();
setupLayeredFileInputs();
buildSlotPanel();
renderCollage();

function setupAnnotationToolPreCapture() {
  document.addEventListener('mousedown', e => {
    if (e.target !== annCanvas) return;
    const pos = getAnnMousePos(e);
    if (annotationState.currentTool === 'eyedropper') {
      e.stopImmediatePropagation();
      e.preventDefault();
      sampleAnnotationColor(pos.x, pos.y);
      return;
    }
    if (annotationState.currentTool === 'eraser') {
      e.stopImmediatePropagation();
      e.preventDefault();
      annotationState.isDrawing = true;
      eraseAt(pos.x, pos.y);
    }
  }, true);
  document.addEventListener('mousemove', e => {
    if (e.target !== annCanvas || annotationState.currentTool !== 'eraser' || !annotationState.isDrawing) return;
    e.stopImmediatePropagation();
    e.preventDefault();
    const pos = getAnnMousePos(e);
    eraseAt(pos.x, pos.y);
  }, true);
  document.addEventListener('mouseup', e => {
    if (annotationState.currentTool !== 'eraser') return;
    annotationState.isDrawing = false;
  }, true);
}

function setupLayeredFileInputs() {
  document.getElementById('singleFileInput').addEventListener('change', e => {
    e.stopImmediatePropagation();
    const file = e.target.files[0];
    if (file) loadImageFile(file, state.addingToSlot ?? 0);
    e.target.value = '';
  }, true);

  document.getElementById('fileInput').addEventListener('change', e => {
    e.stopImmediatePropagation();
    const files = Array.from(e.target.files);
    const total = getTotalSlots();
    if (state.addingToSlot !== null) {
      files.forEach(file => loadImageFile(file, state.addingToSlot));
    } else {
      let nextSlot = 0;
      files.forEach(file => {
        while (nextSlot < total && state.images[nextSlot]) nextSlot++;
        const slot = Math.min(nextSlot, total - 1);
        loadImageFile(file, slot);
        nextSlot = Math.min(slot + 1, total - 1);
      });
    }
    state.addingToSlot = null;
    e.target.value = '';
  }, true);
}
