(() => {
'use strict';
if(location.hostname==='smallshop.suaveforge.com' && location.protocol==='http:'){ location.replace('https://'+location.host+location.pathname+location.search+location.hash); return; }
const BASE=location.hostname.endsWith('.github.io')?'/smallshop-deploy':'';
const link=path=>BASE+path;
const photo={
 a:'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=960&q=82',
 b:'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=960&q=82',
 c:'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=960&q=82',
 d:'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=960&q=82',
 e:'https://images.unsplash.com/photo-1608198093002-ad4e005484df?auto=format&fit=crop&w=960&q=82',
 f:'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?auto=format&fit=crop&w=960&q=82',
 g:'https://upload.wikimedia.org/wikipedia/commons/3/33/Tongyeong-kkulppang_3.jpg',
 h:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Korean_hangwa.jpg/960px-Korean_hangwa.jpg',
 j:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Korean_fishcake_bunsik_eoumuk_01.jpg/500px-Korean_fishcake_bunsik_eoumuk_01.jpg'
};
const regions=[['tongyeong','통영시','경남'],['jeonju','전주시','전북'],['gangneung','강릉시','강원'],['busan','부산광역시','부산'],['gongju','공주시','충남'],['jeju','제주시','제주']];
const stores=[
 ['tongyeong-honey','통영 꿀빵 작업실','경남 통영시','tongyeong','꿀빵','g'],
 ['jeonju-pickle','전주 장아찌 가게','전북 전주시','jeonju','장아찌','b'],
 ['gangneung-hangwa','강릉 한과 가게','강원 강릉시','gangneung','한과','h'],
 ['busan-eomuk','부산 어묵 가게','부산광역시','busan','어묵','j'],
 ['gongju-bread','공주 밤빵 가게','충남 공주시','gongju','빵','e'],
 ['jeju-citrus','제주 감귤 가게','제주 제주시','jeju','감귤청','f']
];
const goods=[
 ['honeybread-10',0,'통영 꿀빵 10개입',13000,'간식·빵'],
 ['pickle-500',1,'전주 장아찌 500g',16000,'반찬'],
 ['hangwa-set',2,'강릉 한과 세트',18000,'간식·빵'],
 ['eomuk-450',3,'부산 어묵 450g',12000,'반찬'],
 ['chestnut-bread',4,'공주 밤빵 4개입',14000,'간식·빵'],
 ['citrus-tea',5,'제주 감귤청 500ml',15000,'차·음료']
];
const records=[
 ['충무김밥','경남 통영시',8000,photo.a],
 ['밀면','부산광역시',9000,photo.c],
 ['국밥','대구광역시',10000,photo.d]
];
const won=n=>new Intl.NumberFormat('ko-KR').format(n)+'원';
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nav=(url,body,cls='')=>'<a data-route href="'+link(url)+'" class="'+cls+'">'+body+'</a>';
const img=(src,alt)=>'<img src="'+src+'" alt="'+esc(alt)+'" loading="lazy">';
const status=x=>'<span class="status">'+x+'</span>';

/* Coherent stroke icons in a single 24px grid. Native SVG, no emoji/font dependencies. */
const ICON_SHAPES = Object.freeze({
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  cart:'<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 2h3l2.8 13a2 2 0 0 0 2 1.6h10.2a2 2 0 0 0 2-1.6L23 6H5"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  mapPin:'<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  store:'<path d="M3 10V6l2-3h14l2 3v4"/><path d="M3 10c0 2 3 3 4.5 1 1.5 2 4.5 2 4.5-1 0 3 3 3 4.5 1 1.5 2 4.5 1 4.5-1"/><path d="M5 13v8h14v-8M9 21v-5h6v5"/>',
  book:'<path d="M4 5.5C6 4.5 9 4.5 12 6v15c-3-1.5-6-1.5-8-.5V5.5ZM12 6c3-1.5 6-1.5 8-.5v15c-2-1-5-1-8 .5"/>',
  cake:'<path d="M3 11h18v9H3zM3 15h18M8 11V7M12 11V7M16 11V7"/><path d="M8 3v1M12 3v1M16 3v1"/>',
  salad:'<path d="M4 14h16c0 5-3.5 7-8 7s-8-2-8-7Z"/><path d="M6 14c-2-4 1-7 5-6 1-4 6-4 7 0 4 1 4 4 2 6M12 8V3M9 7 6 4"/>',
  wheat:'<path d="M12 22V5m0 13-5-4m5 1 5-4m-5 0-4-3m4 1 4-3"/><path d="M10 5c0-2 1-3 2-4 1 1 2 2 2 4M7 10C4 10 4 7 4 5c3 0 4 2 4 4M17 8c3 0 4-2 4-4-3 0-5 1-5 3"/>',
  leaf:'<path d="M20 3c-9 0-16 4-16 12a6 6 0 0 0 6 6c8 0 11-8 10-18Z"/><path d="M4 21c3-6 7-10 13-13"/>',
  cookie:'<path d="M20 10a4 4 0 0 1-4-4 3 3 0 0 1-3-3A9 9 0 1 0 21 12c0-.7-.1-1.4-.3-2"/><path d="M8 9h.01M14 14h.01M8 16h.01M13 9h.01" stroke-width="3"/>',
  shoppingBag:'<path d="M5 8h14l1 13H4L5 8ZM9 9V6a3 3 0 0 1 6 0v3"/>',
  utensils:'<path d="M4 3v7a3 3 0 0 0 6 0V3M7 3v18M16 21V9c0-3 1.5-5 4-6v18"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01" stroke-width="2.6"/>',
  house:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1V10Z"/>',
  play:'<path d="m8 5 11 7-11 7z"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  package:'<path d="m12 2 9 5-9 5-9-5 9-5ZM3 7v10l9 5 9-5V7M12 12v10M7.5 4.5l9 5"/>',
  clipboardCheck:'<rect x="5" y="4" width="14" height="18" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="m9 14 2 2 4-4"/>',
  truck:'<path d="M2 5h13v12H2zM15 9h4l3 4v4h-7M5 17a2 2 0 1 0 4 0M17 17a2 2 0 1 0 4 0"/>',
  coins:'<circle cx="10" cy="12" r="7"/><path d="M10 8v8m2.5-6.5c-1.5-1.5-4-1-4 .5 0 2 4 1 4 3 0 1.5-2.5 2-4 1M17 4c2 0 4 2 4 5M17 20c2 0 4-2 4-5"/>',
  percent:'<circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M20 4 4 20"/>',
  boxes:'<rect x="2" y="2" width="9" height="9" rx="1"/><rect x="13" y="2" width="9" height="9" rx="1"/><rect x="2" y="13" width="9" height="9" rx="1"/><rect x="13" y="13" width="9" height="9" rx="1"/>',
  message:'<path d="M21 11a8 8 0 0 1-8 8H7l-4 3v-7a8 8 0 1 1 18-4Z"/><path d="M8 11h8M8 14h5"/>',
  video:'<rect x="2" y="5" width="14" height="14" rx="2"/><path d="m16 10 6-4v12l-6-4"/>',
  map:'<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Zm6-3v15m6-12v15"/>',
  alert:'<path d="m12 3 10 18H2L12 3Z"/><path d="M12 9v5M12 18h.01" stroke-width="2.5"/>',
  pencil:'<path d="m3 21 5-.8L21 7a3 3 0 0 0-4-4L4 16l-1 5ZM14 6l4 4"/>',
  wallet:'<path d="M4 6h15a2 2 0 0 1 2 2v3h-6a3 3 0 0 0 0 6h6v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a3 3 0 0 1 3-3h13M15 14h.01"/>',
  help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4.5 1.5c-1 1-2 1-2 3M12 17h.01"/>',
  chevron:'<path d="m9 5 7 7-7 7"/>',
  sailboat:'<path d="M12 2v15M12 3l-7 12h7M14 6l6 9h-6M3 19h18l-3 3H6l-3-3Z"/>',
  check:'<path d="m4 12 5 5 11-11"/>',
  sparkle:'<path d="m12 2 2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2L12 2Z"/>'
});
function icon(name, cls='') {
  const shape=ICON_SHAPES[name];
  if(!shape)throw new Error('Unsupported UI icon: '+name);
  return '<svg class="ui-icon ui-icon-'+name+(cls?' '+cls:'')+'" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" role="presentation" aria-hidden="true" focusable="false">'+shape+'</svg>';
}

const note='<div class="notice">'+icon('info')+' 가게·상품·주문·매출 정보는 시연용입니다. 실제 판매 및 결제는 아직 제공하지 않습니다.</div>';
let selectedQty=1;
function readCart(){try{const x=JSON.parse(localStorage.getItem('smallshop-demo-cart')||'[]');return Array.isArray(x)?x.filter(z=>goods.some(p=>p[0]===z.id)&&z.qty>0):[]}catch{return []}}
function writeCart(x){localStorage.setItem('smallshop-demo-cart',JSON.stringify(x))}
function addCart(id,q){let cart=readCart();const existing=cart.find(x=>x.id===id);if(existing)existing.qty=Math.min(99,existing.qty+q);else cart.push({id:id,qty:q});writeCart(cart)}
const hanokLogo='<svg viewBox="0 0 48 48" fill="none" aria-hidden="true" width="40" height="40"><path d="M3 23 24 6l21 17-5 2-16-12L8 25z" fill="#b33e35"/><path d="M12 23h25v21H12z" fill="#b33e35"/><path d="M18 28h13v16H18z" fill="#fff7f0"/><path d="M23 28v16" stroke="#b33e35" stroke-width="2"/><path d="M9 22h30v5H9zM23 6l2-5 2 5z" fill="#9e302e"/><path d="M5 44h38" stroke="#b33e35" stroke-width="3"/></svg>';
function header(){
 const count=readCart().reduce((n,x)=>n+x.qty,0);
 return '<header class="header"><div class="wrap mast">'+
 nav('/',hanokLogo+'<span class="brandword">작은가게</span><small>좋은 사람이 만드는<br>지역의 맛, 전국으로</small>','logo')+
 '<form id="search" class="search"><input name="q" type="search" aria-label="상품 검색" placeholder="어떤 지역의 어떤 먹거리를 찾고 계신가요?"><button aria-label="검색">'+icon('search')+'</button></form>'+
 '<div class="header-account">'+nav('/',icon('user')+' 로그인','account-link')+nav('/','회원가입','account-link')+nav('/cart',icon('cart')+' <span class="cartlabel">장바구니</span>'+(count?'<b class="count">'+count+'</b>':''),'cart')+'</div></div>'+
 '<nav class="bar"><div class="wrap links">'+nav('/stores',icon('menu')+' 전체 카테고리','nav-category')+
 nav('/regions',icon('mapPin')+' 전국지도')+nav('/stores',icon('store')+' 작은가게 파트너')+nav('/records',icon('book')+' 맛집기록')+
 nav('/?q=간식',icon('cake')+' 디저트')+nav('/?q=반찬',icon('salad')+' 반찬')+nav('/?q=떡',icon('wheat')+' 떡')+nav('/?q=장아찌',icon('leaf')+' 김치')+nav('/?q=한과',icon('cookie')+' 한과')+
 '</div></nav></header>';
}
function footer(){return '<footer class="footer"><div class="wrap foot"><div><strong>'+icon('house')+' 작은가게</strong><p>지역의 작은 먹거리와 가게 이야기를 발견합니다.</p><small>일부 예시 음식 사진: 쬬미뉘 (CC BY 4.0), stegano (Public Domain), Hankook12 (CC0) · Wikimedia Commons</small></div><span>데모 사이트 · 실제 구매 불가</span><div>'+nav('/partner','사장님센터')+' &nbsp; '+nav('/admin','관리자센터')+'</div></div></footer>'}
function heading(title,path,action){return '<div class="heading"><h2>'+title+'</h2>'+(path?nav(path,(action||'전체 보기')+' →','more'):'')+'</div>'}
function intro(top,title,description){return '<div class="intro"><small>'+top+'</small><h1>'+title+'</h1><p>'+description+'</p></div>'}
function productTile(g){const s=stores[g[1]];return nav('/product/'+g[0],'<div class="tilepic">'+img(photo[s[5]],g[2])+'<span>'+s[2]+'</span></div><div class="tilebody"><small>'+g[4]+' · 데모 상품</small><h3>'+g[2]+'</h3><div class="tilefoot"><b>'+won(g[3])+'</b><small>상품 보기 ›</small></div></div>','tile')}
function storeTile(s){return nav('/store/'+s[0],img(photo[s[5]],s[1])+'<div class="storetext"><small>'+s[2]+' · '+s[4]+'</small><h3>'+s[1]+'</h3><p>지역 먹거리와 점주 인터뷰를 소개하는 예시입니다.</p><strong>가게 이야기 보기 →</strong></div>','storetile')}
function regionChips(){return '<div class="chips">'+regions.map(r=>nav('/region/'+r[0],'⌖ '+r[1])).join('')+'</div>'}
function recordTile(r){return '<div class="record">'+img(r[3],r[0])+'<div><small>'+r[1]+'</small><h3>'+r[0]+'</h3><p>방문 당시 메뉴·가격 기록 예시입니다.</p><b>'+won(r[2])+'</b></div></div>'}

/* This map uses example city centers, never invented individual store addresses. */
window.smallshopMapStores=stores.map(s=>{
 const first=goods.find(g=>stores[g[1]][0]===s[0]);
 return {id:s[0],name:s[1],region:s[2],city:s[3],category:s[4],
   photo:photo[s[5]],productId:first?first[0]:null,
   productName:first?first[2]:null,productPrice:first?first[3]:null};
});
function storeMapPanel(scope='all',size='wide'){
 const regional=scope==='all'?stores:stores.filter(s=>s[3]===scope);
 const title=size==='compact'?'지역으로 찾기':scope==='all'?'지도에서 작은가게 찾기':'이 지역의 작은가게';
 const descriptions=size==='compact'?'지도를 움직이고 가게 핀을 선택해 보세요.':'지도를 확대하면 개별 가게를 선택할 수 있습니다.';
 const list=regional.map(s=>'<article class="map-list-item">'+
   img(photo[s[5]],s[1])+'<div class="map-list-summary"><small>'+esc(s[2])+' · '+esc(s[4])+'</small>'+
   '<strong>'+esc(s[1])+'</strong><span>매장 주소 미확인 · 지역 중심 표시</span>'+
   '<div class="map-list-actions"><button type="button" data-map-focus="'+esc(s[0])+'">'+icon('mapPin')+' 지도에서 보기</button>'+
   nav('/store/'+s[0],'가게 이야기 →')+'</div></div></article>').join('');
 return '<div class="store-map-shell map-size-'+size+'" data-smallshop-map="'+esc(scope)+'">'+
 '<div class="store-map-heading"><div><h2>'+icon('mapPin')+' '+title+'</h2><p>'+descriptions+'</p></div>'+
 '<div class="store-map-buttons" role="group" aria-label="가게 탐색 방식">'+
 '<button type="button" data-map-view="map" aria-pressed="true">'+icon('map')+' <span>지도</span></button>'+
 '<button type="button" data-map-view="list" aria-pressed="false">'+icon('menu')+' <span>목록</span></button></div></div>'+
 '<div class="store-map-view"><div class="store-map-canvas" role="region" tabindex="0" aria-label="가게 위치를 지역 중심으로 표시한 확대 가능한 지도">'+
 '<div class="map-loading">'+icon('map')+' 지도를 불러오는 중입니다…</div></div>'+
 '<div class="map-selected-card" aria-live="polite" hidden></div>'+
 '</div><div class="store-map-list" hidden>'+list+'</div>'+
 '<div class="store-map-bottom"><small>'+regional.length+'개 시연 가게 · 핀은 <strong>지역 중심</strong> 표시이며 실제 매장 위치가 아닙니다.</small>'+
 (size==='compact'?nav('/regions','전국 지도 크게 보기 →','store-map-all-link'):
 '<button type="button" data-map-reset>'+icon('map')+' 전국 보기</button>')+'</div></div>';
}
function regionArtwork(){
 return storeMapPanel('all','compact');
}

function home(){
 const searchTerm=new URLSearchParams(location.search).get('q')||'';
 const filtered=goods.filter(g=>[g[2],g[4],stores[g[1]][1],stores[g[1]][2]].join(' ').includes(searchTerm));
 return note+
 '<section class="home-cinema">'+
 '<div class="cinema-food">'+img(photo.a,'꿀빵을 만드는 가게의 음식 이미지')+'</div>'+
 '<div class="cinema-overlay"><small>사람이 만든, 지역의 진짜 맛</small><h1>전국의 <em>작은 맛</em>을 찾아서</h1>'+
 '<p>한 사람의 이야기로 더 특별해지는 지역의 먹거리<br>작은가게가 전국의 좋은 사장님들을 소개합니다.</p>'+
 nav('/stores','지금, 이야기를 만나보세요 →','cinema-action')+'</div>'+
 '<div class="cinema-aside"><div class="cinema-quote">“ 좋은 재료, 정성스러운 손맛.<br>지역의 이야기가 담긴 먹거리 ”</div>'+
 '<p>현장 인터뷰는 촬영·동의 후 공개됩니다.</p><div class="cinema-play">'+icon('play')+' 인터뷰 준비 중</div></div>'+
 '<div class="cinema-pager">● &nbsp; ○ &nbsp; ○ &nbsp; ○</div></section>'+
 '<div class="discovery"><section class="geo-panel">'+regionArtwork()+'</section>'+
 '<section class="story-panel"><div class="story-head"><span>이달의 작은가게</span><small>01 / 03 &nbsp; ›</small></div>'+
 '<div class="story-content"><div class="story-gallery"><div class="story-main-image">'+img(photo.g,'통영 꿀빵 이미지')+'</div><div class="story-thumb-strip">'+img(photo.g,'꿀빵')+img(photo.e,'전통 과자')+img(photo.d,'바닷가 가게')+'</div></div>'+
 '<div class="story-description"><small>바다의 달콤함을 담은</small><h2>통영 꿀빵 작업실</h2><p>'+icon('mapPin')+' 경남 통영시</p><p>지역의 이야기를 담아 정성으로 만드는 먹거리를 소개합니다.<br>현장 인터뷰는 준비 중입니다.</p>'+
 '<div class="story-actions">'+nav('/store/tongyeong-honey','가게 이야기 →','story-primary')+nav('/product/honeybread-10','상품 보기 →','story-secondary')+'</div>'+
 '<div class="story-quote">“ 좋은 재료와 정성을 한 입에 담고 싶습니다. ”<small>가게 소개 예시 문구</small></div></div></div></section></div>'+
 '<section class="section shelf">'+heading(icon('shoppingBag')+' 배송 가능한 작은가게','/stores','전체 상품 보기')+'<p class="shelf-intro">전국의 작은가게가 정성껏 만든 먹거리를 집에서도 만나보세요.</p>'+
 (searchTerm?'<p class="muted">검색: '+esc(searchTerm)+' · '+filtered.length+'개</p>':'')+
 '<div class="products">'+filtered.map((g,i)=>'<div class="merch-tile">'+productTile(g)+'<div class="merch-label">'+(i%3===0?'BEST':i%3===1?'인기':'추천')+'</div><div class="shipping-label">전국배송</div></div>').join('')+'</div></section>'+
 '<section class="section local-records">'+heading(icon('utensils')+' 그 동네에서 먹고 왔어요','/records','맛집기록 더보기')+'<p class="shelf-intro">작은가게가 직접 다녀온 지역의 맛집을 소개합니다.</p><div class="records">'+records.map(recordTile).join('')+'</div></section>';
}
function regionsPage(){
 return note+intro('전국지도 · 지도 기반 탐색','지도에서 작은가게를 찾아보세요','예시 가게 6곳을 지역 중심 좌표로 표시합니다. 지도를 확대하거나 목록에서 가게를 선택하세요.')+
 '<section class="national-map">'+storeMapPanel('all','full')+'</section>'+
 '<section class="section region-browse">'+heading('지역별 가게 찾기')+
 '<div class="regions">'+regions.map(r=>nav('/region/'+r[0],
 '<div class="pin">'+icon('mapPin')+'</div><small>'+r[2]+'</small><h2>'+r[1]+'</h2><p>'+
 stores.filter(s=>s[3]===r[0]).length+'개 시연 가게</p><span>지역 보기 →</span>','region')).join('')+'</div></section>';
}

function oneRegion(id){
 const r=regions.find(r=>r[0]===id);
 if(!r)return notfound();
 const selectedStores=stores.filter(s=>s[3]===id);
 return note+'<div class="crumb">'+nav('/regions','전국지도')+' / '+r[1]+'</div>'+
 intro(r[2]+' · 지역별 검색',r[1]+'의 작은가게','지역 중심 지도와 가게·상품 예시를 함께 확인하세요.')+
 '<section class="local-map">'+storeMapPanel(id,'regional')+'</section>'+
 '<section class="section">'+heading('이 지역의 가게')+'<div class="stores">'+selectedStores.map(storeTile).join('')+'</div></section>'+
 '<section class="section">'+heading('대표 상품')+'<div class="products">'+
 goods.filter(g=>selectedStores.some(s=>s[0]===stores[g[1]][0])).map(productTile).join('')+
 '</div></section>';
}

function storesPage(){return note+intro('지역 먹거리 가게','작은가게 파트너','실제 입점 및 인터뷰가 진행되면 검증된 가게 정보를 게시합니다.')+'<div class="stores">'+stores.map(storeTile).join('')+'</div>'}
function oneStore(id){const st=stores.find(s=>s[0]===id);if(!st)return notfound();return note+'<div class="crumb">'+nav('/stores','작은가게')+' / '+st[2]+' / '+st[1]+'</div><div class="storehero"><div class="storephoto">'+img(photo[st[5]],st[1])+'<div>'+st[2]+' · '+st[4]+'<h1>'+st[1]+'</h1></div></div><div class="story"><small>작은가게 인터뷰</small><h1>가게 이야기를<br>만나보세요</h1><p>실제 점주 인터뷰 및 유튜브 영상은 추후 공개됩니다.</p>'+status(icon('play')+' 인터뷰 준비 중')+'</div></div><section class="section">'+heading('가게 소개')+'<div class="panel"><p>'+st[1]+' · '+st[2]+' · '+st[4]+'</p><p>배송·매장 정보는 실제 입점 검증 후 안내합니다.</p></div></section><section class="section">'+heading('이 가게의 대표 상품')+'<div class="products">'+goods.filter(g=>stores[g[1]][0]===id).map(productTile).join('')+'</div></section><section class="section">'+heading('사장님 이야기')+'<div class="quiet">'+icon('video')+' 현장 인터뷰 영상 준비 중</div></section>'}
function oneProduct(id){const g=goods.find(x=>x[0]===id);if(!g)return notfound();const st=stores[g[1]];return note+'<div class="crumb">'+nav('/','홈')+' / '+nav('/store/'+st[0],st[1])+' / '+g[2]+'</div><div class="detail"><div><div class="detailimg">'+img(photo[st[5]],g[2])+'</div><small>상품 사진은 시연용 이미지입니다.</small></div><div class="buy"><small>'+st[2]+' · 데모 상품</small><h1>'+g[2]+'</h1><p>'+nav('/store/'+st[0],icon('store')+' '+st[1]+' →','green')+'</p><p>가격과 배송 정보는 실제 입점 후 확정됩니다.</p><b class="price">'+won(g[3])+'</b><div class="delivery"><span>'+icon('truck')+' 배송비 · 확인 전</span><span>'+icon('package')+' 원재료·보관법 · 확인 전</span><span>'+icon('info')+' 실제 결제 · 미연결</span></div><div class="qrow"><b>수량</b><div class="quantity"><button data-qty="-1">−</button><span id="qty">'+selectedQty+'</span><button data-qty="1">+</button></div><b id="amount">'+won(g[3]*selectedQty)+'</b></div><button class="primary" data-add="'+id+'">'+icon('shoppingBag')+' 장바구니 담기</button><div id="addnotice"></div><p><small>실제 결제·주문은 제공하지 않습니다.</small></p></div></div><div class="tabs"><a href="#detail">상품 소개</a><a href="#seller">가게 이야기</a><a href="#delivery">배송 안내</a></div><section class="section" id="detail">'+heading('상품 소개')+'<div class="article"><div><h3>'+g[2]+'</h3><p>시연용 예시 상품입니다. 판매자 확인을 거친 원재료·알레르기·유통기한·보관방법 등을 등록할 예정입니다.</p></div>'+img(photo[st[5]],g[2])+'</div></section><section class="section" id="seller">'+heading('점주 인터뷰')+'<div class="quiet">'+icon('video')+' 촬영 동의 후 공개됩니다.</div></section><section class="section" id="delivery">'+heading('배송·교환·환불')+'<p class="muted">실제 판매자별 상세 기준은 입점 후 등록합니다.</p></section>'}
function cartPage(){const cart=readCart();const total=cart.reduce((n,c)=>{const g=goods.find(x=>x[0]===c.id);return n+(g?g[3]*c.qty:0)},0);return note+intro('','장바구니','체험은 가능하지만 실제 주문·결제는 진행되지 않습니다.')+(cart.length?'<div class="cartlayout"><div class="panel">'+cart.map(c=>{const g=goods.find(g=>g[0]===c.id),s=stores[g[1]];return '<div class="cartrow">'+img(photo[s[5]],g[2])+'<div>'+nav('/product/'+g[0],'<b>'+g[2]+'</b>')+'<small>'+s[2]+'</small><strong>'+won(g[3])+'</strong></div><div class="quantity"><button data-cid="'+g[0]+'" data-delta="-1">−</button>'+c.qty+'<button data-cid="'+g[0]+'" data-delta="1">+</button></div><button class="remove" data-remove="'+g[0]+'">삭제</button></div>'}).join('')+'</div><aside class="panel summary"><h2>주문 요약</h2><p>상품 합계 <b>'+won(total)+'</b></p><p>배송비 <b>미정</b></p><p>상품 금액 <b>'+won(total)+'</b></p><button class="primary" disabled>결제 준비 중</button><small>PG 및 실제 입점 계약 이후 제공됩니다.</small></aside></div>':'<div class="panel empty">장바구니에 담긴 상품이 없습니다. '+nav('/','상품 둘러보기 →','red')+'</div>')}
function recordsPage(){return note+intro('현장 탐방 · 맛집기록','그 동네에서 먹고 왔어요','입점 여부와 무관하게 지역 먹거리를 기록합니다. 현재 예시 자료입니다.')+'<div class="records recordswide">'+records.map(recordTile).join('')+'</div>'}
const orders=[['DEMO-001','꿀빵 10개입','13,000원','결제완료'],['DEMO-002','장아찌 500g','16,000원','상품준비'],['DEMO-003','한과 세트','18,000원','배송중']];
function table(){return '<div class="scroller"><table><thead><tr><th>주문번호</th><th>상품</th><th>금액</th><th>상태</th></tr></thead><tbody>'+orders.map(r=>'<tr>'+r.map((cell,i)=>'<td>'+(i===3?status(cell):cell)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>'}
function kv(rows){return '<div class="kv">'+rows.map(r=>'<p>'+r[0]+'<b>'+r[1]+'</b></p>').join('')+'</div>'}
function tasks(rows){return '<div class="tasks">'+rows.map(r=>'<div>▤ <b>'+r[0]+'</b><strong>'+r[1]+'</strong></div>').join('')+'</div>'}
function statBoxes(list){
 return '<div class="metrics">'+list.map(item=>
   '<div class="statbox"><span class="stat-icon">'+icon(item[2])+'</span><small>'+item[0]+'</small><b>'+item[1]+'</b><small class="stat-note">시연 데이터</small></div>'
 ).join('')+'</div>';
}
function taskPanel(list){
 return '<div class="tasklist-rich">'+list.map((item,i)=>
 '<div class="task-rich"><span class="task-circle">'+icon(['clipboardCheck','message','pencil','package'][i%4])+'</span><div><strong>'+item[0]+'</strong><small>'+item[2]+'</small></div><b>'+item[1]+'</b><span class="task-arrow">›</span></div>'
 ).join('')+'</div>';
}
function demoTable(rows,headings){
 return '<div class="scroller"><table class="ops-table"><thead><tr>'+headings.map(x=>'<th>'+x+'</th>').join('')+'</tr></thead><tbody>'+
 rows.map(row=>'<tr>'+row.map((v,i)=>'<td>'+(i===row.length-1?status(v):v)+'</td>').join('')+'</tr>').join('')+
 '</tbody></table></div>';
}
function stockList(){
 const sample=[[goods[0],12],[goods[2],8],[goods[4],15]];
 return '<div class="stock-list">'+sample.map(pair=>{
 const item=pair[0];const st=stores[item[1]];
 return '<div class="stock-row">'+img(photo[st[5]],item[2])+'<div><b>'+item[2]+'</b><small>'+icon('alert')+' 재고 '+pair[1]+'개 남음</small><small>시연 데이터</small></div>'+nav('/product/'+item[0],icon('chevron'),'stock-next')+'</div>';
 }).join('')+'</div>';
}
function partnerProducts(){
 return '<div class="partner-item-grid">'+goods.filter(x=>x[1]===0||x[1]===2||x[1]===4).slice(0,3).map(g=>{
  const st=stores[g[1]];
  return '<div class="partner-item">'+img(photo[st[5]],g[2])+'<b>'+g[2]+'</b><strong>'+won(g[3])+'</strong><small>데모 상품 · 수정 기능 준비 중</small>'+nav('/product/'+g[0],'상품 보기 →','partner-item-link')+'</div>';
 }).join('')+'</div>';
}
function dashPanel(title,contents,label,cls=''){
 return '<section id="'+cls+'" class="panel '+cls+'"><div class="ops-panel-title"><h2>'+title+'</h2><span>'+label+'</span></div>'+contents+'</section>';
}
function dashboard(admin){
 const navs=admin?['대시보드','입점·가게','상품','주문·정산','콘텐츠']:['홈','상품','주문/배송','정산','내 가게','문의/도움말'];
 const metrics=admin?[
  ['입점 가게','6곳','store'],['승인 대기','3건','clock'],['등록 상품','6개','package'],
  ['오늘 주문','3건','cart'],['이번 달 거래액','47,000원','coins'],['예상 수수료 (1%)','470원','percent']
 ]:[
  ['신규 주문','5건','clipboardCheck'],['배송 대기','3건','truck'],
  ['이번 달 매출','418,000원','coins'],['정산 예정액','356,000원','wallet']
 ];
 let panels='';
 if(admin){
  panels+=dashPanel(icon('clipboardCheck')+' 오늘 처리할 일',taskPanel([
   ['입점 승인','3건','신규 신청 검토 대기'],
   ['배송 지연 문의','2건','점주 확인 필요'],
   ['상품 수정 요청','4건','변경사항 검토 필요'],
   ['정산 검토','1건','입금 전 확인']
  ]),'검토 현황 · 예시','panel-tasks');
  panels+=dashPanel(icon('clock')+' 승인 대기 가게',
    demoTable([
      ['통영 꿀빵 작업실','경남 통영','꿀빵','검토 대기'],
      ['전주 장아찌 가게','전북 전주','장아찌','검토 대기'],
      ['강릉 한과 가게','강원 강릉','한과','검토 대기']
    ],['가게명','지역','주요 상품','상태'])+
   '<div id="panel-products" class="quick-products"><b>등록 상품 미리보기</b>'+
   goods.slice(0,3).map(g=>'<div>'+g[2]+'<span>'+won(g[3])+'</span></div>').join('')+'</div>',
   '3건 · 예시','panel-approval');
  panels+=dashPanel(icon('cart')+' 최근 주문',demoTable([
   ['DEMO-001','통영 꿀빵 작업실','13,000원','결제완료'],
   ['DEMO-002','전주 장아찌 가게','16,000원','상품준비'],
   ['DEMO-003','강릉 한과 가게','18,000원','배송중']
  ],['주문번호','가게','주문금액','상태']),'전체 주문','panel-orders');
  panels+=dashPanel(icon('message')+' 배송 지연 / 문의',demoTable([
   ['DEMO-001','배송일이 궁금해요','답변 대기'],
   ['DEMO-002','구성 확인 요청','답변 대기'],
   ['DEMO-003','상품 상태 문의','접수']
  ],['주문번호','문의 내용','상태']),'3건 · 예시','panel-inquiries');
  panels+=dashPanel(icon('video')+' 콘텐츠 현황',
   '<div class="content-progress">'+[
     ['인터뷰 영상','0편',0],['맛집기록','3건',60],['촬영 준비','6곳',70]
   ].map(v=>'<div><span>'+v[0]+'</span><strong>'+v[1]+'</strong><div class="progress-track"><i style="width:'+v[2]+'%"></i></div></div>').join('')+'</div>',
   '플랫폼 제작','panel-content');
  panels+=dashPanel(icon('map')+' 지역별 입점 분포',
   '<div class="dash-regions">'+regions.map(r=>'<div><span>'+r[1]+'</span><b>1곳</b></div>').join('')+'</div>'+
   '<small class="dashboard-note">등록된 6개 시연 가게 기준</small>','6지역','panel-regions');
  panels+=dashPanel(icon('wallet')+' 수수료 / 정산 요약',
   '<div class="accounting-amount"><small>시연 거래액</small><strong>47,000원</strong></div>'+
   kv([['판매 중개수수료 1%','470원'],['PG 수수료','별도'],['배송·포장 비용','점주별 상이']])+
   '<small class="dashboard-note">실제 정산금이 아닙니다.</small>',
   '이번 달 · 예시','panel-settlement');
 } else {
  panels+=dashPanel(icon('clipboardCheck')+' 오늘 처리할 일',taskPanel([
   ['송장번호 입력하기','3건','배송 준비 중'],
   ['주문 확인하기','2건','신규 주문 접수'],
   ['재고 부족 상품 확인하기','1건','재고 경고'],
   ['고객 문의 답변하기','1건','확인 대기']
  ]),'총 7건 · 예시','panel-tasks');
  panels+=dashPanel(icon('store')+' 내 가게 정보',kv([
   ['가게명','통영 꿀빵 작업실'],['지역','경남 통영시'],
   ['상품','꿀빵 · 간식'],['배송 가능 지역','전국 택배 (시연)'],
   ['인터뷰 콘텐츠','촬영 준비 중']
  ]),'가게 정보 보기','panel-shop');
  panels+=dashPanel(icon('truck')+' 주문/배송 현황',demoTable([
   ['DEMO-001','꿀빵 10개입','13,000원','결제완료'],
   ['DEMO-002','꿀빵 선물세트','26,000원','상품준비'],
   ['DEMO-003','꿀빵 10개입','13,000원','배송중'],
   ['DEMO-004','꿀빵 세트','28,000원','배송완료']
  ],['주문번호','상품','금액','상태']),'전체 주문 보기','panel-orders');
  panels+=dashPanel(icon('alert')+' 품절 임박 상품',stockList(),'재고 확인','panel-stock');
  panels+=dashPanel(icon('package')+' 대표 상품 관리',partnerProducts(),'상품 보기','panel-products');
  panels+=dashPanel(icon('wallet')+' 정산 예정 내역',
   '<div class="settlement-well"><small>다음 정산 예정 금액 (시연)</small><b>356,000원</b></div>'+
   kv([['플랫폼 판매 중개수수료','1%'],['PG·배송 관련 비용','별도 정산']])+
   '<small class="dashboard-note">확정 정산이 아닌 예시 화면</small>',
   '정산 내역 보기','panel-settlement');
  panels+=dashPanel(icon('video')+' 인터뷰 콘텐츠',
   '<div class="interview-box">'+img(photo.a,'가게 인터뷰 예시 이미지')+
   '<div><b>통영의 달콤한 이야기를 담을 예정입니다.</b><p>영상 촬영과 편집·게시 관리는 작은가게 운영팀이 담당합니다.</p>'+status('촬영 준비 중')+'</div></div>',
   '촬영 상태 보기','panel-interview');
  panels+=dashPanel(icon('sparkle')+' 작은가게 사장님 팁',
   '<div class="tip-box">상품 설명과 대표 사진이 구매자의 이해를 돕습니다.<br><small>사진·인터뷰 콘텐츠 수정이 필요하면 운영팀에 요청할 수 있습니다.</small></div>',
   '운영 가이드','panel-tip');
 }
 return note+
  '<div class="dashboard '+(admin?'dashboard-admin':'dashboard-partner')+'">'+
   '<aside class="sidebar">'+
    '<h3>'+(admin?'작은가게 관리자':'작은가게 파트너센터')+'</h3>'+
     navs.map((x,i)=>'<a href="#'+(admin?['panel-tasks','panel-approval','panel-products','panel-orders','panel-content'][i]:['panel-tasks','panel-products','panel-orders','panel-settlement','panel-shop','panel-interview'][i])+'"><span class="sidebar-symbol">'+icon(['house','package','cart','wallet','video','help'][i])+'</span>'+x+'</a>').join('')+
    '<div class="sidebar-illustration" aria-hidden="true"><div class="coast-icon">'+icon('sailboat')+'</div><small>지역의 맛을 전국으로</small></div>'+
   '</aside><div class="dashmain">'+
    '<div class="dashtop"><div><small>'+(admin?'작은가게 운영팀':'통영 꿀빵 작업실 · 사장님 데모')+'</small>'+
    '<h1>'+(admin?'관리자님, 좋은 하루입니다.':'사장님, 오늘도 좋은 하루 되세요!')+'</h1>'+
    '<p>'+(admin?'오늘 처리할 업무를 확인하고 작은가게를 운영해 보세요.':'지역의 좋은 먹거리를 소개해 주셔서 감사합니다.')+'</p></div>'+
    nav('/','작은가게 바로가기 →','outline')+'</div>'+
    statBoxes(metrics)+'<div class="dashcards">'+panels+'</div>'+
   '</div></div>';
}
function notfound(){return '<div class="panel empty"><h1>페이지가 없습니다.</h1>'+nav('/','홈으로 돌아가기 →','red')+'</div>'}
function route(){let path=decodeURI(location.pathname);if(BASE&&path.startsWith(BASE))path=path.slice(BASE.length);const seg=path.split('/').filter(Boolean);switch(seg[0]){
 case undefined:return ['전국의 작은 먹거리를 찾아서',home()];
 case 'regions':return ['전국지도',regionsPage()];
 case 'region':return ['지역별 가게',oneRegion(seg[1])];
 case 'stores':return ['작은가게',storesPage()];
 case 'store':return ['가게 상세',oneStore(seg[1])];
 case 'product':return ['상품 상세',oneProduct(seg[1])];
 case 'records':return ['맛집기록',recordsPage()];
 case 'cart':return ['장바구니',cartPage()];
 case 'admin':return ['관리자 데모',dashboard(true)];
 case 'partner':return ['사장님 데모',dashboard(false)];
 default:return ['페이지를 찾을 수 없음',notfound()]
 }}
function render(scroll){if(window.SmallshopMap)window.SmallshopMap.cleanup();const r=route();document.title=r[0]+' | 작은가게';const path=location.pathname.replace(BASE,'');document.body.classList.toggle('dashboard-mode',path.startsWith('/admin')||path.startsWith('/partner'));document.body.classList.toggle('dashboard-partner-view',path.startsWith('/partner'));document.getElementById('app').innerHTML=header()+'<main class="wrap main">'+r[1]+'</main>'+footer();window.dispatchEvent(new Event('smallshop:rendered'));if(scroll)window.scrollTo(0,0)}
function goto(url){history.pushState(null,'',link(url));selectedQty=1;render(true)}
document.addEventListener('click',e=>{
 const l=e.target.closest('a[data-route]');if(l&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.altKey){e.preventDefault();const u=new URL(l.href);let pathname=u.pathname;if(BASE&&pathname.startsWith(BASE))pathname=pathname.slice(BASE.length);goto(pathname+u.search);return}
 const q=e.target.closest('button[data-qty]');if(q){selectedQty=Math.max(1,Math.min(99,selectedQty+Number(q.dataset.qty)));const g=goods.find(x=>location.pathname.includes(x[0]));if(g){document.getElementById('qty').textContent=selectedQty;document.getElementById('amount').textContent=won(g[3]*selectedQty)}return}
 const add=e.target.closest('button[data-add]');if(add){addCart(add.dataset.add,selectedQty);document.getElementById('addnotice').innerHTML='장바구니에 담겼습니다. '+nav('/cart','장바구니 보기 →','red');return}
 const ch=e.target.closest('button[data-cid]');if(ch){const a=readCart(),r=a.find(x=>x.id===ch.dataset.cid);if(r)r.qty=Math.min(99,Math.max(1,r.qty+Number(ch.dataset.delta)));writeCart(a);render(false);return}
 const rem=e.target.closest('button[data-remove]');if(rem){writeCart(readCart().filter(x=>x.id!==rem.dataset.remove));render(false)}
});
document.addEventListener('submit',e=>{if(e.target.id==='search'){e.preventDefault();const v=e.target.querySelector('input').value.trim();history.pushState(null,'',link('/'+(v?'?q='+encodeURIComponent(v):'')));render(true)}});
window.addEventListener('popstate',()=>render(false));
render(false);
const mapModule=document.createElement('script');
mapModule.src=BASE+'/assets/map.js';
mapModule.async=true;
document.body.appendChild(mapModule);
})();