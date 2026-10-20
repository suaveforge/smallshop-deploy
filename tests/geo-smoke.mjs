import {spawn,spawnSync} from 'node:child_process';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const origin='https://smallshop.suaveforge.com';
const artifacts=join(process.cwd(),'map-qa-artifacts');
mkdirSync(artifacts,{recursive:true});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const binary=['google-chrome','google-chrome-stable','chromium','chromium-browser']
  .find(name=>spawnSync('which',[name],{stdio:'ignore'}).status===0);
if(!binary)throw Error('Chrome/Chromium unavailable on runner');
if(typeof WebSocket!=='function')throw Error('Node 22 WebSocket not found');
const profile=mkdtempSync(join(tmpdir(),'smshop-chrome-'));
const chrome=spawn(binary,[
 '--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage',
 '--remote-allow-origins=*','--remote-debugging-port=9229','--no-first-run',
 '--window-size=1366,920','--user-data-dir='+profile,'about:blank'
],{stdio:['ignore','ignore','pipe']});
let ws,id=0;const requests=new Map(),errors=[];
function cdp(method,params={},timeout=20000){
 return new Promise((resolve,reject)=>{
  const n=++id;
  const timer=setTimeout(()=>{requests.delete(n);reject(Error('CDP timeout '+method));},timeout);
  requests.set(n,{resolve,reject,timer});
  ws.send(JSON.stringify({id:n,method,params}));
 });
}
async function attach(){
 let url=null;
 for(let n=0;n<32;n++){
  try{
   const resp=await fetch('http://127.0.0.1:9229/json');
   const list=await resp.json();
   url=list.find(x=>x.type==='page')?.webSocketDebuggerUrl;
   if(url)break;
  }catch{}
  await sleep(500);
 }
 if(!url)throw Error('Chrome remote debugging endpoint did not start');
 await new Promise((resolve,reject)=>{
   ws=new WebSocket(url);
   ws.addEventListener('open',resolve,{once:true});
   ws.addEventListener('error',reject,{once:true});
 });
 ws.addEventListener('message',evt=>{
   const m=JSON.parse(evt.data);
   if(m.id && requests.has(m.id)){
     const task=requests.get(m.id);requests.delete(m.id);clearTimeout(task.timer);
     m.error?task.reject(Error(JSON.stringify(m.error))):task.resolve(m.result||{});
   }
   if(m.method==='Runtime.exceptionThrown')errors.push(m.params?.exceptionDetails?.text||'Unknown page JS error');
 });
 await cdp('Page.enable');
 await cdp('Runtime.enable');
}
async function evalJS(expr){
 const out=await cdp('Runtime.evaluate',{expression:expr,returnByValue:true,awaitPromise:true},20000);
 if(out.exceptionDetails)throw Error('Page exception '+JSON.stringify(out.exceptionDetails).slice(0,700));
 return out.result?.value;
}
async function navigate(path){
 await cdp('Page.navigate',{url:origin+path});
 await sleep(1000);
}
async function poll(expr,description,waitMs=43000){
 let state={};
 const until=Date.now()+waitMs;
 while(Date.now()<until){
  try{state=await evalJS(expr);if(state?.ready)return state;}
  catch(e){state={error:String(e)}}
  await sleep(1300);
 }
 throw Error(description+' did not become ready: '+JSON.stringify(state));
}
async function screen(file){
 const r=await cdp('Page.captureScreenshot',{format:'png',captureBeyondViewport:false},25000);
 writeFileSync(join(artifacts,file),Buffer.from(r.data,'base64'));
}
const stateExpr='(()=>{const root=document.querySelector("[data-smallshop-map]");if(!root)return {ready:false,url:location.href,reason:"map root missing"};const canvas=root.querySelector(".store-map-canvas");return {ready:!!window.L&&!!canvas?.classList.contains("leaflet-container")&&canvas.querySelectorAll(".leaflet-tile-loaded").length>0&&canvas.querySelectorAll(".leaflet-marker-icon").length>0,leaflet:!!window.L,initialized:!!canvas?.classList.contains("leaflet-container"),tiles:canvas?.querySelectorAll(".leaflet-tile-loaded").length||0,markers:canvas?.querySelectorAll(".leaflet-marker-icon").length||0,mode:root.dataset.mapMode,storeCount:window.smallshopMapStores?.length||0,description:root.querySelector(".store-map-heading p")?.textContent||"",url:location.href}})()';
try{
 await attach();
 await navigate('/regions/');
 const national=await poll(stateExpr,'National OSM map');
 console.log('PASS national real map',JSON.stringify(national));
 const vendor=await evalJS('(()=>({scripts:performance.getEntriesByType("resource").map(x=>x.name).filter(x=>x.includes("leaflet")),local:!!document.querySelector("link[href*=\\\"vendor/leaflet\\\"]")}))()');
 if(!vendor.scripts.some(s=>s.includes('/assets/vendor/leaflet-1.9.4.min.js'))||vendor.scripts.some(s=>s.includes('unpkg.com')))throw Error('Leaflet still depends on external CDN '+JSON.stringify(vendor));
 console.log('PASS first-party Leaflet runtime without third-party script',JSON.stringify(vendor));

 if(national.storeCount!==6)throw Error('Six demo shops not found');
 await screen('01-national-map.png');

 // Every filter drives both visible pins and the linked list, not just its own label.
 const filters=await evalJS('(()=>{const root=document.querySelector("[data-smallshop-map]");return [...root.querySelectorAll("[data-map-category]")].map(x=>({name:x.dataset.mapCategory,count:x.querySelector("span")?.textContent}))})()');
 if(filters.map(x=>x.name).join('|')!=='전체|간식·빵|반찬|차·음료')throw Error('Category filter choices incorrect: '+JSON.stringify(filters));
 console.log('PASS category chips',JSON.stringify(filters));
 const savory=await evalJS('(()=>{const root=document.querySelector("[data-smallshop-map]");root.querySelector("[data-map-category=\\"반찬\\"]").click();const state=root.__smallshopMapState;return {category:state.category,layerCount:state.layer.getLayers().length,visibleRows:[...root.querySelectorAll("[data-map-item]")].filter(x=>!x.hidden).map(x=>x.dataset.mapItem),status:root.querySelector(".store-map-count")?.textContent}})()');
 if(savory.category!=='반찬'||savory.visibleRows.length!==2||!savory.visibleRows.includes('busan-eomuk')||!savory.visibleRows.includes('jeonju-pickle'))throw Error('Category filter/list sync failed '+JSON.stringify(savory));
 console.log('PASS shared filter/map/list',JSON.stringify(savory));
 const filteredList=await evalJS('(()=>{const root=document.querySelector("[data-smallshop-map]");root.querySelector("[data-map-view=list]").click();return {listVisible:!root.querySelector(".store-map-list").hidden,shown:[...root.querySelectorAll("[data-map-item]")].filter(x=>!x.hidden).map(x=>x.dataset.mapItem)}})()');
 if(!filteredList.listVisible||filteredList.shown.length!==2)throw Error('Filtered list mode failed '+JSON.stringify(filteredList));
 console.log('PASS list filtered to same two shops',JSON.stringify(filteredList));
 const listFocus=await evalJS('(()=>{const root=document.querySelector("[data-smallshop-map]");root.querySelector("[data-map-focus=busan-eomuk]").click();const s=root.__smallshopMapState;const card=root.querySelector(".map-selected-card");return {mapMode:root.dataset.mapMode,id:s.selectedId,cardVisible:!card.hidden,photo:!!card.querySelector(".selected-card-photo img"),story:card.textContent.includes("인터뷰"),link:!!card.querySelector("a[href*=store]"),product:!!card.querySelector("a[href*=product]")}})()');
 if(listFocus.id!=='busan-eomuk'||listFocus.mapMode!=='map'||!listFocus.cardVisible||!listFocus.photo||!listFocus.link||!listFocus.product||!listFocus.story)throw Error('List/map/card connection failed '+JSON.stringify(listFocus));
 console.log('PASS list selection to photographic map card',JSON.stringify(listFocus));
 await screen('01b-filtered-store-card.png');
 const selectedList=await evalJS('(()=>{const root=document.querySelector("[data-smallshop-map]");root.querySelector("[data-map-view=list]").click();return {visible:[...root.querySelectorAll("[data-map-item]")].filter(x=>!x.hidden).map(x=>x.dataset.mapItem),selected:root.querySelector("[data-map-item=busan-eomuk]")?.getAttribute("aria-current")}})()');
 if(selectedList.selected!=='true'||selectedList.visible.join(',')!=='busan-eomuk')throw Error('Viewport/list selected sync failed '+JSON.stringify(selectedList));
 console.log('PASS viewport/selection linked list',JSON.stringify(selectedList));
 const cleared=await evalJS('(()=>{const root=document.querySelector("[data-smallshop-map]");root.querySelector("[data-map-view=map]").click();root.querySelector("[data-map-reset]").click();const s=root.__smallshopMapState;return {category:s.category,selection:s.selectedId,visibleRows:[...root.querySelectorAll("[data-map-item]")].filter(x=>!x.hidden).length}})()');
 if(cleared.category!=='전체'||cleared.selection!==null||cleared.visibleRows!==6)throw Error('Reset to national map failed '+JSON.stringify(cleared));
 console.log('PASS reset all stores',JSON.stringify(cleared));

 const clusterBefore=await evalJS('(()=>{const root=document.querySelector("[data-smallshop-map]");const state=root.__smallshopMapState;const pin=root.querySelector(".smallshop-cluster-marker");if(!pin)return {cluster:false};const zoom=state.map.getZoom();pin.dispatchEvent(new MouseEvent("click",{bubbles:true,cancelable:true,view:window}));return {cluster:true,zoom};})()');
 if(clusterBefore.cluster){
   await sleep(1600);
   const expandedZoom=await evalJS('document.querySelector("[data-smallshop-map]").__smallshopMapState.map.getZoom()');
   if(expandedZoom<=clusterBefore.zoom)throw Error('Cluster click did not zoom in '+JSON.stringify({before:clusterBefore.zoom,after:expandedZoom}));
   console.log('PASS cluster click and regional expansion',JSON.stringify({before:clusterBefore.zoom,after:expandedZoom}));
 }

 const listed=await evalJS('(()=>{const root=document.querySelector("[data-smallshop-map]");root.querySelector("[data-map-view=list]").click();return {listVisible:!root.querySelector(".store-map-list").hidden,mapHidden:root.querySelector(".store-map-view").hidden,rows:root.querySelectorAll(".map-list-item").length};})()');
 if(!listed.listVisible||!listed.mapHidden||listed.rows!==6)throw Error('List mode failed '+JSON.stringify(listed));
 console.log('PASS list toggle',JSON.stringify(listed));
 const mapped=await evalJS('(()=>{const root=document.querySelector("[data-smallshop-map]");root.querySelector("[data-map-view=map]").click();const state=root.__smallshopMapState;state.map.stop();state.map.setView([34.8552,128.4296],11,{animate:false});return {visible:!root.querySelector(".store-map-view").hidden,zoom:state.map.getZoom()}})()');
 if(!mapped.visible||mapped.zoom<10)throw Error('Map mode or zoom failed '+JSON.stringify(mapped));
 await sleep(1500);
 const picked=await evalJS('(()=>{const root=document.querySelector("[data-smallshop-map]");const all=[...root.querySelectorAll(".smallshop-location-marker")];const pin=all.find(x=>x.title.includes("통영"))||all[0];if(!pin)return {error:"individual pin missing"};pin.dispatchEvent(new MouseEvent("click",{bubbles:true,cancelable:true,view:window}));const card=root.querySelector(".map-selected-card");return {card:!!card&&!card.hidden,shop:!!card?.querySelector("a[href*=store]"),product:!!card?.querySelector("a[href*=product]"),text:card?.textContent?.slice(0,130)}})()');
 if(!picked.card||!picked.shop||!picked.product)throw Error('Pin selection card failed '+JSON.stringify(picked));
 console.log('PASS pin click and info card',JSON.stringify(picked));
 await screen('02-shop-pin-card.png');
 await navigate('/');
 const home=await poll(stateExpr,'Homepage embedded OSM map');
 console.log('PASS home embedded map',JSON.stringify(home));
 await screen('03-home-map.png');
 await navigate('/region/tongyeong/');
 const region=await poll(stateExpr,'Regional detail OSM map');
 const zoom=await evalJS('document.querySelector("[data-smallshop-map]").__smallshopMapState.map.getZoom()');
 if(zoom<10)throw Error('Region map zoom too low '+zoom);
 console.log('PASS region map',JSON.stringify({tiles:region.tiles,markers:region.markers,zoom}));
 await screen('04-region-map.png');
 // Mobile QA matters: home/region map must fit an iPhone-sized viewport.
 await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 await navigate('/regions/');
 const mobile=await poll(stateExpr,'Mobile national map',42000);
 const dimensions=await evalJS('(()=>{const root=document.querySelector("[data-smallshop-map]");return {innerWidth:innerWidth,pageWidth:document.documentElement.scrollWidth,mapWidth:Math.round(root.getBoundingClientRect().width),mapHeight:Math.round(root.querySelector(".store-map-canvas").getBoundingClientRect().height)}})()');
 if(dimensions.pageWidth>dimensions.innerWidth+3||dimensions.mapWidth<275||dimensions.mapHeight<200)throw Error('Mobile map sizing/overflow '+JSON.stringify(dimensions));
 console.log('PASS mobile map',JSON.stringify({tiles:mobile.tiles,markers:mobile.markers,...dimensions}));
 await screen('05-mobile-national.png');
 const mobileList=await evalJS('(()=>{const root=document.querySelector("[data-smallshop-map]");root.querySelector("[data-map-view=list]").click();return {visible:!root.querySelector(".store-map-list").hidden,count:root.querySelectorAll(".map-list-item").length}})()');
 if(!mobileList.visible||mobileList.count!==6)throw Error('Mobile list toggle failed '+JSON.stringify(mobileList));
 console.log('PASS mobile list mode',JSON.stringify(mobileList));
 
 await navigate('/join/');
 const join=await evalJS('(()=>({title:document.title,fee:document.body.innerText.includes("중개수수료 1%"),free:document.body.innerText.includes("입점비 무료"),interview:document.body.innerText.includes("인터뷰"),mailto:[...document.querySelectorAll("a[href^=mailto]")].some(x=>x.href.includes("contact@suaveforge.com")),signupForm:document.querySelectorAll("form:not(#search)").length}))()');
 if(!join.fee||!join.free||!join.interview||!join.mailto||join.signupForm!==0)throw Error('Merchant outreach page content incorrect '+JSON.stringify(join));
 console.log('PASS on-site outreach page',JSON.stringify(join));
 await screen('06-join-page-mobile.png');
 await cdp('Emulation.clearDeviceMetricsOverride');
 await navigate('/');
 const imagery=await evalJS('(()=>[...document.querySelectorAll("img")].slice(0,12).map(x=>({alt:x.alt,complete:x.complete,loaded:x.naturalWidth>0})))()');
 console.log('HOME_IMAGES',JSON.stringify(imagery));



 // End-to-end storefront interactions, using actual served Pages JS and DOM.
 await navigate('/stores/?category='+encodeURIComponent('반찬'));
 const savoryStore=await evalJS('(()=>({url:location.pathname+location.search,stores:document.querySelectorAll(".storetile").length,goods:document.querySelectorAll(".directory-products .tile").length,active:[...document.querySelectorAll(".facet-chip.active")].map(x=>x.textContent.trim()),notice:document.querySelector(".directory-results")?.textContent.trim()}))()');
 if(savoryStore.stores!==2||savoryStore.goods!==2||!savoryStore.active.includes('반찬'))throw Error('Store category filtering regression '+JSON.stringify(savoryStore));
 console.log('PASS storefront category filter',JSON.stringify(savoryStore));
 await screen('07-stores-category.png');
 await navigate('/stores/?region='+encodeURIComponent('통영시'));
 const regionalStores=await evalJS('(()=>({shops:document.querySelectorAll(".storetile").length,products:document.querySelectorAll(".directory-products .tile").length,active:[...document.querySelectorAll(".facet-chip.active")].map(x=>x.textContent.trim())}))()');
 if(regionalStores.shops!==1||regionalStores.products!==1||!regionalStores.active.includes('통영시'))throw Error('Store region filter regression '+JSON.stringify(regionalStores));
 console.log('PASS storefront regional facet',JSON.stringify(regionalStores));
 await navigate('/');
 const searched=await evalJS('(()=>{const input=document.querySelector("#search input");input.value="한과";document.querySelector("#search").requestSubmit();return {url:location.pathname+location.search,title:document.title,shops:document.querySelectorAll(".storetile").length,products:document.querySelectorAll(".directory-products .tile").length,input:document.querySelector("#search input").value}})()');
 if(!searched.url.startsWith('/stores?q=')||searched.shops!==1||searched.products!==1||searched.input!=='한과')throw Error('Header search regression '+JSON.stringify(searched));
 console.log('PASS search navigates directly to visible results',JSON.stringify(searched));
 await screen('08-search-results.png');
 await navigate('/stores/?q='+encodeURIComponent('없는특수상품'));
 const empty=await evalJS('(()=>({message:!!document.querySelector(".directory-empty"),clear:!!document.querySelector(".clear-filters"),products:document.querySelectorAll(".tile").length}))()');
 if(!empty.message||!empty.clear||empty.products!==0)throw Error('Empty search state regression '+JSON.stringify(empty));
 console.log('PASS empty search recovery',JSON.stringify(empty));

 // UI-only demo cart must work without fake checkout, without page reload.
 await navigate('/product/honeybread-10/');
 const added=await evalJS('(()=>{localStorage.removeItem("smallshop-demo-cart");document.querySelectorAll("button[data-qty]")[1].click();document.querySelector("button[data-add]").click();return {qty:document.querySelector("#qty")?.textContent,amount:document.querySelector("#amount")?.textContent,cart:document.querySelector(".header-account .count")?.textContent,notice:document.querySelector("#addnotice")?.textContent,stored:JSON.parse(localStorage.getItem("smallshop-demo-cart")||"[]")}})()');
 if(added.qty!=='2'||added.amount!=='26,000원'||added.cart!=='2'||added.stored[0]?.qty!==2)throw Error('Demo cart add/count regression '+JSON.stringify(added));
 console.log('PASS product quantity and live cart badge',JSON.stringify(added));
 await screen('09-product-cart.png');
 await navigate('/cart/');
 const cart=await evalJS('(()=>{const btn=document.querySelectorAll("button[data-delta]")[1];if(!btn)return {error:"cart button missing"};btn.click();return {qty:JSON.parse(localStorage.getItem("smallshop-demo-cart")||"[]")[0]?.qty,text:document.querySelector(".summary")?.textContent.slice(0,190),disabled:!!document.querySelector(".summary button[disabled]")}})()');
 if(cart.qty!==3||!cart.text.includes('39,000원')||!cart.disabled)throw Error('Cart summary/edit regression '+JSON.stringify(cart));
 console.log('PASS cart quantity totals with checkout disabled',JSON.stringify(cart));
 await navigate('/stores/');
 const fallback=await evalJS('(()=>{const item=document.querySelector(".storetile img");item.dispatchEvent(new Event("error"));return {src:item.getAttribute("src"),alt:item.getAttribute("alt"),fallback:item.dataset.fallback}})()');
 if(!fallback.src.endsWith('/assets/food/g.svg')||fallback.fallback!=='true')throw Error('Image fallback regression '+JSON.stringify(fallback));
 console.log('PASS remote image failure fallback',JSON.stringify(fallback));
 // Every merchant example must have either a real illustrative photograph or a local illustration.
 const imageAudit=await evalJS('(async()=>{const images=[...document.querySelectorAll(".storetile img")];for(const image of images)image.loading="eager";await Promise.allSettled(images.map(image=>image.decode()));await Promise.allSettled(images.map(image=>image.decode()));return {count:images.length,images:images.map(i=>({src:i.currentSrc||i.src,ready:i.complete&&i.naturalWidth>0,fallback:i.dataset.fallback||"false",fallbackUrl:i.dataset.fallbackSrc}))}})()');
 if(imageAudit.count!==6||imageAudit.images.some(i=>!i.ready))throw Error('One or more merchant photographs are broken, even after fallback '+JSON.stringify(imageAudit));
 console.log('PASS six resilient category-specific food images',JSON.stringify(imageAudit));


 await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 await navigate('/stores/?category='+encodeURIComponent('반찬'));
 const mobileStore=await evalJS('(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,shops:document.querySelectorAll(".storetile").length,filters:[...document.querySelectorAll(".facet-chip")].map(x=>Math.round(x.getBoundingClientRect().height))}))()');
 if(mobileStore.scroll>mobileStore.width+3||mobileStore.shops!==2||Math.min(...mobileStore.filters)<35)throw Error('Mobile storefront search regression '+JSON.stringify(mobileStore));
 console.log('PASS mobile search/facets without overflow',JSON.stringify(mobileStore));
 const mobileHero=await evalJS('(()=>({width:innerWidth,docWidth:document.documentElement.scrollWidth,hero:document.querySelector(".directory-filters")?.getBoundingClientRect().width,filterCount:document.querySelectorAll(".facet-chip").length}))()');
 if(mobileHero.docWidth>mobileHero.width+3||mobileHero.hero<280)throw Error('Mobile directory content width overflow '+JSON.stringify(mobileHero));
 console.log('PASS mobile directory polish',JSON.stringify(mobileHero));

 await screen('10-mobile-stores.png');
 await cdp('Emulation.clearDeviceMetricsOverride');

 if(errors.length)console.warn('Browser exceptions',JSON.stringify(errors.slice(-12)));
 // Force the old external Leaflet CDN offline: the bundled local copy must still load.
 await cdp('Network.enable');
 await cdp('Network.setBlockedURLs',{urls:['*unpkg.com/*','*cdn.jsdelivr.net/*']});
 await navigate('/regions/');
 const offlineCDN=await poll(stateExpr,'Local Leaflet when old CDN is blocked',33000);
 console.log('PASS map without unpkg/jsdelivr Leaflet CDNs',JSON.stringify({tiles:offlineCDN.tiles,markers:offlineCDN.markers}));
 await cdp('Network.setBlockedURLs',{urls:[]});
 console.log('ALL_GEO_BROWSER_TESTS_PASSED');
}catch(err){
 console.error('MAP_BROWSER_TEST_FAILED',String(err));
 try{
  console.error('CURRENT_PAGE',JSON.stringify(await evalJS(stateExpr)));
  await screen('00-failure.png');
 }catch{}
 console.error('BROWSER_EXCEPTIONS',JSON.stringify(errors.slice(-16)));
 process.exitCode=1;
}finally{
 ws?.close();
 chrome.kill('SIGTERM');
 await sleep(180);
 rmSync(profile,{recursive:true,force:true});
}
