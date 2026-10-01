/* LumaNote 0.5.5 — Sakura collection. Additive catalogue, no balance resets,
   no automatic purchases, and no new working-time or dependency requirements. */
const SAKURA_CATALOG055 = {
 jpTorii:['Sakura kapısı',1650,91,'garden','garden','Kırmızı ahşap kapı; bahçenin girişini çerçeveler.'],
 jpBonsai:['Çam bonsai',480,43,'garden','garden','Küçük saksıda katmanlı yeşil dallar.'],
 jpBlossomBonsai:['Çiçekli bonsai',700,46,'garden','garden','Pembe çiçekler ve turkuazla uyumlu sıcak bir saksı.'],
 jpKoiPond:['Koi havuzu',2400,105,'garden','water','Kendi içinde yüzen dört koi; dokununca suda halkalar oluşur.'],
 jpFrogPond:['Kurbağa göleti',1250,91,'garden','water','Nilüferler ve minik kurbağalar; dokununca küçük bir sıçrayış.'],
 jpRedBridge:['Kırmızı kemer köprü',950,84,'garden','garden','Kavisli ahşap yürüyüş köprüsü.'],
 jpBambooFountain:['Bambu su düzeneği',850,63,'garden','water','Yavaşça eğilen bambu ve taş kasede su damlaları.'],
 jpStoneBasin:['Taş su kasesi',520,56,'garden','water','Bambu kepçe ve serin renkli taş su kasesi.'],
 jpBambooGrove:['Bambu korusu',680,78,'garden','garden','Bahçede küçük bir yeşil sınır oluşturan bambular.'],
 jpBambooFence:['Bambu çit',420,61,'garden','garden','Düğümlü bambu çubuklarla sakin bir sınır.'],
 jpZenGarden:['Kum ve taş köşesi',1100,88,'garden','garden','Taranmış kum çizgileri, taşlar ve küçük yosunlar.'],
 jpMossPath:['Yosunlu adım taşları',260,58,'garden','garden','Yumuşak yeşiller ve çiçeklerle çevrili basamak taşları.'],
 jpPagoda:['Katlı taş fener',820,67,'garden','lights','Bahçeye yükseklik katan küçük bir taş kule.'],
 jpPaperLantern:['Kâğıt fener',400,56,'garden','lights','Akşam yumuşak ışıldayan kırmızı fener.'],
 jpLanternTrio:['Üçlü kırmızı fener',780,70,'garden','lights','Fener şenliği için üç farklı asılı kırmızı fener.'],
 jpBlossomLantern:['Çiçek desenli fener',640,65,'garden','lights','Açık renkli paneller üzerinde çiçekli dallar.'],
 jpDragonLantern:['Altın desenli fener',850,65,'garden','lights','Altın kıvrımları ve püskülleriyle kırmızı şenlik feneri.'],
 jpFestivalGarland:['Fener şenliği süsü',980,79,'garden','lights','Kırmızı fenerler, küçük yelpaze ve düğüm biçimli süsler.'],
 jpTeaPavilion:['Çay köşkü',2900,104,'garden','garden','Ahşap zemin, kâğıt paneller ve çiçekli bir çatı. Dekor olarak yerleşir.'],
 jpHanamiPicnic:['Çiçek seyri pikniği',620,59,'garden','garden','Pembe örtü, küçük atıştırmalık tepsisi ve çay.'],
 jpKoiFlags:['Rüzgârda koi süsleri',680,61,'garden','lights','Üç renkli balık biçimli bahçe süsü.'],
 jpWindChime:['Cam rüzgâr çanı',320,53,'garden','lights','Dokununca sallanan küçük bir çan; yalnızca görsel etkileşim.'],
 jpMoonBench:['Çiçekli dinlenme bankı',760,76,'garden','garden','Çiçeklerin altında sakin bir oturma köşesi.'],
 jpIrisPatch:['Süsen çiçekliği',360,49,'garden','garden','Mavi-mor süsenler ve uzun yeşil yapraklar.'],
 jpTatami:['Tatami köşesi',520,104,'home','home','Kulübe içinde desenli hasır zemin.'],
 jpShoji:['Kâğıt paravan',880,86,'home','home','Üç kanatlı açık renkli bölme.'],
 jpKotatsu:['Örtülü alçak masa',1250,87,'home','home','Yumuşak örtü ve küçük bir çay molası.'],
 jpFuton:['Yer yatağı',780,81,'home','home','Katmanlı kumaşlar ve çiçekli bir yorgan.'],
 jpTokonoma:['Çiçekli duvar nişi',950,78,'home','home','Çiçek çizimi, vazo ve ahşap sergileme nişi.'],
 jpMatchaSet:['Matcha tepsisi',380,46,'home','home','Ahşap tepsi üzerinde yeşil çay takımı.']
};
for (const [id,[name,price,size,group,category,description]] of Object.entries(SAKURA_CATALOG055)) {
 DECOR[id]={name,price,size,group,category,description,collection:'sakura055',roomOnly:group==='home'};
}
const SAKURA_FILTERS055=[['all','Tümü'],['garden','Bahçe'],['water','Su köşesi'],['lights','Fenerler'],['home','Ev içi']];
function sakuraTabs055(active) {
 return `<div class="shop-tabs054" role="tablist">${[['pets','Arkadaşlar'],['decor','Bahçe'],['sakura055','Sakura'],['home','Ev eşyaları'],['modes','Özel hava'],['scenery','Manzara']].map(([key,name])=>`<button role="tab" aria-selected="${active===key}" class="${active===key?'active':''}" data-action="shop-tab" data-tab="${key}">${name}</button>`).join('')}</div>`;
}
function sakuraCard055(id) {
 const v=DECOR[id],owned=owns('decor',id),animated=['jpKoiPond','jpFrogPond','jpBambooFountain','jpWindChime'].includes(id);
 return `<article class="shop-card sakura-card055"><button class="sakura-art055" data-action="sakura-detail055" data-item="${id}" aria-label="${esc(v.name)} ayrıntıları">${pixel(id,116)}${animated?`<span class="sakura-live055" aria-label="Hareketli model">${icon('spark',12)}</span>`:''}</button><small>${v.roomOnly?'Ev içi':v.category==='lights'?'Fener koleksiyonu':v.category==='water'?'Su köşesi':'Bahçe dekoru'}</small><h3>${esc(v.name)}</h3><button class="shop-buy ${owned?'owned':''}" data-action="${owned?'sakura-place055':'sakura-buy055'}" data-item="${id}">${owned?(v.roomOnly?'Eve yerleştir':'Yerleştir'):coinIcon(14)+' '+v.price.toLocaleString('tr-TR')}</button></article>`;
}
function renderSakuraShop055() {
 const filter=SAKURA_FILTERS055.some(x=>x[0]===UI.sakuraFilter055)?UI.sakuraFilter055:'all';
 const list=Object.keys(SAKURA_CATALOG055).filter(id=>filter==='all'||DECOR[id].category===filter);
 return `<div class="page shop054 sakura-shop055">${header('',true)}<div class="section-heading"><div><span class="eyebrow">ÇİÇEKLERİN ARASINDA</span><h1>Sakura</h1></div><div class="wallet-total">${coinIcon(23)}<strong>${wallet().toLocaleString('tr-TR')}</strong></div></div><div class="shop-guide">1 dakika odak = 3 jeton <button data-action="economy-info" class="icon-btn clear" aria-label="Jetonlar nasıl kazanılır?">${icon('info',16)}</button></div>${sakuraTabs055('sakura055')}<div class="sakura-intro055"><div class="sakura-mini055">${pixel('jpTorii',64)}${pixel('jpBonsai',38)}</div><div><strong>Kendi küçük bahçen.</strong><p>30 parça · tüm temalarda kullanılabilir.</p></div></div><div class="sakura-filters055" aria-label="Sakura koleksiyonu filtreleri">${SAKURA_FILTERS055.map(([key,name])=>`<button class="chip ${filter===key?'active':''}" aria-pressed="${filter===key}" data-action="sakura-filter055" data-filter="${key}">${name}</button>`).join('')}</div><div class="shop-grid">${list.map(sakuraCard055).join('')}</div></div>`;
}
const shopBeforeSakura055=renderShop;
renderShop=function(){return UI.shopTab==='sakura055'?renderSakuraShop055():shopBeforeSakura055().replace(/<div class="shop-tabs054" role="tablist">[\s\S]*?<\/div>/,()=>sakuraTabs055(UI.shopTab));};
function sakuraDetail055(id) {
 if(!Object.prototype.hasOwnProperty.call(SAKURA_CATALOG055,id))return;const v=DECOR[id],owned=owns('decor',id);
 sheet(v.name,`<div class="sakura-preview055">${pixel(id,192)}</div><p class="sakura-detail-copy055">${esc(v.description)}</p><p class="hint">${v.roomOnly?'Kulübenin içine yerleştirilir.':'Sakura modunu satın almak zorunda değilsin; her bahçede kullanılır.'}</p><button class="btn primary full" data-action="${owned?'sakura-place055':'sakura-buy055'}" data-item="${id}">${owned?'Yerleştir':coinIcon(16)+' '+v.price.toLocaleString('tr-TR')+' jetona al'}</button>`,'sakura-detail');
}
const actionBeforeSakura055=enhancedAction;
enhancedAction=async function(name,el,e){const d=el.dataset;
 if(name==='shop-tab'&&d.tab==='sakura055'){UI.shopTab='sakura055';render();return true;}
 if(name==='sakura-filter055'){if(SAKURA_FILTERS055.some(x=>x[0]===d.filter)){UI.sakuraFilter055=d.filter;render();}return true;}
 if(name==='sakura-detail055'){sakuraDetail055(d.item);return true;}
 if(name==='sakura-buy055'){if(!Object.prototype.hasOwnProperty.call(SAKURA_CATALOG055,d.item))return true;await buyItem('decor',d.item);if(owns('decor',d.item))closeSheet();return true;}
 if(name==='sakura-place055'){if(!Object.prototype.hasOwnProperty.call(SAKURA_CATALOG055,d.item))return true;UI.shopDestination054=!!DECOR[d.item].roomOnly;await placeOwned('decor',d.item);return true;}
 return actionBeforeSakura055(name,el,e);
};
