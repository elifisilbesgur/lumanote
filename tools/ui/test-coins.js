/* LumaNote 0.5.4 – removable DEVELOPMENT test wallet. No artificial study time.
   Allowed only by the React Native __DEV__ gate in App.tsx. Browser preview and
   production default to OFF. Keep this migration installed until test data has
   been cleaned; it also removes test purchases on the first production load. */
const LUMA_TEST_COINS_SWITCH = false;
const TEST_COINS_AMOUNT = 100000000;
const TEST_COINS_KEY = 'lumaTestWalletV1';
const TEST_COINS_ACTIVE = LUMA_TEST_COINS_SWITCH && window.LUMA_TEST_COINS_ALLOWED === true;
function testCoinsLedger(state){
 const x=state?.preferences?.[TEST_COINS_KEY];
 if(x===undefined)return null;
 if(!x||x.version!==1||x.amount!==TEST_COINS_AMOUNT||!Array.isArray(x.originalPurchaseIds)||x.originalPurchaseIds.length>10000||!x.originalPurchaseIds.every(id=>typeof id==='string'))throw new Error('Test jetonu kaydı okunamadı. Verilerin silinmedi; yedeğini koru.');
 return x;
}
function ensureTestCoins(state){
 if(!TEST_COINS_ACTIVE)return state;
 if(!testCoinsLedger(state))state.preferences[TEST_COINS_KEY]={version:1,amount:TEST_COINS_AMOUNT,createdAt:new Date().toISOString(),originalPurchaseIds:state.world.purchases.map(p=>String(p.id)),companion:state.preferences.companion,pot:state.world.pot,atmosphere:state.living.atmosphere,weather:state.living.weather,time:state.living.time};
 return state;
}
function testCoinsBreakdown(state=S){
 const ledger=testCoinsLedger(state),purchases=state.world.purchases,total=worldSeconds(state.world),living=state.living;
 const earned=living?living.baseCoins+Math.floor(Math.max(0,total-living.baseSeconds)/20):Math.floor(total/60);
 const original=new Set(ledger?.originalPurchaseIds||purchases.map(p=>String(p.id)));
 let realSpent=0,testSpent=0;
 for(const p of purchases){const cost=Math.max(0,Number(p.cost)||0);if(ledger&&!original.has(String(p.id)))testSpent+=cost;else realSpent+=cost;}
 // At catalogue prices this budget exceeds all items combined. If it is ever
 // exhausted, overflow uses real earnings; disabling testing refunds that part.
 const overflow=Math.max(0,testSpent-(ledger?.amount||0));
 return {real:Math.max(0,earned-realSpent-overflow),test:ledger?Math.max(0,ledger.amount-testSpent):0,testSpent};
}
function cleanTestCoins(raw){
 const ledger=testCoinsLedger(raw);if(!ledger)return raw;
 const out=structuredClone(raw),original=new Set(ledger.originalPurchaseIds);
 const removed=(out.world?.purchases||[]).filter(p=>!original.has(String(p.id))&&Number(p.cost)>0);
 const keys=new Set(removed.map(p=>p.type+':'+p.item));
 out.world.purchases=out.world.purchases.filter(p=>!keys.has(p.type+':'+p.item));
 out.world.layout=(out.world.layout||[]).filter(p=>!keys.has(p.type+':'+p.item));
 if(out.living?.placement)for(const key of keys)delete out.living.placement[key];
 if(keys.has('pet:'+out.preferences.companion))out.preferences.companion=ledger.companion||'bunny';
 if(keys.has('decor:'+out.world.pot))out.world.pot=ledger.pot||'clay';
 if(keys.has('decor:'+ATMOSPHERES054[out.living?.atmosphere]?.item)){
  out.living.atmosphere=ledger.atmosphere||'normal';out.living.weather=ledger.weather||'clear';out.living.time=ledger.time||'night';
 }
 delete out.preferences[TEST_COINS_KEY];
 return out;
}
const normalizeBeforeTestCoins=normalize;
normalize=function(raw){return ensureTestCoins(normalizeBeforeTestCoins(TEST_COINS_ACTIVE?raw:cleanTestCoins(raw)));};
const freshBeforeTestCoins=fresh;
fresh=function(){return ensureTestCoins(freshBeforeTestCoins());};
const walletBeforeTestCoins=wallet;
wallet=function(w=S.world){if(TEST_COINS_ACTIVE&&typeof S!=='undefined'&&S&&w===S.world&&testCoinsLedger(S)){const b=testCoinsBreakdown();return b.real+b.test;}return walletBeforeTestCoins(w);};
const headerBeforeTestCoins=header;
header=function(...args){let html=headerBeforeTestCoins(...args);if(TEST_COINS_ACTIVE)html=html.replace('class="wallet-chip"','class="wallet-chip test-wallet-chip"');return html;};
const settingsBeforeTestCoins=renderSettings;
renderSettings=function(){const html=settingsBeforeTestCoins();if(!TEST_COINS_ACTIVE)return html;const b=testCoinsBreakdown();return html.replace('</h1></div>','</h1></div>'+`<section class="card flat test-coins-card" aria-label="Test jetonları"><span class="eyebrow">GELİŞTİRİCİ TESTİ</span><h2>100.000.000 test jetonu</h2><p>Kalan test bakiyesi: <strong>${b.test.toLocaleString('tr-TR')}</strong></p><p>Çalışma bakiyen: <strong>${b.real.toLocaleString('tr-TR')}</strong></p><p>Test alışverişleri gerçek bakiyeni kullanmaz. Test kapatılınca bu bakiyeyle alınan öğeler kaldırılır; notların, çalışma geçmişin ve yetiştirdiğin bitkiler kalır.</p></section>`);};
const shopBeforeTestCoins=renderShop;
renderShop=function(){let html=shopBeforeTestCoins();if(!TEST_COINS_ACTIVE)return html;html=html.replace('class="page shop054"','class="page shop054 test-coins-shop"');return html.replace('<div class="shop-guide">','<div class="test-coins-caption">TEST BAKİYESİ ETKİN · '+testCoinsBreakdown().test.toLocaleString('tr-TR')+' jeton</div><div class="shop-guide">');};
if(TEST_COINS_ACTIVE){const style=document.createElement('style');style.textContent=`
.test-wallet-chip{padding:0 8px;font-size:10px;gap:4px;white-space:nowrap}.test-wallet-chip [data-wallet]{font-variant-numeric:tabular-nums}.test-wallet-chip:after{content:'T';font-size:8px;color:var(--accent)}
.test-coins-card{padding:18px;margin:0 0 18px}.test-coins-card h2{font-size:18px;margin:10px 0}.test-coins-card p{font-size:12px;line-height:1.6;color:var(--muted);margin:8px 0}.test-coins-card strong{color:var(--text)}
.test-coins-shop>.section-heading{flex-wrap:wrap}.test-coins-shop .wallet-total strong{font-size:19px}.test-coins-caption{font-size:10px;color:var(--accent);margin:0 0 18px}
@media(max-width:359px){.header:has(.test-wallet-chip) .wordmark{font-size:25px}.header:has(.test-wallet-chip) .wordmark small{font-size:6px;letter-spacing:1.5px}.header:has(.test-wallet-chip){gap:3px}.header:has(.test-wallet-chip) .header-tools{gap:1px}.header:has(.test-wallet-chip) .pet-header{width:26px}.header:has(.test-wallet-chip) .pet-header svg{width:26px}.header:has(.test-wallet-chip) .icon-btn{min-width:30px;width:30px}.test-wallet-chip{padding:0 5px}}
`;document.head.append(style);}
