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
 f:'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?auto=format&fit=crop&w=960&q=82'
};
const regions=[['tongyeong','통영시','경남'],['jeonju','전주시','전북'],['gangneung','강릉시','강원'],['busan','부산광역시','부산'],['gongju','공주시','충남'],['jeju','제주시','제주']];
const stores=[
 ['tongyeong-honey','통영 꿀빵 작업실','경남 통영시','tongyeong','꿀빵','a'],
 ['jeonju-pickle','전주 장아찌 가게','전북 전주시','jeonju','장아찌','b'],
 ['gangneung-hangwa','강릉 한과 가게','강원 강릉시','gangneung','한과','c'],
 ['busan-eomuk','부산 어묵 가게','부산광역시','busan','어묵','d'],
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
const note='<div class="notice">ⓘ 가게·상품·주문·매출 정보는 시연용입니다. 실제 판매 및 결제는 아직 제공하지 않습니다.</div>';
let selectedQty=1;
function readCart(){try{const x=JSON.parse(localStorage.getItem('smallshop-demo-cart')||'[]');return Array.isArray(x)?x.filter(z=>goods.some(p=>p[0]===z.id)&&z.qty>0):[]}catch{return []}}
function writeCart(x){localStorage.setItem('smallshop-demo-cart',JSON.stringify(x))}
function addCart(id,q){let cart=readCart();const existing=cart.find(x=>x.id===id);if(existing)existing.qty=Math.min(99,existing.qty+q);else cart.push({id:id,qty:q});writeCart(cart)}
const hanokLogo='<svg viewBox="0 0 48 48" fill="none" aria-hidden="true" width="40" height="40"><path d="M3 23 24 6l21 17-5 2-16-12L8 25z" fill="#b33e35"/><path d="M12 23h25v21H12z" fill="#b33e35"/><path d="M18 28h13v16H18z" fill="#fff7f0"/><path d="M23 28v16" stroke="#b33e35" stroke-width="2"/><path d="M9 22h30v5H9zM23 6l2-5 2 5z" fill="#9e302e"/><path d="M5 44h38" stroke="#b33e35" stroke-width="3"/></svg>';
function header(){
 const count=readCart().reduce((n,x)=>n+x.qty,0);
 return '<header class="header"><div class="wrap mast">'+
 nav('/',hanokLogo+'<span class="brandword">작은가게</span><small>좋은 사람이 만드는<br>지역의 맛, 전국으로</small>','logo')+
 '<form id="search" class="search"><input name="q" type="search" aria-label="상품 검색" placeholder="어떤 지역의 어떤 먹거리를 찾고 계신가요?"><button aria-label="검색">⌕</button></form>'+
 '<div class="header-account">'+nav('/','♙ 로그인','account-link')+nav('/','회원가입','account-link')+nav('/cart','🛒 <span class="cartlabel">장바구니</span>'+(count?'<b class="count">'+count+'</b>':''),'cart')+'</div></div>'+
 '<nav class="bar"><div class="wrap links">'+nav('/stores','☰ &nbsp; 전체 카테고리','nav-category')+
 nav('/regions','📍 전국지도')+nav('/stores','🌺 작은가게 파트너')+nav('/records','🫙 맛집기록')+
 nav('/?q=간식','🍮 디저트')+nav('/?q=반찬','🥗 반찬')+nav('/?q=떡','🍡 떡')+nav('/?q=장아찌','🥬 김치')+nav('/?q=한과','🍪 한과')+
 '</div></nav></header>';
}
function footer(){return '<footer class="footer"><div class="wrap foot"><div><strong>⌂ 작은가게</strong><p>지역의 작은 먹거리와 가게 이야기를 발견합니다.</p></div><span>데모 사이트 · 실제 구매 불가</span><div>'+nav('/partner','사장님센터')+' &nbsp; '+nav('/admin','관리자센터')+'</div></div></footer>'}
function heading(title,path,action){return '<div class="heading"><h2>'+title+'</h2>'+(path?nav(path,(action||'전체 보기')+' →','more'):'')+'</div>'}
function intro(top,title,description){return '<div class="intro"><small>'+top+'</small><h1>'+title+'</h1><p>'+description+'</p></div>'}
function productTile(g){const s=stores[g[1]];return nav('/product/'+g[0],'<div class="tilepic">'+img(photo[s[5]],g[2])+'<span>'+s[2]+'</span></div><div class="tilebody"><small>'+g[4]+' · 데모 상품</small><h3>'+g[2]+'</h3><div class="tilefoot"><b>'+won(g[3])+'</b><small>상품 보기 ›</small></div></div>','tile')}
function storeTile(s){return nav('/store/'+s[0],img(photo[s[5]],s[1])+'<div class="storetext"><small>'+s[2]+' · '+s[4]+'</small><h3>'+s[1]+'</h3><p>지역 먹거리와 점주 인터뷰를 소개하는 예시입니다.</p><strong>가게 이야기 보기 →</strong></div>','storetile')}
function regionChips(){return '<div class="chips">'+regions.map(r=>nav('/region/'+r[0],'⌖ '+r[1])).join('')+'</div>'}
function recordTile(r){return '<div class="record">'+img(r[3],r[0])+'<div><small>'+r[1]+'</small><h3>'+r[0]+'</h3><p>방문 당시 메뉴·가격 기록 예시입니다.</p><b>'+won(r[2])+'</b></div></div>'}
function regionArtwork(){
 return '<div class="map-art" aria-label="지역별 안내용 한국 지도 일러스트">'+
 '<svg viewBox="0 0 420 340" aria-hidden="true" preserveAspectRatio="xMidYMid meet">'+
 '<defs><linearGradient id="land" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#d8e5c5"/><stop offset=".65" stop-color="#b4d4b1"/><stop offset="1" stop-color="#e5ddb8"/></linearGradient><pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r="2" fill="#d0dfc9"/></pattern></defs>'+
 '<rect width="420" height="340" fill="#e6f2f2"/><g opacity=".55" fill="none" stroke="#99c7d5" stroke-width="2"><path d="M21 78q8-6 16 0t16 0M327 46q8-6 16 0t16 0M345 240q7-6 14 0t14 0M29 287q8-5 16 0t16 0"/></g>'+
 '<path d="M196 10l42 18 19 28-5 31 25 29-8 31 27 35-12 31 13 18-33 30-12 30-19-5-13 27-38 8-26-20-19-10-9-29-15-15 5-31-15-23 21-39-7-26 20-33-4-32 33-26z" fill="url(#land)" stroke="#a5c39d" stroke-width="3"/>'+
 '<path d="M165 26l36 44-20 46 30 38-27 38 16 29-29 49M241 55l-12 72 27 38-17 55 24 30M145 142l118 8M137 225l133-9" stroke="#f8f5e8" stroke-width="2.5" opacity=".85" fill="none"/>'+
 '<g fill="#8eb78d" opacity=".8"><circle cx="174" cy="67" r="11"/><circle cx="219" cy="103" r="10"/><circle cx="157" cy="180" r="10"/><circle cx="239" cy="247" r="12"/><circle cx="182" cy="251" r="9"/></g>'+
 '<g fill="#63956d"><path d="M170 65v-17m-10 10 10-10 10 10M216 102V84m-8 10 8-10 8 10M153 180v-15m-8 8 8-8 8 8M234 249v-18m-9 10 9-10 9 10" stroke="#63956d" stroke-width="4" stroke-linecap="round"/></g>'+
 '<g fill="#cde0c4" stroke="#fff" stroke-width="2"><ellipse cx="170" cy="305" rx="21" ry="13"/><ellipse cx="209" cy="319" rx="10" ry="5"/></g>'+
 '<g fill="#7eafaf" opacity=".7"><path d="M56 299q6-5 12 0t12 0M330 293q6-5 12 0t12 0" fill="none" stroke="#7eafaf" stroke-width="2"/></g></svg>'+
 '<div class="map-pins">'+
 nav('/region/tongyeong','📍 경남 42','map-pin mp-gyeongnam')+
 nav('/region/jeonju','📍 전북 18','map-pin mp-jeonbuk')+
 nav('/region/gangneung','📍 강원 28','map-pin mp-gangwon')+
 nav('/region/gongju','📍 충남 56','map-pin mp-chungnam')+
 nav('/region/jeju','📍 제주 8','map-pin mp-jeju')+
 nav('/region/busan','📍 부산 14','map-pin mp-busan')+
 '</div><span class="map-warning">숫자는 디자인 시연용입니다</span></div>';
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
 '<p>현장 인터뷰는 촬영·동의 후 공개됩니다.</p><div class="cinema-play">▶ &nbsp; 인터뷰 준비 중</div></div>'+
 '<div class="cinema-pager">● &nbsp; ○ &nbsp; ○ &nbsp; ○</div></section>'+
 '<div class="discovery"><section class="geo-panel"><div class="geo-copy"><h2>📍 지역으로 찾기</h2><p>지도를 선택하면 해당 지역의<br>작은가게를 만날 수 있어요.</p>'+nav('/regions','전체 지역 보기 →','geo-button')+'</div>'+regionArtwork()+'</section>'+
 '<section class="story-panel"><div class="story-head"><span>이달의 작은가게</span><small>01 / 03 &nbsp; ›</small></div>'+
 '<div class="story-content"><div class="story-gallery"><div class="story-main-image">'+img(photo.a,'통영 꿀빵 이미지')+'</div><div class="story-thumb-strip">'+img(photo.a,'꿀빵')+img(photo.e,'전통 과자')+img(photo.d,'바닷가 가게')+'</div></div>'+
 '<div class="story-description"><small>바다의 달콤함을 담은</small><h2>통영 꿀빵 작업실</h2><p>📍 경남 통영시</p><p>지역의 이야기를 담아 정성으로 만드는 먹거리를 소개합니다.<br>현장 인터뷰는 준비 중입니다.</p>'+
 '<div class="story-actions">'+nav('/store/tongyeong-honey','가게 이야기 →','story-primary')+nav('/product/honeybread-10','상품 보기 →','story-secondary')+'</div>'+
 '<div class="story-quote">“ 좋은 재료와 정성을 한 입에 담고 싶습니다. ”<small>가게 소개 예시 문구</small></div></div></div></section></div>'+
 '<section class="section shelf">'+heading('🛍 배송 가능한 작은가게','/stores','전체 상품 보기')+'<p class="shelf-intro">전국의 작은가게가 정성껏 만든 먹거리를 집에서도 만나보세요.</p>'+
 (searchTerm?'<p class="muted">검색: '+esc(searchTerm)+' · '+filtered.length+'개</p>':'')+
 '<div class="products">'+filtered.map((g,i)=>'<div class="merch-tile">'+productTile(g)+'<div class="merch-label">'+(i%3===0?'BEST':i%3===1?'인기':'추천')+'</div><div class="shipping-label">전국배송</div></div>').join('')+'</div></section>'+
 '<section class="section local-records">'+heading('🍴 그 동네에서 먹고 왔어요','/records','맛집기록 더보기')+'<p class="shelf-intro">작은가게가 직접 다녀온 지역의 맛집을 소개합니다.</p><div class="records">'+records.map(recordTile).join('')+'</div></section>';
}
function regionsPage(){return note+intro('지역으로 찾기','전국의 작은가게','전국 시·군·구별 가게를 찾는 화면입니다. 현재 예시 데이터입니다.')+'<div class="regions">'+regions.map(r=>nav('/region/'+r[0],'<div class="pin">⌖</div><small>'+r[2]+'</small><h2>'+r[1]+'</h2><p>예시 가게 1곳</p><span>→</span>','region')).join('')+'</div>'}
function oneRegion(id){const r=regions.find(r=>r[0]===id);if(!r)return notfound();const st=stores.filter(s=>s[3]===id);return note+'<div class="crumb">'+nav('/regions','전국지도')+' / '+r[1]+'</div>'+intro(r[2]+' · 지역별 검색',r[1]+'의 작은가게','해당 지역 가게 및 상품을 확인하세요.')+heading('가게')+'<div class="stores">'+st.map(storeTile).join('')+'</div><section class="section">'+heading('상품')+'<div class="products">'+goods.filter(g=>st.some(s=>s[0]===stores[g[1]][0])).map(productTile).join('')+'</div></section>'}
function storesPage(){return note+intro('지역 먹거리 가게','작은가게 파트너','실제 입점 및 인터뷰가 진행되면 검증된 가게 정보를 게시합니다.')+'<div class="stores">'+stores.map(storeTile).join('')+'</div>'}
function oneStore(id){const st=stores.find(s=>s[0]===id);if(!st)return notfound();return note+'<div class="crumb">'+nav('/stores','작은가게')+' / '+st[2]+' / '+st[1]+'</div><div class="storehero"><div class="storephoto">'+img(photo[st[5]],st[1])+'<div>'+st[2]+' · '+st[4]+'<h1>'+st[1]+'</h1></div></div><div class="story"><small>작은가게 인터뷰</small><h1>가게 이야기를<br>만나보세요</h1><p>실제 점주 인터뷰 및 유튜브 영상은 추후 공개됩니다.</p>'+status('▶ 인터뷰 준비 중')+'</div></div><section class="section">'+heading('가게 소개')+'<div class="panel"><p>'+st[1]+' · '+st[2]+' · '+st[4]+'</p><p>배송·매장 정보는 실제 입점 검증 후 안내합니다.</p></div></section><section class="section">'+heading('이 가게의 대표 상품')+'<div class="products">'+goods.filter(g=>stores[g[1]][0]===id).map(productTile).join('')+'</div></section><section class="section">'+heading('사장님 이야기')+'<div class="quiet">▶ &nbsp; 현장 인터뷰 영상 준비 중</div></section>'}
function oneProduct(id){const g=goods.find(x=>x[0]===id);if(!g)return notfound();const st=stores[g[1]];return note+'<div class="crumb">'+nav('/','홈')+' / '+nav('/store/'+st[0],st[1])+' / '+g[2]+'</div><div class="detail"><div><div class="detailimg">'+img(photo[st[5]],g[2])+'</div><small>상품 사진은 시연용 이미지입니다.</small></div><div class="buy"><small>'+st[2]+' · 데모 상품</small><h1>'+g[2]+'</h1><p>'+nav('/store/'+st[0],'▤ '+st[1]+' →','green')+'</p><p>가격과 배송 정보는 실제 입점 후 확정됩니다.</p><b class="price">'+won(g[3])+'</b><div class="delivery">🚚 배송비 · 확인 전<br>▤ 원재료·보관법 · 확인 전<br>✓ 실제 결제 · 미연결</div><div class="qrow"><b>수량</b><div class="quantity"><button data-qty="-1">−</button><span id="qty">'+selectedQty+'</span><button data-qty="1">+</button></div><b id="amount">'+won(g[3]*selectedQty)+'</b></div><button class="primary" data-add="'+id+'">장바구니 담기 ♧</button><div id="addnotice"></div><p><small>실제 결제·주문은 제공하지 않습니다.</small></p></div></div><div class="tabs"><a href="#detail">상품 소개</a><a href="#seller">가게 이야기</a><a href="#delivery">배송 안내</a></div><section class="section" id="detail">'+heading('상품 소개')+'<div class="article"><div><h3>'+g[2]+'</h3><p>시연용 예시 상품입니다. 판매자 확인을 거친 원재료·알레르기·유통기한·보관방법 등을 등록할 예정입니다.</p></div>'+img(photo[st[5]],g[2])+'</div></section><section class="section" id="seller">'+heading('점주 인터뷰')+'<div class="quiet">▶ &nbsp; 촬영 동의 후 공개됩니다.</div></section><section class="section" id="delivery">'+heading('배송·교환·환불')+'<p class="muted">실제 판매자별 상세 기준은 입점 후 등록합니다.</p></section>'}
function cartPage(){const cart=readCart();const total=cart.reduce((n,c)=>{const g=goods.find(x=>x[0]===c.id);return n+(g?g[3]*c.qty:0)},0);return note+intro('','장바구니','체험은 가능하지만 실제 주문·결제는 진행되지 않습니다.')+(cart.length?'<div class="cartlayout"><div class="panel">'+cart.map(c=>{const g=goods.find(g=>g[0]===c.id),s=stores[g[1]];return '<div class="cartrow">'+img(photo[s[5]],g[2])+'<div>'+nav('/product/'+g[0],'<b>'+g[2]+'</b>')+'<small>'+s[2]+'</small><strong>'+won(g[3])+'</strong></div><div class="quantity"><button data-cid="'+g[0]+'" data-delta="-1">−</button>'+c.qty+'<button data-cid="'+g[0]+'" data-delta="1">+</button></div><button class="remove" data-remove="'+g[0]+'">삭제</button></div>'}).join('')+'</div><aside class="panel summary"><h2>주문 요약</h2><p>상품 합계 <b>'+won(total)+'</b></p><p>배송비 <b>미정</b></p><p>상품 금액 <b>'+won(total)+'</b></p><button class="primary" disabled>결제 준비 중</button><small>PG 및 실제 입점 계약 이후 제공됩니다.</small></aside></div>':'<div class="panel empty">장바구니에 담긴 상품이 없습니다. '+nav('/','상품 둘러보기 →','red')+'</div>')}
function recordsPage(){return note+intro('현장 탐방 · 맛집기록','그 동네에서 먹고 왔어요','입점 여부와 무관하게 지역 먹거리를 기록합니다. 현재 예시 자료입니다.')+'<div class="records recordswide">'+records.map(recordTile).join('')+'</div>'}
const orders=[['DEMO-001','꿀빵 10개입','13,000원','결제완료'],['DEMO-002','장아찌 500g','16,000원','상품준비'],['DEMO-003','한과 세트','18,000원','배송중']];
function table(){return '<div class="scroller"><table><thead><tr><th>주문번호</th><th>상품</th><th>금액</th><th>상태</th></tr></thead><tbody>'+orders.map(r=>'<tr>'+r.map((cell,i)=>'<td>'+(i===3?status(cell):cell)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>'}
function kv(rows){return '<div class="kv">'+rows.map(r=>'<p>'+r[0]+'<b>'+r[1]+'</b></p>').join('')+'</div>'}
function tasks(rows){return '<div class="tasks">'+rows.map(r=>'<div>▤ <b>'+r[0]+'</b><strong>'+r[1]+'</strong></div>').join('')+'</div>'}
function statBoxes(list){
 return '<div class="metrics">'+list.map(item=>
   '<div class="statbox"><span class="stat-icon">'+item[2]+'</span><small>'+item[0]+'</small><b>'+item[1]+'</b><small class="stat-note">시연 데이터</small></div>'
 ).join('')+'</div>';
}
function taskPanel(list){
 return '<div class="tasklist-rich">'+list.map((item,i)=>
 '<div class="task-rich"><span class="task-circle">'+['☑','♧','✎','▤'][i%4]+'</span><div><strong>'+item[0]+'</strong><small>'+item[2]+'</small></div><b>'+item[1]+'</b><span class="task-arrow">›</span></div>'
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
 return '<div class="stock-row">'+img(photo[st[5]],item[2])+'<div><b>'+item[2]+'</b><small>⚠ 재고 '+pair[1]+'개 남음</small><small>시연 데이터</small></div>'+nav('/product/'+item[0],'›','stock-next')+'</div>';
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
  ['입점 가게','6곳','▣'],['승인 대기','3건','◉'],['등록 상품','6개','⬡'],
  ['오늘 주문','3건','🛒'],['이번 달 거래액','47,000원','₩'],['예상 수수료 (1%)','470원','％']
 ]:[
  ['신규 주문','5건','▣'],['배송 대기','3건','🚚'],
  ['이번 달 매출','418,000원','◉'],['정산 예정액','356,000원','₩']
 ];
 let panels='';
 if(admin){
  panels+=dashPanel('☑ 오늘 처리할 일',taskPanel([
   ['입점 승인','3건','신규 신청 검토 대기'],
   ['배송 지연 문의','2건','점주 확인 필요'],
   ['상품 수정 요청','4건','변경사항 검토 필요'],
   ['정산 검토','1건','입금 전 확인']
  ]),'검토 현황 · 예시','panel-tasks');
  panels+=dashPanel('⌛ 승인 대기 가게',
    demoTable([
      ['통영 꿀빵 작업실','경남 통영','꿀빵','검토 대기'],
      ['전주 장아찌 가게','전북 전주','장아찌','검토 대기'],
      ['강릉 한과 가게','강원 강릉','한과','검토 대기']
    ],['가게명','지역','주요 상품','상태']),'3건 · 예시','panel-approval');
  panels+=dashPanel('🛒 최근 주문',demoTable([
   ['DEMO-001','통영 꿀빵 작업실','13,000원','결제완료'],
   ['DEMO-002','전주 장아찌 가게','16,000원','상품준비'],
   ['DEMO-003','강릉 한과 가게','18,000원','배송중']
  ],['주문번호','가게','주문금액','상태']),'전체 주문','panel-orders');
  panels+=dashPanel('▣ 배송 지연 / 문의',demoTable([
   ['DEMO-001','배송일이 궁금해요','답변 대기'],
   ['DEMO-002','구성 확인 요청','답변 대기'],
   ['DEMO-003','상품 상태 문의','접수']
  ],['주문번호','문의 내용','상태']),'3건 · 예시','panel-inquiries');
  panels+=dashPanel('▶ 콘텐츠 현황',
   '<div class="content-progress">'+[
     ['인터뷰 영상','0편',0],['맛집기록','3건',60],['촬영 준비','6곳',70]
   ].map(v=>'<div><span>'+v[0]+'</span><strong>'+v[1]+'</strong><div class="progress-track"><i style="width:'+v[2]+'%"></i></div></div>').join('')+'</div>',
   '플랫폼 제작','panel-content');
  panels+=dashPanel('⌖ 지역별 입점 분포',
   '<div class="dash-regions">'+regions.map(r=>'<div><span>'+r[1]+'</span><b>1곳</b></div>').join('')+'</div>'+
   '<small class="dashboard-note">등록된 6개 시연 가게 기준</small>','6지역','panel-regions');
  panels+=dashPanel('₩ 수수료 / 정산 요약',
   '<div class="accounting-amount"><small>시연 거래액</small><strong>47,000원</strong></div>'+
   kv([['판매 중개수수료 1%','470원'],['PG 수수료','별도'],['배송·포장 비용','점주별 상이']])+
   '<small class="dashboard-note">실제 정산금이 아닙니다.</small>',
   '이번 달 · 예시','panel-settlement');
 } else {
  panels+=dashPanel('☑ 오늘 처리할 일',taskPanel([
   ['송장번호 입력하기','3건','배송 준비 중'],
   ['주문 확인하기','2건','신규 주문 접수'],
   ['재고 부족 상품 확인하기','1건','재고 경고'],
   ['고객 문의 답변하기','1건','확인 대기']
  ]),'총 7건 · 예시','panel-tasks');
  panels+=dashPanel('내 가게 정보',kv([
   ['가게명','통영 꿀빵 작업실'],['지역','경남 통영시'],
   ['상품','꿀빵 · 간식'],['배송 가능 지역','전국 택배 (시연)'],
   ['인터뷰 콘텐츠','촬영 준비 중']
  ]),'가게 정보 보기','panel-shop');
  panels+=dashPanel('🚚 주문/배송 현황',demoTable([
   ['DEMO-001','꿀빵 10개입','13,000원','결제완료'],
   ['DEMO-002','꿀빵 선물세트','26,000원','상품준비'],
   ['DEMO-003','꿀빵 10개입','13,000원','배송중'],
   ['DEMO-004','꿀빵 세트','28,000원','배송완료']
  ],['주문번호','상품','금액','상태']),'전체 주문 보기','panel-orders');
  panels+=dashPanel('⚠ 품절 임박 상품',stockList(),'재고 확인','panel-stock');
  panels+=dashPanel('▣ 대표 상품 관리',partnerProducts(),'상품 보기','panel-products');
  panels+=dashPanel('₩ 정산 예정 내역',
   '<div class="settlement-well"><small>다음 정산 예정 금액 (시연)</small><b>356,000원</b></div>'+
   kv([['플랫폼 판매 중개수수료','1%'],['PG·배송 관련 비용','별도 정산']])+
   '<small class="dashboard-note">확정 정산이 아닌 예시 화면</small>',
   '정산 내역 보기','panel-settlement');
  panels+=dashPanel('▶ 인터뷰 콘텐츠',
   '<div class="interview-box">'+img(photo.a,'가게 인터뷰 예시 이미지')+
   '<div><b>통영의 달콤한 이야기를 담을 예정입니다.</b><p>영상 촬영과 편집·게시 관리는 작은가게 운영팀이 담당합니다.</p>'+status('촬영 준비 중')+'</div></div>',
   '촬영 상태 보기','panel-interview');
  panels+=dashPanel('💡 작은가게 사장님 팁',
   '<div class="tip-box">상품 설명과 대표 사진이 구매자의 이해를 돕습니다.<br><small>사진·인터뷰 콘텐츠 수정이 필요하면 운영팀에 요청할 수 있습니다.</small></div>',
   '운영 가이드','panel-tip');
 }
 return note+
  '<div class="dashboard '+(admin?'dashboard-admin':'dashboard-partner')+'">'+
   '<aside class="sidebar">'+
    '<h3>'+(admin?'작은가게 관리자':'작은가게 파트너센터')+'</h3>'+
     navs.map((x,i)=>'<a href="#'+(admin?['panel-tasks','panel-approval','panel-products','panel-orders','panel-content'][i]:['panel-tasks','panel-products','panel-orders','panel-settlement','panel-shop','panel-interview'][i])+'"><span class="sidebar-symbol">'+['⌂','⬡','♧','₩','▣','?'][i]+'</span>'+x+'</a>').join('')+
    '<div class="sidebar-illustration" aria-hidden="true"><div>⌁ ⛵ ⌁</div><small>지역의 맛을 전국으로</small></div>'+
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
function render(scroll){const r=route();document.title=r[0]+' | 작은가게';const path=location.pathname.replace(BASE,'');document.body.classList.toggle('dashboard-mode',path.startsWith('/admin')||path.startsWith('/partner'));document.body.classList.toggle('dashboard-partner-view',path.startsWith('/partner'));document.getElementById('app').innerHTML=header()+'<main class="wrap main">'+r[1]+'</main>'+footer();if(scroll)window.scrollTo(0,0)}
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
})();