/* Original 24×24 pixel sprites, drawn from integer cells. The reference stock
   image is not embedded, cropped, traced or used as a texture. */
const spriteCache=new Map();
function spriteGrid(name){
  const g=Array.from({length:24},()=>Array(24).fill(null));
  const ink='#282637',eye='#242534',cream='#fff0d6',rose='#d899aa';
  const R=(x,y,w,h,c)=>{for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)if(g[j]?.[i]!==undefined)g[j][i]=c;};
  const body=(c)=>{R(6,10,12,9,c);R(7,8,10,2,c);R(8,18,3,3,c);R(15,18,3,3,c);};
  const face=(x=8,y=12,gap=7)=>{R(x,y,2,2,eye);R(x+gap,y,2,2,eye);R(x+4,y+3,2,1,rose);};
  switch(name){
    case 'bunny':{const c='#d8c9e9';R(7,2,3,9,c);R(15,1,3,10,c);R(8,3,1,5,rose);R(16,2,1,6,rose);body(c);R(4,15,3,4,'#baa8d4');R(9,16,6,4,'#f2e6f4');face();R(6,14,2,1,rose);R(17,14,2,1,rose);break;}
    case 'cat':{const c='#e7ae70';body(c);R(5,4,3,8,c);R(6,5,2,3,'#c77971');R(16,4,3,8,c);R(16,5,2,3,'#c77971');R(7,7,10,7,c);R(10,7,2,3,'#bf825d');R(14,7,2,2,'#bf825d');R(18,15,3,4,c);R(20,11,2,6,c);R(20,10,2,2,'#9f6f59');R(8,17,8,3,cream);face(8,11);R(7,20,4,1,'#c28a61');break;}
    case 'frog':{const c='#94ba76';R(5,7,5,6,c);R(14,7,5,6,c);R(5,11,14,8,c);R(4,18,5,3,c);R(15,18,5,3,c);R(8,15,8,4,'#c2dba0');R(7,9,2,2,eye);R(15,9,2,2,eye);R(9,14,6,1,'#5b8066');R(6,13,2,1,rose);R(16,13,2,1,rose);break;}
    case 'dog':{const c='#c89578';body(c);R(7,6,10,9,c);R(4,6,4,9,'#916c61');R(16,7,4,7,'#916c61');R(9,13,6,4,'#edc7a0');R(11,13,2,2,eye);R(8,10,2,2,eye);R(14,10,2,2,eye);R(11,16,2,2,'#ce8f92');R(18,15,3,2,c);R(20,13,2,3,c);R(8,20,3,1,'#edc7a0');R(15,20,3,1,'#edc7a0');break;}
    case 'fox':{const c='#d8926b';R(4,4,4,10,c);R(16,4,4,10,c);R(5,5,2,5,'#654d5b');R(17,5,2,5,'#654d5b');R(7,8,10,11,c);R(5,11,14,4,c);R(7,14,10,3,cream);R(9,17,6,2,cream);R(8,19,3,2,'#6e5860');R(14,19,3,2,'#6e5860');R(17,16,5,3,c);R(20,14,3,3,cream);R(7,12,2,2,eye);R(15,12,2,2,eye);R(11,15,2,2,eye);break;}
    case 'duck':{const c='#f0cb79';R(12,6,6,7,c);R(11,7,8,5,c);R(17,10,5,2,'#d48e5c');R(14,8,2,2,eye);R(6,13,13,6,c);R(4,12,4,4,c);R(7,18,10,2,c);R(8,14,5,3,'#dfb061');R(8,20,3,1,'#d48e5c');R(15,20,3,1,'#d48e5c');break;}
    case 'bee':{R(3,6,6,6,'#b6e2d9');R(15,6,6,6,'#b6e2d9');R(4,15,5,4,'#98c9cc');R(15,15,5,4,'#98c9cc');R(7,7,10,12,'#e6b960');R(9,5,6,2,'#e6b960');R(7,11,10,2,ink);R(7,16,10,2,ink);R(8,3,1,4,ink);R(15,3,1,4,ink);R(9,8,1,2,eye);R(14,8,1,2,eye);R(11,19,2,2,ink);break;}
    case 'turtle':{R(6,11,11,8,'#719c83');R(8,9,7,3,'#90b88a');R(8,12,3,3,'#56796f');R(12,15,3,3,'#56796f');R(13,11,2,2,'#a8c78e');R(17,13,5,4,'#afc593');R(20,13,1,1,eye);R(6,18,3,3,'#afc593');R(14,18,3,3,'#afc593');R(3,16,3,1,'#afc593');break;}
    case 'sheep':{R(4,8,15,10,'#ddd7d0');R(6,6,12,3,'#f2e7d7');R(7,17,3,4,'#726774');R(15,17,3,4,'#726774');R(14,10,6,7,'#8d7b81');R(12,11,2,3,'#8d7b81');R(20,11,2,3,'#8d7b81');R(15,12,1,2,eye);R(18,12,1,2,eye);R(6,10,3,3,'#f4eddf');R(7,14,4,2,'#c7bfca');R(15,15,3,1,'#b49da0');break;}
    case 'parrot':{R(12,5,6,9,'#8fc7b3');R(17,8,4,4,'#dfa365');R(14,7,2,2,eye);R(7,11,10,7,'#79aaa5');R(9,11,4,6,'#568994');R(3,16,8,3,'#568994');R(4,19,5,1,'#568994');R(12,18,2,3,'#9c9587');R(10,21,6,1,'#9c9587');R(15,5,3,1,'#b8d5b2');break;}
    case 'owl':{const c='#b59bc4';R(6,6,12,13,c);R(5,5,3,5,c);R(16,5,3,5,c);R(4,12,3,6,'#9077aa');R(17,12,3,6,'#9077aa');R(7,9,4,5,'#f0dacf');R(13,9,4,5,'#f0dacf');R(8,10,2,2,eye);R(14,10,2,2,eye);R(11,13,2,2,'#e8bc77');R(9,16,6,3,'#cab1d2');R(8,19,2,2,'#e8bc77');R(15,19,2,2,'#e8bc77');break;}
    case 'penguin':{R(8,5,8,3,'#617b99');R(6,8,12,11,'#617b99');R(4,12,3,7,'#617b99');R(17,12,3,7,'#617b99');R(8,10,8,9,'#e2e4e2');R(8,8,2,3,'#e2e4e2');R(14,8,2,3,'#e2e4e2');R(9,9,1,2,eye);R(14,9,1,2,eye);R(11,12,2,2,'#e8b67c');R(7,19,4,2,'#e8b67c');R(14,19,4,2,'#e8b67c');break;}
    case 'squirrel':{R(2,9,5,9,'#a87866');R(2,7,6,4,'#c6987e');R(3,6,4,2,'#d7b39c');R(5,15,5,5,'#a87866');R(9,10,9,10,'#bd8b6d');R(10,5,3,7,'#bd8b6d');R(16,5,3,7,'#bd8b6d');R(10,8,9,7,'#bd8b6d');R(12,13,5,5,'#ead0ab');R(12,10,1,2,eye);R(17,10,1,2,eye);R(14,13,2,1,eye);R(10,20,3,1,'#e0b994');R(16,20,3,1,'#e0b994');break;}
    case 'panda':{body('#e4e2d9');R(5,5,4,5,'#64727b');R(15,5,4,5,'#64727b');R(6,8,12,9,'#e4e2d9');R(7,10,3,4,'#64727b');R(14,10,3,4,'#64727b');R(8,11,1,1,eye);R(15,11,1,1,eye);R(11,14,2,1,eye);R(5,17,3,3,'#64727b');R(16,17,3,3,'#64727b');R(8,20,3,1,'#64727b');R(15,20,3,1,'#64727b');break;}
    case 'deer':{const c='#cba47d';body(c);R(7,6,10,10,c);R(4,7,4,3,c);R(16,7,4,3,c);R(7,2,1,5,'#b2a696');R(5,3,3,1,'#b2a696');R(16,2,1,5,'#b2a696');R(16,3,3,1,'#b2a696');R(9,13,6,4,'#ecceaa');R(8,10,2,2,eye);R(14,10,2,2,eye);R(11,14,2,1,eye);R(7,17,2,1,cream);R(14,18,2,1,cream);R(8,20,3,1,'#836d62');R(15,20,3,1,'#836d62');break;}
    case 'capybara':{const c='#b99578';R(4,10,14,9,c);R(12,7,9,10,c);R(13,5,3,4,c);R(18,6,3,3,c);R(14,11,7,5,'#d0ac8b');R(15,10,2,2,eye);R(20,12,1,1,eye);R(6,18,3,3,'#96765f');R(15,18,3,3,'#96765f');R(5,10,6,2,'#cba88a');break;}
    case 'berry':R(11,8,2,13,'#5f9868');R(6,11,6,3,'#80b278');R(14,7,5,3,'#80b278');R(7,15,6,5,'#cb627d');R(15,11,5,5,'#cb627d');R(8,16,1,1,'#f1d6a4');R(11,18,1,1,'#f1d6a4');R(17,12,1,1,'#f1d6a4');break;
    case 'pumpkin':R(6,11,13,9,'#ca8348');R(8,9,9,12,'#e1a057');R(11,7,3,4,'#688a57');R(12,12,1,8,'#b77642');R(8,12,1,7,'#f1b76a');R(16,12,1,7,'#b77642');R(5,20,16,1,'#7b693e');break;
    case 'seed':R(9,17,6,3,'#946c8e');R(8,16,8,2,'#b28d9d');R(11,13,2,3,'#d9c593');break;
    case 'sprout':R(11,10,2,9,'#87ad8d');R(6,8,6,4,'#b5cc9b');R(13,6,5,4,'#97bd9b');R(8,11,4,2,'#87ad8d');R(9,19,6,2,'#946c8e');break;
    case 'bud':R(11,9,2,12,'#7ca78b');R(7,13,4,3,'#91b898');R(13,16,5,2,'#91b898');R(9,5,6,6,'#c3a2d5');R(11,5,2,5,'#e0c4e0');break;
    case 'flower':R(11,10,2,11,'#89aa8c');R(6,14,6,3,'#a8bc8b');R(13,17,5,2,'#a8bc8b');R(8,3,8,10,'#e1b477');R(6,5,12,6,'#e1b477');R(9,6,6,5,'#926d76');R(11,7,2,2,'#c2a27d');break;
    case 'lavender':R(11,9,2,12,'#86a990');R(8,13,2,7,'#86a990');R(15,12,2,7,'#86a990');R(10,3,4,10,'#b598d0');R(11,2,2,10,'#d0b8e6');R(7,8,4,6,'#9f85bd');R(14,7,4,7,'#b598d0');break;
    case 'tulip':R(11,10,2,11,'#7eaa96');R(7,14,4,3,'#9bc0a4');R(13,16,4,3,'#9bc0a4');R(7,4,3,7,'#d199b0');R(11,5,3,7,'#e4b2be');R(15,4,3,7,'#d199b0');R(8,9,9,4,'#d199b0');R(10,12,5,2,'#b988aa');break;
    case 'tree':R(10,12,4,9,'#a18683');R(7,5,10,11,'#94b4a0');R(4,8,16,5,'#94b4a0');R(9,3,6,3,'#b0c6a5');R(7,7,4,3,'#b0c6a5');R(13,11,5,3,'#77978f');break;
    case 'lantern':R(11,5,2,4,'#ac8a82');R(8,8,8,2,'#967a86');R(9,10,6,7,'#e6c785');R(10,11,4,4,'#f5e0a4');R(8,17,8,2,'#967a86');R(11,19,2,2,'#ac8a82');break;
    case 'stool':R(5,12,14,3,'#b69386');R(6,15,3,6,'#876f77');R(15,15,3,6,'#876f77');R(6,11,12,1,'#d5b295');break;
    case 'mushroom':R(6,13,3,8,'#e3cebb');R(15,15,3,6,'#e3cebb');R(3,10,9,4,'#be91a2');R(5,8,5,3,'#ce9ead');R(13,13,8,3,'#be91a2');R(15,11,4,3,'#ce9ead');R(5,10,2,1,cream);R(9,12,1,1,cream);R(16,13,2,1,cream);break;
    case 'fountain':R(3,16,18,4,'#8f9ba9');R(5,15,14,3,'#a7cdd0');R(7,17,10,1,'#d2e4df');R(10,9,4,7,'#8f9ba9');R(8,9,8,2,'#b7c4c8');R(11,5,2,4,'#b2dfe0');break;
    case 'tent':R(4,17,16,4,'#bd969b');R(6,13,12,5,'#bd969b');R(8,9,8,6,'#bd969b');R(10,5,4,6,'#d8b3a4');R(11,13,3,8,'#615368');R(12,6,1,6,'#f1d9b0');break;
    case 'potLilac':case 'potMint':{const c=name==='potMint'?'#94c3b3':'#b69fc7';R(6,10,12,3,c);R(8,13,8,7,c);R(9,20,6,1,c);R(8,13,2,5,'#d7d4d9');break;}
    default:return null;
  }
  // One-cell silhouette outline gives every animal a consistent pixel-art weight.
  const out=g.map(row=>row.slice());
  for(let y=0;y<24;y++)for(let x=0;x<24;x++)if(g[y][x])for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
    const xx=x+dx,yy=y+dy;if(xx>=0&&xx<24&&yy>=0&&yy<24&&!g[yy][xx])out[yy][xx]=ink;
  }
  return out;
}
function pixel(name='bunny',size=45,variant=0){
  if(!spriteCache.has(name)){
    const grid=spriteGrid(name);
    if(!grid)return pixelLegacy(name,size,variant);
    let r='';for(let y=0;y<24;y++)for(let x=0;x<24;x++)if(grid[y][x])r+=`<rect x="${x}" y="${y}" width="1" height="1" fill="${grid[y][x]}"/>`;
    spriteCache.set(name,r);
  }
  return `<svg class="pixel-svg" width="${size}" height="${size}" viewBox="0 0 24 24" shape-rendering="crispEdges" aria-hidden="true">${spriteCache.get(name)}</svg>`;
}
function scenerySVG(key='night'){
  const p=SCENERIES[key]||SCENERIES.night;
  const R=(x,y,w,h,c)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
  let svg=R(0,0,240,170,p.sky);
  if(key==='meadow'){svg+=R(174,18,18,18,p.light)+R(171,21,24,12,p.light);}
  else{svg+=R(180,17,17,22,p.light)+R(175,22,26,12,p.light)+R(184,15,18,16,p.sky);}
  for(let i=0;i<26;i++){const x=8+(i*47)%228,y=7+(i*29)%77;svg+=R(x,y,i%7===0?2:1,i%7===0?2:1,key==='meadow'?'#dcebe0':p.light);}
  svg+=`<path d="M0 89h12V74h18V65h19V53h18v9h12v15h22V58h14V45h12v14h10v21h25V63h13V73h10V52h19v15h18v18h28v24H0z" fill="${p.far}"/>`;
  svg+=`<path d="M0 101h18V96h25v-8h21v9h29V81h30v9h26v-9h28v14h31v-8h21v8h11v75H0z" fill="${p.hill}"/>`;
  // Pixel conifers, distant trunks and a layered grass terrace.
  for(const [x,y,s] of [[14,62,1],[216,65,1],[39,81,.65],[194,85,.7]]){
    svg+=`<g transform="translate(${x} ${y}) scale(${s})"><path d="M-2 28h4v28h-4z" fill="${p.earth}"/><path d="M-3 0h6v6h4v7h4v7h4v8h-30v-8h4v-7h4V6h4z" fill="${key==='autumn'?'#c89079':p.grass}"/><path d="M-10 24h20v6h5v8h-30v-8h5z" fill="${key==='autumn'?'#a87972':p.hill}"/></g>`;
  }
  svg+=`<path d="M0 112h31v-6h37v4h34v-7h39v5h35v-3h41v5h23v60H0z" fill="${p.grass}"/>`;
  svg+=`<path d="M0 152h28v5h31v-3h47v7h33v-4h40v-7h28v4h33v16H0z" fill="${p.earth}"/>`;
  const path=key==='snow'?'#b4c9d7':key==='cosmic'?'#d1abcc':'#a6a395';
  svg+=`<path d="M107 112h14v9h13v11h17v11h13v11h-28v-8h-18v-11h-13v-13h-9v-5h11z" fill="${path}" opacity=".5"/>`;
  for(let i=0;i<65;i++){const x=4+(i*53)%233,y=116+(i*17)%39;svg+=R(x,y,2,1,i%5===0?p.light:p.hill);if(i%6===0)svg+=R(x+1,y-2,1,2,p.hill);}
  if(key==='pond'){svg+=`<path d="M28 125h42v4h12v13H70v5H26v-5H16v-10h12z" fill="#5695aa"/>`+R(28,132,26,2,'#aed3da')+R(48,141,20,1,'#aed3da');}
  if(key==='cosmic')svg+=R(49,35,3,3,'#c4a0ee')+R(48,36,5,1,'#eed5f5');
  if(key==='snow')for(let i=0;i<38;i++)svg+=R(5+(i*37)%230,25+(i*19)%126,1,2,'#eef3fa');
  svg+=R(0,167,240,3,p.earth);
  return `<svg class="scenery-svg" viewBox="0 0 240 170" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges" aria-hidden="true">${svg}</svg>`;
}
