(() => {
 'use strict';
 /* Smallshop demo: these coordinates represent CITY CENTERS, not actual stores.
    Never enable directions or claim an address until a merchant is verified. */
 const cityCenters=Object.freeze({
  tongyeong:[34.8552,128.4296],jeonju:[35.8242,127.1480],
  gangneung:[37.7519,128.8761],busan:[35.1796,129.0756],
  gongju:[36.4500,127.1167],jeju:[33.4996,126.5312]
 });
 const allStores=Array.isArray(window.smallshopMapStores)?window.smallshopMapStores:[];
 const leafletURL=(window.__smallshopBase||'')+'/assets/vendor/leaflet-1.9.4.min.js';
 const leafletCSS=(window.__smallshopBase||'')+'/assets/vendor/leaflet-1.9.4.css';
 const ourCSS=(window.__smallshopBase||'')+'/assets/map.css';
 const route=path=>(window.__smallshopBase||'')+path;
 const escapeHTML=v=>String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const money=v=>new Intl.NumberFormat('ko-KR').format(v)+'원';
 const locationOf=s=>cityCenters[s.city];
 let instances=[];
 let generation=0;
 let leafletPromise,stylesPromise;
 function loadStyles(){
  if(stylesPromise)return stylesPromise;
  stylesPromise=new Promise((resolve,reject)=>{
   const e=document.createElement('link');e.rel='stylesheet';e.href=ourCSS;
   e.onload=resolve;e.onerror=()=>reject(Error('지도의 스타일 파일을 불러올 수 없습니다.'));
   document.head.appendChild(e);
  });return stylesPromise;
 }
 function loadLeaflet(){
  if(window.L)return Promise.resolve(window.L);
  if(leafletPromise)return leafletPromise;
  leafletPromise=new Promise((resolve,reject)=>{
   const style=document.createElement('link');style.rel='stylesheet';style.href=leafletCSS;
   document.head.appendChild(style);
   const code=document.createElement('script');code.src=leafletURL;code.async=true;
   code.defer=true;
   code.onload=()=>window.L?resolve(window.L):reject(Error('지도 라이브러리를 시작할 수 없습니다.'));
   code.onerror=()=>reject(Error('지도 라이브러리 다운로드 실패'));
   document.head.appendChild(code);
  });return leafletPromise;
 }
 function scopedStores(root){
  const scope=root.dataset.smallshopMap;
  return allStores.filter(s=>(scope==='all'||s.city===scope)&&!!locationOf(s));
 }
 function markerIcon(L,count,group){
  if(count>1)return L.divIcon({
   className:'smallshop-cluster-marker',
   html:'<span class="smallshop-pin-cluster">'+count+'곳</span>',
   iconSize:[52,52],iconAnchor:[26,26]
  });
  const groupStyle=group==='반찬'?'savory':group==='차·음료'?'beverage':'bakery';
  return L.divIcon({
   className:'smallshop-location-marker marker-'+groupStyle,
   html:'<span class="smallshop-pin-single"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10 12 4l9 6v10H3V10Z"/><path d="M9 20v-8h6v8"/></svg></span>',
   iconSize:[38,46],iconAnchor:[19,42]
  });
 }
 function filtered(state){
  return state.scopeStores.filter(s=>state.category==='전체'||s.group===state.category);
 }
 function selectedRow(state){
  for(const item of state.root.querySelectorAll('[data-map-item]')){
   const selected=item.dataset.mapItem===state.selectedId;
   item.classList.toggle('is-selected',selected);
   if(selected)item.setAttribute('aria-current','true');
   else item.removeAttribute('aria-current');
  }
 }
 function updateList(state){
  const {root,map}=state;
  const candidates=filtered(state);
  const bounds=map.getBounds();
  // The list reflects the current geographic viewport, not unrelated shops
  // elsewhere in the country, and also respects the category chips.
  const inView=candidates.filter(s=>bounds.isValid()&&bounds.contains(locationOf(s)));
  const visibleIds=new Set(inView.map(s=>s.id));
  for(const row of root.querySelectorAll('[data-map-item]')){
   row.hidden=!visibleIds.has(row.dataset.mapItem);
  }
  const message=root.querySelector('.map-list-empty');
  if(message){
   message.hidden=inView.length!==0;
   message.textContent=candidates.length===0
    ?'선택한 업종의 시연 가게가 없습니다. 다른 업종을 선택해 보세요.'
    :'현재 지도 범위에 가게가 없습니다. 지도를 이동하거나 전국 보기로 돌아가세요.';
  }
  const status=root.querySelector('.store-map-count');
  if(status)status.textContent='지도 영역 '+inView.length+'곳 · 업종 '+candidates.length+'곳 · 가게 위치는 시연용 지역 중심입니다.';
  selectedRow(state);
  return inView;
 }
 function setMode(root,mode){
  root.dataset.mapMode=mode;
  const map=root.querySelector('.store-map-view'),list=root.querySelector('.store-map-list');
  if(map)map.hidden=mode!=='map';
  if(list)list.hidden=mode!=='list';
  for(const button of root.querySelectorAll('[data-map-view]')){
   button.setAttribute('aria-pressed',String(button.dataset.mapView===mode));
  }
  const state=root.__smallshopMapState;
  if(state){
   if(mode==='map')requestAnimationFrame(()=>state.map.invalidateSize());
   else{
    updateList(state);
    const row=state.selectedId?root.querySelector('[data-map-item="'+state.selectedId+'"]'):null;
    if(row&&!row.hidden)list.scrollTop=Math.max(0,row.offsetTop-list.offsetTop-35);
   }
  }
 }
 function displayCard(state,store){
  const card=state.root.querySelector('.map-selected-card');
  if(!card)return;
  card.innerHTML=
   '<div class="selected-card-photo"><img src="'+escapeHTML(store.photo)+'" alt="'+escapeHTML(store.name)+'" loading="lazy"><span>시연 가게</span></div>'+
   '<div class="selected-card-body"><small>'+escapeHTML(store.region)+' · '+escapeHTML(store.category)+'</small>'+
   '<strong>'+escapeHTML(store.name)+'</strong>'+
   '<span class="selected-card-story"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="5" width="14" height="14" rx="2"/><path d="m16 10 6-4v12l-6-4"/></svg>점주 인터뷰 촬영 준비 중</span>'+
   (store.productName?'<p class="selected-product">'+escapeHTML(store.productName)+' <b>'+money(store.productPrice)+' (예시)</b></p>':'')+
   '<p class="selected-card-location">매장 주소 미확인 · 도시 중심 표시</p>'+
   '<div class="selected-card-links"><a data-route href="'+route('/store/'+encodeURIComponent(store.id))+'">가게 이야기 →</a>'+
   (store.productId?'<a data-route href="'+route('/product/'+encodeURIComponent(store.productId))+'">대표 상품 →</a>':'')+
   '</div></div>'+
   '<button class="selected-card-close" type="button" data-map-close aria-label="가게 정보 닫기">×</button>';
  card.hidden=false;
 }
 function clearCard(state){
  state.selectedId=null;
  const card=state.root.querySelector('.map-selected-card');
  if(card)card.hidden=true;
  selectedRow(state);
 }
 function selectStore(state,id,{move=true}={}){
  const shop=state.scopeStores.find(x=>x.id===id);
  if(!shop)return;
  // A shop chosen from the list must always be present in the active filter.
  if(state.category!=='전체'&&state.category!==shop.group){
   applyCategory(state,shop.group,false);
  }
  state.selectedId=shop.id;
  displayCard(state,shop);
  selectedRow(state);
  setMode(state.root,'map');
  if(move){
   state.map.stop();
   state.map.setView(locationOf(shop),11,{animate:false});
   drawPins(state);
   updateList(state);
  }
 }
 function clusters(map,items){
  if(map.getZoom()>8.5)return items.map(s=>[s]);
  const entries=[];
  for(const store of items){
   const pos=map.latLngToLayerPoint(locationOf(store));
   let found=entries.find(entry=>entry.positions.some(p=>p.distanceTo(pos)<54));
   if(!found){found={positions:[],stores:[]};entries.push(found);}
   found.positions.push(pos);
   found.stores.push(store);
  }
  return entries.map(e=>e.stores);
 }
 function drawPins(state){
  state.layer.clearLayers();
  for(const group of clusters(state.map,filtered(state))){
   const coords=group.reduce((sum,shop)=>{
    const p=locationOf(shop);sum[0]+=p[0];sum[1]+=p[1];return sum;
   },[0,0]).map(x=>x/group.length);
   const many=group.length>1;
   const text=many?'가까운 예시 가게 '+group.length+'곳. 확대해서 보기':
    group[0].name+' · 도시 중심 (실제 매장 위치 아님)';
   const marker=window.L.marker(coords,{
    icon:markerIcon(window.L,group.length,group[0].group),
    title:text,alt:text,keyboard:true,riseOnHover:true
   }).addTo(state.layer);
   marker.on('click',()=>{
    if(many){
     state.map.stop();
     state.map.fitBounds(window.L.latLngBounds(group.map(s=>locationOf(s))).pad(.5),{
      padding:[34,34],maxZoom:11,animate:true
     });
    }else selectStore(state,group[0].id,{move:false});
   });
   if(!many)marker.bindTooltip(escapeHTML(group[0].region),{direction:'top',offset:[0,-39],opacity:.96});
  }
 }
 function fitCategory(state,items){
  state.map.stop();
  if(items.length===0)return;
  if(items.length===1)state.map.setView(locationOf(items[0]),11,{animate:false});
  else state.map.fitBounds(window.L.latLngBounds(items.map(s=>locationOf(s))),{
   padding:[34,34],maxZoom:8,animate:false
  });
 }
 function applyCategory(state,group,zoom=true){
  if(group!=='전체'&&!state.scopeStores.some(s=>s.group===group))return;
  state.category=group;
  for(const button of state.root.querySelectorAll('[data-map-category]')){
   button.setAttribute('aria-pressed',String(button.dataset.mapCategory===group));
  }
  const selected=state.scopeStores.find(s=>s.id===state.selectedId);
  if(selected&&group!=='전체'&&selected.group!==group)clearCard(state);
  const scoped=filtered(state);
  if(zoom)fitCategory(state,scoped);
  drawPins(state);
  updateList(state);
 }
 function initMap(root,L){
  if(!root.isConnected)return;
  const el=root.querySelector('.store-map-canvas');
  const scopeStores=scopedStores(root);
  if(!el||!scopeStores.length)throw Error('지도에 표시할 가게가 없습니다.');
  el.querySelector('.map-loading')?.remove();
  const map=L.map(el,{
   zoomControl:false,scrollWheelZoom:false,zoomSnap:.25,preferCanvas:true,minZoom:5,maxZoom:15
  });
  const layer=L.layerGroup().addTo(map);
  const state={root,map,layer,scopeStores,category:'전체',selectedId:null};
  root.__smallshopMapState=state;
  instances.push(state);
  L.control.zoom({position:'bottomright'}).addTo(map);
  // Local Leaflet runtime; external tiles are retried with independent providers.
  // CARTO tiles offer a light visual style. Both providers credit OSM contributors.
  const tileSources=[
   {
    url:'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
    options:{subdomains:'abcd',attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>'}
   },
   {
    url:'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    options:{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'}
   }
  ];
  let tileIndex=0,tileLayer=null,tileSuccesses=0,tileFailures=0,tileTimer=null,disposed=false;
  function clearTileTimer(){if(tileTimer!==null){clearTimeout(tileTimer);tileTimer=null;}}
  function tryTiles(index){
   if(disposed||!root.isConnected)return;
   if(tileLayer)map.removeLayer(tileLayer);
   clearTileTimer();
   if(index>=tileSources.length){
    fallback(root,'지도 배경에 연결할 수 없어 가게 목록을 보여드려요.');return;
   }
   tileIndex=index;tileSuccesses=0;tileFailures=0;
   const source=tileSources[index];
   const layer=L.tileLayer(source.url,{
    ...source.options,maxZoom:19,detectRetina:false,keepBuffer:2,
    updateWhenIdle:true
   });
   tileLayer=layer;
   layer.on('tileload',()=>{
    if(tileLayer!==layer)return;
    tileSuccesses++;
    if(tileSuccesses===1){
     clearTileTimer();
     root.classList.remove('map-offline');
     const heading=root.querySelector('.store-map-heading p');
     if(heading&&heading.dataset.defaultText)heading.textContent=heading.dataset.defaultText;
    }
   });
   layer.on('tileerror',()=>{
    if(tileLayer!==layer)return;
    tileFailures++;
    if(tileSuccesses===0&&tileFailures>=2)tryTiles(tileIndex+1);
   });
   layer.addTo(map);
   tileTimer=setTimeout(()=>{
    if(tileLayer===layer&&tileSuccesses===0)tryTiles(tileIndex+1);
   },6500);
  }
  state.destroyTiles=()=>{disposed=true;clearTileTimer();};
  const description=root.querySelector('.store-map-heading p');
  if(description)description.dataset.defaultText=description.textContent;
  tryTiles(0);
  // Tile positioning and area events are linked to the visible shop list.
  map.on('moveend',()=>{
   drawPins(state);
   updateList(state);
  });
  fitCategory(state,scopeStores);
  drawPins(state);
  updateList(state);
  requestAnimationFrame(()=>{if(root.isConnected)map.invalidateSize();});
  return state;
 }
 function fallback(root,reason){
  const description=root.querySelector('.store-map-heading p');
  if(description)description.textContent=reason;
  root.classList.add('map-offline');
  setMode(root,'list');
  const state=root.__smallshopMapState;
  if(state)updateList(state);
 }
 function cleanup(){
  generation++;
  for(const state of instances){
   if(state.destroyTiles)state.destroyTiles();
   try{state.map.remove();}catch{}
   if(state.root)delete state.root.__smallshopMapState;
  }
  instances=[];
 }
 async function mount(){
  const roots=[...document.querySelectorAll('[data-smallshop-map]')];
  if(!roots.length)return;
  const current=++generation;
  try{
   const [_,L]=await Promise.all([loadStyles(),loadLeaflet()]);
   if(current!==generation)return;
   for(const root of roots){
    if(!root.isConnected||root.__smallshopMapState)continue;
    try{initMap(root,L);}
    catch(error){console.warn('작은가게 지도 오류:',error);fallback(root,'지도를 열 수 없어 가게 목록을 표시합니다.');}
   }
  }catch(error){
   console.warn('작은가게 지도 로드 오류:',error);
   if(current===generation)for(const root of roots)if(root.isConnected)fallback(root,'지도를 불러올 수 없어 가게 목록을 표시합니다.');
  }
 }
 document.addEventListener('click',event=>{
  const button=event.target.closest('[data-map-view],[data-map-reset],[data-map-focus],[data-map-close],[data-map-category]');
  if(!button)return;
  const root=button.closest('[data-smallshop-map]');
  if(!root)return;
  if(button.hasAttribute('data-map-view')){setMode(root,button.dataset.mapView);return;}
  const state=root.__smallshopMapState;
  if(button.hasAttribute('data-map-category')){
   if(!state)return;
   applyCategory(state,button.dataset.mapCategory);
   return;
  }
  if(button.hasAttribute('data-map-close')){if(state)clearCard(state);return;}
  if(button.hasAttribute('data-map-focus')){if(state)selectStore(state,button.dataset.mapFocus);return;}
  if(button.hasAttribute('data-map-reset')){
   if(!state)return;
   clearCard(state);
   applyCategory(state,'전체');
   return;
  }
 });
 window.SmallshopMap={mount,cleanup,cityCenters};
 window.addEventListener('smallshop:rendered',mount);
 mount();
})();
