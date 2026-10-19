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
 if(national.storeCount!==6)throw Error('Six demo shops not found');
 await screen('01-national-map.png');
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
 const mapped=await evalJS('(()=>{const root=document.querySelector("[data-smallshop-map]");root.querySelector("[data-map-view=map]").click();const state=root.__smallshopMapState;state.map.setView([34.8552,128.4296],11);return {visible:!root.querySelector(".store-map-view").hidden,zoom:state.map.getZoom()}})()');
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
 await cdp('Emulation.clearDeviceMetricsOverride');

 if(errors.length)console.warn('Browser exceptions',JSON.stringify(errors.slice(-12)));
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
