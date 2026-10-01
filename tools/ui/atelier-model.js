/* 0.5.6: additive catalogues. The original Sakura IDs stay identical, preserving
   purchases and placement. No currency, timer or note normalization reset. */
const ANATOLIA056={
 trTea056:['İnce belli çay',220,39,'Her iki alana da yerleştirilebilen çay bardağı ve desenli tabağı.'],
 trKettle056:['Bakır çaydanlık',540,57,'İki katlı bakır çaydanlık, küçük bardak ve hafif buhar.'],
 trKilim056:['Anadolu kilimi',880,91,'Bordo, lacivert ve krem geometrik motiflerle özgün kilim.'],
 trNazar056:['Nazar boncuğu',280,44,'Mavi cam halkalı asma süs.'],
 trCoffee056:['Çini kahve fincanı',320,39,'Turkuaz ve lacivert çini desenli kahve fincanı.'],
 trCezve056:['Bakır cezve',430,48,'Bakır işlemeli cezve, minik ocak ve hafif buhar.'],
 trCandle056:['Pirinç şamdan',290,44,'Yumuşakça titreşen mum ışığı.'],
 trEwer056:['İşlemeli ibrik',610,58,'Uzun boyunlu, bakır ve gül tonlarında bir ibrik.'],
 trCushions056:['Kilim minderleri',380,53,'İki desenli yer minderi.'],
 trTray056:['Bakır ikram tepsisi',450,56,'Çay, kahve ve küçük ikramlar için işlemeli tepsi.'],
 trTeaTable056:['Çay bahçesi masası',990,82,'İki tabure, çaydanlık ve bardaklarla hazır bir köşe.'],
 trTile056:['Çini taş döşeme',240,61,'Lacivert ve turkuaz karolu küçük bir zemin parçası.']
};
for(const [id,[name,price,size,description]] of Object.entries(ANATOLIA056))DECOR[id]={name,price,size,description,group:'garden',category:'anatolia',collection:'anatolia056',roomOnly:false};
const placementsBefore056=livingPlacements;
livingPlacements=function(){const list=placementsBefore056();for(const [i,m] of S.living.memorials.entries())if(!m.hidden){const key='memorial:'+m.id;list.push({key,type:'memorial',item:m.id,pos:S.living.placement[key]||{x:162+(i%5)*32.3,y:226+Math.floor(i/5)*19,room:false}});}return list;};
function collectionTabs056(active){return `<div class="shop-tabs054 atelier-tabs056" role="tablist">${[['pets','Arkadaşlar'],['decor','Bahçe'],['sakura055','Japon · Sakura'],['anatolia056','Çay & Kilim'],['home','Ev eşyaları'],['modes','Özel hava'],['scenery','Manzara']].map(([id,label])=>`<button role="tab" aria-selected="${active===id}" class="${active===id?'active':''}" data-action="shop-tab" data-tab="${id}">${label}</button>`).join('')}</div>`;}
sakuraTabs055=collectionTabs056;
function anatoliaCard056(id){const a=DECOR[id],owned=owns('decor',id);return `<article class="shop-card sakura-card055"><button class="sakura-art055" data-action="atelier-detail056" data-item="${id}" aria-label="${esc(a.name)} ayrıntıları">${pixel(id,116)}</button><small>Çay & Kilim · bahçe / ev</small><h3>${esc(a.name)}</h3><button class="shop-buy ${owned?'owned':''}" data-action="${owned?'atelier-place056':'atelier-buy056'}" data-item="${id}">${owned?'Yerleştir':coinIcon(14)+' '+a.price.toLocaleString('tr-TR')}</button></article>`;}
function collectionsShortcut056(){return `<section class="collection-shortcuts056" aria-label="Dekor koleksiyonları"><button data-action="collection-open056" data-tab="sakura055">${pixel('jpTorii',54)}<span><strong>Japon · Sakura</strong><small>30 parça · kataloğu aç</small></span>${icon('chevron',14)}</button><button data-action="collection-open056" data-tab="anatolia056">${pixel('trTea056',52)}<span><strong>Çay & Kilim</strong><small>12 yeni parça</small></span>${icon('chevron',14)}</button></section>`;}
const shopBeforeAtelier056=renderShop;
renderShop=function(){if(UI.shopTab==='anatolia056')return `<div class="page shop054 atelier-shop056">${header('',true)}<div class="section-heading"><div><span class="eyebrow">KÜÇÜK BİR MOLA</span><h1>Çay & Kilim</h1></div></div><div class="shop-guide">${coinIcon(16)} ${wallet().toLocaleString('tr-TR')} jeton</div>${collectionTabs056('anatolia056')}<div class="shop-grid">${Object.keys(ANATOLIA056).map(anatoliaCard056).join('')}</div></div>`;
 let html=shopBeforeAtelier056();html=html.replace(/<div class="shop-tabs054[^\"]*" role="tablist">[\s\S]*?<\/div>/,()=>collectionTabs056(UI.shopTab));
 if(UI.shopTab!=='sakura055')html=html.replace('<div class="shop-grid">',collectionsShortcut056()+'<div class="shop-grid">');return html;};
function atelierDetail056(id){const a=DECOR[id];if(!ANATOLIA056[id])return;sheet(a.name,`<div class="sakura-preview055">${pixel(id,172)}</div><p class="hint">${esc(a.description)}</p><button class="btn primary full" data-action="${owns('decor',id)?'atelier-place056':'atelier-buy056'}" data-item="${id}">${owns('decor',id)?'Yerleştir':coinIcon(15)+' '+a.price+' jetona al'}</button>`,'atelier-detail');}
const atelierAction055=enhancedAction;
enhancedAction=async function(name,el,e){const d=el.dataset;
 if(name==='shop-tab'&&d.tab==='anatolia056'){UI.shopTab=d.tab;render();return true;}
 if(name==='collection-open056'){if(!['sakura055','anatolia056'].includes(d.tab))return true;UI.shopTab=d.tab;closeSheet();route('shop');return true;}
 if(name==='atelier-detail056'){atelierDetail056(d.item);return true;}
 if(name==='atelier-buy056'){if(ANATOLIA056[d.item]){await buyItem('decor',d.item);if(owns('decor',d.item))closeSheet();}return true;}
 if(name==='atelier-place056'){if(!ANATOLIA056[d.item]||!owns('decor',d.item))return true;sheet('Nereye yerleştirelim?',`<div class="sakura-preview055">${pixel(d.item,100)}</div><button class="btn primary full" data-action="atelier-destination056" data-item="${d.item}" data-room="false">Bahçeye</button><button class="btn ghost full" data-action="atelier-destination056" data-item="${d.item}" data-room="true">Kulübeye</button>`,'atelier-place');return true;}
 if(name==='atelier-destination056'){if(ANATOLIA056[d.item]&&owns('decor',d.item)){UI.shopDestination054=d.room==='true';UI.gardenRoom=UI.shopDestination054;await placeOwned('decor',d.item);}return true;}
 return atelierAction055(name,el,e);
};
