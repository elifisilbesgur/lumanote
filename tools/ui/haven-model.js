/* 0.5.7 — additional rooms are orthogonal to existing placement coordinates.
 * The old room:true flag is kept for compatibility; room assignments are additive.
 * No work credits, notes, previous purchases or test-wallet flags are reset. */
const SPACES057={
 salon:{name:'Salon',subtitle:'Evinin ilk odası',icon:'home',wall:'cream',floor:'oak'},
 kitchen:{name:'Mutfak',subtitle:'Sıcak bir mola',icon:'coffee',wall:'sage',floor:'tile'},
 bathroom:{name:'Banyo',subtitle:'Ferah ve sakin',icon:'drop',wall:'mist',floor:'tile'},
 lounge:{name:'Dinlenme odası',subtitle:'İkinci oturma odan',icon:'book',wall:'rose',floor:'walnut'},
 bedroom:{name:'Yatak odası',subtitle:'Günü yavaşlat',icon:'moon',wall:'night',floor:'oak'},
 greenhouse:{name:'Kış bahçem',subtitle:'Camların ardında küçük bir dünya',icon:'leaf',wall:'sage',floor:'stone'}
};
const WINTER057={
 wnSnowman057:['Atkılı kardan adam',420,54],wnSleigh057:['Hediye kızağı',1250,91],wnGiftTower057:['Hediye kulesi',380,60],wnWreath057:['Işıklı kapı çelengi',410,56],
 wnCandyArch057:['Şeker kamışı kemeri',1150,93],wnSnowGlobe057:['Karlı minik dünya',780,65],wnNutcracker057:['Fındıkkıran',690,67],wnReindeer057:['Altın boynuzlu geyik',990,73],
 wnToyTrain057:['Oyuncak tren',880,95],wnGingerHouse057:['Kurabiye ev',1470,89],wnGiftCart057:['Hediye arabası',710,71],wnWinterBench057:['Kış bankı',670,79],
 wnStringLights057:['Yıldız ışık dizisi',550,86],wnFestiveFence057:['Süslü ahşap çit',490,75],wnPostbox057:['Kuzey posta kutusu',420,62],wnCocoaStand057:['Sıcak çikolata tezgâhı',1350,96],
 wnLantern057:['Kar feneri',450,53],wnStar057:['Işıklı yıldız',590,60],wnSkatePond057:['Buz pisti',1800,113],wnCarolPiano057:['Şenlik piyanosu',1650,94],
 wnMittens057:['Kışlık örgü köşesi',340,53],wnStockings057:['Hediye çorapları',390,64],wnCandleRing057:['Kış mumluğu',380,51],wnPenguin057:['Atkılı penguen süsü',510,52]
};
const HALLOWEEN057={
 hwPumpkinArch057:['Balkabağı kemeri',1250,95],hwGhost057:['Dost hayalet',420,58],hwCauldron057:['Işıklı kazan',890,71],hwWitchHat057:['Cadı şapkası',430,59],
 hwBroom057:['Süpürge köşesi',360,61],hwBatTree057:['Yarasalı ağaç',1150,88],hwSpookyHouse057:['Şakacı hayalet evi',1850,100],hwBlackCat057:['Kara kedi süsü',520,54],
 hwCandyBowl057:['Şeker kasesi',330,52],hwLantern057:['Balkabağı feneri',480,65],hwScarecrow057:['Sonbahar korkuluğu',670,75],hwWebFence057:['Ağlı çit',490,80],
 hwRaven057:['Kuzgun tüneği',650,67],hwHayBale057:['Balkabaklı saman',370,66],hwMushrooms057:['Mor mantar kümesi',410,52],hwPotionShelf057:['İksir rafı',990,81],
 hwMoonGate057:['Hilalli gece kapısı',1420,95],hwGrave057:['Şakacı mezar taşı',490,65],hwBatGarland057:['Yarasa dizisi',480,87],hwCoffinPlanter057:['Gotik çiçeklik',760,76],
 hwPumpkinCart057:['Balkabağı arabası',850,83],hwAutumnBench057:['Sonbahar bankı',690,80],hwSpider057:['Minik örümcek ağı',390,64],hwSpellBook057:['Büyülü kitap masası',920,74]
};
const FURNITURE057={
 ghShelf057:['Sera bitki rafı',670,85,'greenhouse'],ghHanging057:['Sarkan sarmaşık',320,61,'greenhouse'],ghChair057:['Hasır okuma koltuğu',550,74,'greenhouse'],ghSofa057:['Keten kış kanepesi',920,101,'greenhouse'],
 ghPotting057:['Saksılama tezgâhı',760,88,'greenhouse'],ghSeedCabinet057:['Tohum dolabı',650,76,'greenhouse'],ghTerrarium057:['Cam teraryum',470,57,'greenhouse'],ghOrchid057:['Orkide saksısı',340,51,'greenhouse'],
 ghCitrus057:['Limon ağacı',790,78,'greenhouse'],ghBasket057:['Hasır kitap sepeti',280,51,'greenhouse'],
 htDining057:['Yemek masası',820,93,'kitchen'],htFridge057:['Retro buzdolabı',980,79,'kitchen'],htSink057:['Mutfak evyesi',610,78,'kitchen'],htStove057:['Ocak ve fırın',850,76,'kitchen'],htCabinet057:['Mutfak dolabı',620,80,'kitchen'],
 htBath057:['Ayaklı küvet',890,95,'bathroom'],htToilet057:['Seramik klozet',450,58,'bathroom'],htVanity057:['Aynalı lavabo',730,79,'bathroom'],htShower057:['Cam duş',920,91,'bathroom'],htTowels057:['Havlu merdiveni',340,63,'bathroom']
};
for(const [catalog,collection] of [[WINTER057,'winter057'],[HALLOWEEN057,'halloween057']])for(const [id,[name,price,size]]of Object.entries(catalog))DECOR[id]={name,price,size,collection,category:'festival',group:'garden',roomOnly:false,description:'Tek seferlik dekor satın alımı. Özel hava modu gerektirmez; bahçene veya bir odana yerleştir.'};
for(const [id,[name,price,size,recommendedRoom]] of Object.entries(FURNITURE057))DECOR[id]={name,price,size,group:'home',roomOnly:true,collection:'interior057',recommendedRoom,description:'Bir odana veya kış bahçene yerleştir. Konumu ve sahipliği korunur.'};
const newLivingBefore057=newLiving;
newLiving=function(state,raw){const l=newLivingBefore057(state,raw),old=raw?.rooms057||{};l.rooms057={version:1,assignments:{},styles:{}};
 for(const [key,space]of Object.entries(cleanMap(old.assignments)))if(Object.hasOwn(SPACES057,space)&&l.placement[key]?.room)l.rooms057.assignments[key]=space;
 for(const [id,def]of Object.entries(SPACES057)){const style=old.styles?.[id]||{},fallbackWall=id==='salon'?l.roomWall:def.wall,fallbackFloor=id==='salon'?l.roomFloor:def.floor;
  l.rooms057.styles[id]={wall:['cream','sage','rose','night','mist'].includes(style.wall)?style.wall:fallbackWall,floor:['oak','walnut','light','tile','stone'].includes(style.floor)?style.floor:fallbackFloor};}
 return l;
};
function currentSpace057(){return UI.gardenRoom?(Object.hasOwn(SPACES057,UI.interior057)?UI.interior057:'salon'):'garden';}
function itemSpace057(p){return p.pos.room?(S.living.rooms057?.assignments[p.key]||'salon'):'garden';}
function openSpace057(id){if(!Object.hasOwn(SPACES057,id))return;UI.interior057=id;UI.gardenRoom=true;UI.gardenEdit=false;UI.groundBrush=null;UI.selectedLiving=null;UI.shopInterior057=id;UI.shopDestination054=true;closeSheet();UI.route='garden';render();}
function exitSpace057(){UI.gardenRoom=false;UI.gardenEdit=false;UI.groundBrush=null;UI.selectedLiving=null;UI.shopDestination054=false;closeSheet();render();}
// Interior projection is invertible; original saved coordinates stay untouched.
function interiorPoint057(pos){return {x:24+(pos.x-30)*312/420,y:175+(pos.y-88)*261/204};}
function interiorLayout057(p){return {x:clamp(30+(p.x-24)*420/312,30,450),y:clamp(88+(p.y-175)*204/261,88,292),room:true};}
const constrainBefore057=constrainPlacement054;
constrainPlacement054=function(key,pos){if(!pos.room)return constrainBefore057(key,pos);const id=key.slice(key.indexOf(':')+1),size=(DECOR[id]?.size||36)*.92,p=interiorPoint057(pos);return interiorLayout057({x:clamp(p.x,12+size/2,348-size/2),y:clamp(p.y,158+size*.6,441)});};
