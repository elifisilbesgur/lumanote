/* Schema 3 extension. Wallet credits, original note IDs and planted-at times are
   not reset. Seasonal licences are ordinary permanent coin purchases. */
const ATMOSPHERES054={
 normal:{name:'Klasik bahçe',price:0,item:null},
 sakura:{name:'Sakura bahçesi',price:4500,item:'modeSakura',weather:'clear',time:'day',description:'Pembe ağaçlar, çiçekli çatı ve dökülen taç yaprakları.'},
 winter:{name:'Yılbaşı bahçesi',price:6300,item:'modeWinter',weather:'snow',time:'night',description:'Beyaz zemin, süslü çamlar, hediyeler ve ışıklı kulübe.'},
 halloween:{name:'Cadılar Bayramı',price:5400,item:'modeHalloween',weather:'clear',time:'dusk',description:'Sonbahar yaprakları, balkabakları ve şakacı bir korkuluk.'}
};
const ADDITIONS054={
 vegetablePatch:['Sebze yatağı',180,40],cobbledPath:['Çiçekli taş patika',140,42],wateringCan:['Çiçekli sulama kabı',160,34],
 topiaryBall:['Katlı süs ağacı',260,47],topiarySpiral:['Spiral şimşir',320,51],topiaryCone:['Çiçekli servi',280,45],
 pergola:['Fenerli pergola',650,75],roseArch:['Gül kemerli bank',620,72],ivyGate:['Sarmaşık kapısı',390,66],gardenSwing:['Güllü salıncak',720,76],
 gazebo:['Bahçe çardağı',1200,88],plantShelf:['Çiçek rafı',310,55],picnicBasket:['Piknik sepeti',150,31],hangingHive:['Asılı kovan',220,44],
 scarecrow:['Hasır korkuluk',350,48],windmill:['Küçük yel değirmeni',800,73],mailbox:['Bahçe posta kutusu',190,39],wishingWell:['Dilek kuyusu',570,62],bridge:['Ahşap köprü',380,61],
 butterflyHouse:['Kelebek evi',280,46],birdbath:['Kuş banyosu',290,47],sundial:['Güneş saati',300,45],logPile:['Odun yığını',110,37],wheelPlanter:['Tekerlekli çiçeklik',330,49],pondLilies:['Nilüfer adası',240,39],
 stoneLantern:['Taş fener',360,46],mushroomHouse:['Mantar evi',700,62],duckHouse:['Ördek kulübesi',390,50],flowerBarrel:['Çiçek fıçısı',240,43],roseBush:['Gül çalısı',210,43],hedge:['Çiçek çiti',190,40],lampPost:['Sokak feneri',260,48],
 sakuraTree:['Sakura ağacı',900,64],festiveTree:['Süslü çam',1100,66],pumpkinDisplay:['Balkabağı köşesi',420,42]
};
for(const [id,[name,price,size]]of Object.entries(ADDITIONS054))DECOR[id]={name,price,size,group:'garden'};
const FURNITURE054={
 sofa:['Lavanta kanepe',620,82],sofaSage:['Adaçayı kanepe',650,82],armchair:['Okuma koltuğu',370,63],television:['Piksel televizyon',760,73],fireplace:['Şömine',900,79],
 coffeeTable:['Orta sehpa',230,64],bookcase:['Kitaplık',420,74],bed:['Yumuşak yatak',550,80],desk:['Çalışma masası',450,81],deskChair:['Masa sandalyesi',170,52],rug:['Dokuma halı',260,104],rugRound:['Yuvarlak halı',260,99],
 plantIndoor:['Salon bitkisi',140,48],floorLamp:['Okuma lambası',220,56],aquarium:['Akvaryum',540,66],wallClock:['Duvar saati',210,45],pianoUpright:['Duvar piyanosu',1200,81],kitchenette:['Mutfak köşesi',950,91],
 windowCurtains:['Perdeli pencere',380,75],basketBlankets:['Battaniye sepeti',170,46],teaSet:['Çay tepsisi',160,44],sideTable:['Komodin',200,56],recordPlayer:['Pikap',540,63]
};
for(const [id,[name,price,size]]of Object.entries(FURNITURE054))DECOR[id]={name,price,size,group:'home',roomOnly:true};
for(const [id,v]of Object.entries(DECOR)){if(!v.group)v.group=id.startsWith('pot')?'pots':'garden';if(!v.size)v.size=({bench:47,birdhouse:36,beehive:40,flowers:46,fountain:52,lantern:40,tent:57,fence:43,picnic:54,catbed:35})[id]||32;}
for(const [key,m]of Object.entries(ATMOSPHERES054))if(m.item)DECOR[m.item]={name:m.name,price:m.price,group:'modes',placeable:false,size:64,mode:key};
function ownsAtmosphere054(mode,state=S){const a=ATMOSPHERES054[mode];return mode==='normal'||!!(a&&state.world.purchases.some(p=>p.type==='decor'&&p.item===a.item));}
function atmosphere054(){return ownsAtmosphere054(S.living.atmosphere)?S.living.atmosphere:'normal';}
const newLiving053=newLiving;
newLiving=function(state,raw){const l=newLiving053(state,raw);l.edition054=1;l.atmosphere=ATMOSPHERES054[raw?.atmosphere]&&ownsAtmosphere054(raw.atmosphere,state)?raw.atmosphere:'normal';l.cabinInitialized=!!raw?.cabinInitialized;
 if(l.weather==='auto')l.weather=state.world.background==='pond'?'rain':state.world.background==='snow'?'snow':'clear';
 if(l.time==='auto')l.time=({night:'night',cosmic:'night',meadow:'day',pond:'dusk',autumn:'dusk',snow:'day'})[state.world.background]||'night';
 l.roomDevices={television:raw?.roomDevices?.television!==false,fireplace:raw?.roomDevices?.fireplace!==false,aquarium:raw?.roomDevices?.aquarium!==false};
 l.roomWall=['cream','sage','rose','night'].includes(raw?.roomWall)?raw.roomWall:'cream';
 l.roomFloor=['oak','walnut','light'].includes(raw?.roomFloor)?raw.roomFloor:'oak';return l;};
function initializeCabin054(state){if(state.living.cabinInitialized)return;state.living.cabinInitialized=true;
 // The four built-in pieces from 0.5.3 become movable, free-owned furniture.
 for(const [item,x,y]of [['rug',247,218],['bookcase',116,173],['desk',310,161],['bed',355,251]]){
  if(!state.world.purchases.some(p=>p.type==='decor'&&p.item===item))state.world.purchases.push({id:'cabin054:'+item,type:'decor',item,cost:0,at:new Date().toISOString(),origin:'existing-cabin'});
  if(!state.world.layout.some(p=>p.type==='decor'&&p.item===item))state.world.layout.push({id:'cabin054:'+item,type:'decor',item,x:50,y:75});
  if(!state.living.placement['decor:'+item])state.living.placement['decor:'+item]={x,y,room:true};
 }
}
const normalize053Polish=normalize;
normalize=function(raw){const state=normalize053Polish(raw);initializeCabin054(state);return state;};
const fresh053Polish=fresh;
fresh=function(){const state=fresh053Polish();initializeCabin054(state);return state;};
let seasonalBusy054=false;
async function setAtmosphere054(key){if(!ATMOSPHERES054[key]||!ownsAtmosphere054(key))return;const prior=structuredClone(S.living);S.living.atmosphere=key;const a=ATMOSPHERES054[key];if(key!=='normal'){S.living.weather=a.weather;S.living.time=a.time;}else{S.living.weather=S.world.background==='snow'?'snow':S.world.background==='pond'?'rain':'clear';S.living.time=({night:'night',cosmic:'night',meadow:'day',pond:'dusk',autumn:'dusk',snow:'day'})[S.world.background]||'day';}
 try{await persist(true);}catch(e){S.living=prior;throw e;}closeSheet();render();toast(a.name+' seçildi.');}
async function purchaseAtmosphere054(key){const a=ATMOSPHERES054[key];if(!a||key==='normal'||seasonalBusy054)return;if(ownsAtmosphere054(key)){await setAtmosphere054(key);return;}if(wallet()<a.price){toast(`${a.price-wallet()} jeton daha gerekiyor.`,4000);return;}
 seasonalBusy054=true;try{
 if(!await confirmAction(a.name,`${a.price.toLocaleString('tr-TR')} jeton harcanacak. Mod kalıcı olarak açılır; tekrar kullanırken jeton ödemezsin.`,`${a.price.toLocaleString('tr-TR')} jetona al`))return;
 if(ownsAtmosphere054(key)||wallet()<a.price)return;const beforeWorld=structuredClone(S.world),beforeLiving=structuredClone(S.living);
 try{S.world.purchases.push({id:uid(),type:'decor',item:a.item,cost:a.price,at:new Date().toISOString()});S.living.atmosphere=key;S.living.weather=a.weather;S.living.time=a.time;await persist(true);render();toast(a.name+' senin.');}catch(e){S.world=beforeWorld;S.living=beforeLiving;throw e;}
 }finally{seasonalBusy054=false;}
}
