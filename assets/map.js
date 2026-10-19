(() => {
  'use strict';
  /* Leaflet 1.9.4, OpenStreetMap tiles. Demo markers are city centers only. */
  const cityCenters=Object.freeze({
    tongyeong:[34.8552,128.4296],
    jeonju:[35.8242,127.1480],
    gangneung:[37.7519,128.8761],
    busan:[35.1796,129.0756],
    gongju:[36.4500,127.1167],
    jeju:[33.4996,126.5312]
  });
  const allStores=Array.isArray(window.smallshopMapStores)?window.smallshopMapStores:[];
  let instances=[];
  let generation=0;
  let libraryPromise=null;
  let stylePromise=null;
  const leafletJS='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
  const leafletCSS='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  const mapCSS=(window.__smallshopBase||'')+'/assets/map.css';
  const safe=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const route=path=>(window.__smallshopBase||'')+path;
  function loadStyles(){
    if(stylePromise)return stylePromise;
    stylePromise=new Promise((resolve,reject)=>{
      const css=document.createElement('link');
      css.rel='stylesheet';css.href=mapCSS;
      css.onload=resolve;css.onerror=()=>reject(Error('지도 스타일을 읽지 못했습니다.'));
      document.head.appendChild(css);
    });
    return stylePromise;
  }
  function loadLeaflet(){
    if(window.L)return Promise.resolve(window.L);
    if(libraryPromise)return libraryPromise;
    libraryPromise=new Promise((resolve,reject)=>{
      const stylesheet=document.createElement('link');
      stylesheet.rel='stylesheet';stylesheet.href=leafletCSS;
      stylesheet.integrity='sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      stylesheet.crossOrigin='anonymous';document.head.appendChild(stylesheet);
      const script=document.createElement('script');
      script.src=leafletJS;script.async=true;
      script.integrity='sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin='anonymous';
      script.onload=()=>window.L?resolve(window.L):reject(Error('지도 라이브러리가 초기화되지 않았습니다.'));
      script.onerror=()=>reject(Error('지도 라이브러리를 다운로드하지 못했습니다.'));
      document.head.appendChild(script);
    });
    return libraryPromise;
  }
  function filterStores(root){
    const scope=root.dataset.smallshopMap;
    return allStores.filter(s=>(scope==='all'||s.city===scope)&&cityCenters[s.city]);
  }
  function locate(s){return cityCenters[s.city];}
  function markerIcon(L,count){
    const cluster=count>1;
    return L.divIcon({
      className:cluster?'smallshop-cluster-marker':'smallshop-location-marker',
      html:cluster?'<span class="smallshop-pin-cluster">'+count+'곳</span>':
        '<span class="smallshop-pin-single"><svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg></span>',
      iconSize:cluster?[52,52]:[38,46],iconAnchor:cluster?[26,26]:[19,42]
    });
  }
  function updateButtons(root,mode){
    root.dataset.mapMode=mode;
    const mapView=root.querySelector('.store-map-view');
    const listView=root.querySelector('.store-map-list');
    mapView.hidden=mode!=='map';listView.hidden=mode!=='list';
    for(const b of root.querySelectorAll('[data-map-view]')){
      const selected=b.dataset.mapView===mode;
      b.setAttribute('aria-pressed',String(selected));
    }
    if(mode==='map'){
      const active=instances.find(v=>v.root===root);
      if(active)requestAnimationFrame(()=>active.map.invalidateSize());
    }
  }
  function showCard(state,s){
    const card=state.root.querySelector('.map-selected-card');
    if(!card)return;
    card.innerHTML='<div class="selected-card-photo"><img src="'+safe(s.photo)+'" alt="'+safe(s.name)+'"></div>'+
      '<div class="selected-card-body"><small>'+safe(s.region)+' · '+safe(s.category)+'</small>'+
      '<strong>'+safe(s.name)+'</strong><p>지역 중심 좌표 · 실제 매장 위치 아님</p>'+
      '<div class="selected-card-links"><a data-route href="'+route('/store/'+encodeURIComponent(s.id))+'">가게 이야기 →</a>'+
      (s.productId?'<a data-route href="'+route('/product/'+encodeURIComponent(s.productId))+'">대표 상품 →</a>':'')+'</div></div>'+
      '<button class="selected-card-close" type="button" data-map-close aria-label="가게 정보 닫기">×</button>';
    card.hidden=false;
  }
  function selectStore(state,id,{fly=true}={}){
    const s=state.stores.find(s=>s.id===id);
    if(!s)return;
    updateButtons(state.root,'map');
    showCard(state,s);
    if(fly && state.map.getZoom()<10)state.map.flyTo(locate(s),10,{duration:0.55});
    else state.map.panTo(locate(s),{animate:true,duration:0.3});
  }
  function groupedStores(map,items){
    // Zoom-dependent pixel-distance grouping. We do not invent shop counts.
    if(map.getZoom()>8.5)return items.map(store=>[store]);
    const groups=[];
    for(const store of items){
      const pos=map.latLngToLayerPoint(locate(store));
      let entry=groups.find(g=>g.points.some(p=>p.distanceTo(pos)<54));
      if(!entry){entry={points:[],stores:[]};groups.push(entry);}
      entry.stores.push(store);
      entry.points.push(pos);
    }
    return groups.map(g=>g.stores);
  }
  function drawMarkers(state){
    state.layer.clearLayers();
    const {map,stores}=state;
    for(const group of groupedStores(map,stores)){
      const center=group.reduce((sum,s)=>{
        const p=locate(s);sum[0]+=p[0];sum[1]+=p[1];return sum;
      },[0,0]).map(v=>v/group.length);
      const isCluster=group.length>1;
      const title=isCluster?'근처 예시 가게 '+group.length+'곳. 확대하여 보기':
        group[0].name+' · 지역 중심 표시';
      const marker=window.L.marker(center,{
        icon:markerIcon(window.L,group.length),
        title,alt:title,keyboard:true,riseOnHover:true
      }).addTo(state.layer);
      marker.on('click',()=>{
        if(isCluster){
          map.fitBounds(window.L.latLngBounds(group.map(s=>locate(s))).pad(.55),{padding:[30,30],maxZoom:11,animate:true});
        }else selectStore(state,group[0].id);
      });
      if(!isCluster)marker.bindTooltip(safe(group[0].region),{direction:'top',offset:[0,-38],opacity:.96});
    }
  }
  function initMap(root,L){
    if(!root.isConnected)return;
    const el=root.querySelector('.store-map-canvas');
    const stores=filterStores(root);
    if(!el||!stores.length)throw Error('표시할 지역 가게 정보가 없습니다.');
    el.querySelector('.map-loading')?.remove();
    const map=L.map(el,{
      zoomControl:false,scrollWheelZoom:false,zoomSnap:.25,preferCanvas:true,
      minZoom:5,maxZoom:15
    });
    const layer=L.layerGroup().addTo(map);
    const state={root,map,layer,stores};
    instances.push(state);
    L.control.zoom({position:'bottomright'}).addTo(map);
    let successfulTiles=0,failedTiles=0;
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
      maxZoom:19,
      attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> 기여자',
      detectRetina:false,
      keepBuffer:2
    }).on('tileload',()=>successfulTiles++).on('tileerror',()=>{
      failedTiles++;
      if(failedTiles>=8 && successfulTiles===0){
        showFallback(root,'지도 타일을 불러오지 못했습니다. 목록에서 가게를 찾아보세요.');
      }
    }).addTo(map);
    const bounds=L.latLngBounds(stores.map(s=>locate(s)));
    if(stores.length===1)map.setView(locate(stores[0]),11);
    else map.fitBounds(bounds,{padding:[35,35],maxZoom:8});
    map.on('zoomend',()=>drawMarkers(state));
    drawMarkers(state);
    requestAnimationFrame(()=>{if(root.isConnected)map.invalidateSize();});
    root.__smallshopMapState=state;
    return state;
  }
  function showFallback(root,message){
    const heading=root.querySelector('.store-map-heading p');
    if(heading)heading.textContent=message;
    updateButtons(root,'list');
    root.classList.add('map-offline');
  }
  function cleanup(){
    ++generation;
    for(const state of instances){
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
        catch(error){console.warn('작은가게 지도 표시 오류:',error);showFallback(root,'지도를 열 수 없어 가게 목록으로 전환했습니다.');}
      }
    }catch(error){
      console.warn('작은가게 지도 로드 오류:',error);
      if(current===generation)for(const root of roots)if(root.isConnected)showFallback(root,'지도를 불러올 수 없어 목록으로 전환했습니다.');
    }
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-map-view],[data-map-reset],[data-map-focus],[data-map-close]');
    if(!button)return;
    const root=button.closest('[data-smallshop-map]');
    if(!root)return;
    if(button.hasAttribute('data-map-view')){
      updateButtons(root,button.dataset.mapView);
      return;
    }
    if(button.hasAttribute('data-map-close')){
      root.querySelector('.map-selected-card').hidden=true;
      return;
    }
    const state=root.__smallshopMapState;
    if(button.hasAttribute('data-map-reset')){
      if(!state)return;
      state.map.closePopup();
      root.querySelector('.map-selected-card').hidden=true;
      if(state.stores.length===1)state.map.setView(locate(state.stores[0]),11);
      else state.map.fitBounds(window.L.latLngBounds(state.stores.map(s=>locate(s))),{padding:[35,35],maxZoom:8});
      return;
    }
    if(button.hasAttribute('data-map-focus')){
      if(!state){
        showFallback(root,'지도 준비 전입니다. 아래 목록에서 가게 페이지로 이동할 수 있습니다.');
        return;
      }
      selectStore(state,button.dataset.mapFocus);
    }
  });
  window.SmallshopMap={mount,cleanup,cityCenters};
  window.addEventListener('smallshop:rendered',mount);
  mount();
})();