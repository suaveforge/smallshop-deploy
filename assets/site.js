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
function header(){const cnt=readCart().reduce((n,x)=>n+x.qty,0);return '<header class="header"><div class="wrap mast">'+nav('/','<span class="mark">⌂</span>작은가게','logo')+'<form id="search" class="search"><input name="q" type="search" aria-label="상품 검색" placeholder="지역이나 먹거리를 검색해 보세요"><button aria-label="검색">⌕</button></form>'+nav('/cart','♧ <span class="cartlabel">장바구니</span>'+(cnt?'<b class="count">'+cnt+'</b>':''),'cart')+'</div><nav class="bar"><div class="wrap links">'+nav('/regions','⌖ 전국지도')+nav('/stores','▤ 작은가게')+nav('/records','▧ 맛집기록')+'</div></nav></header>'}
function footer(){return '<footer class="footer"><div class="wrap foot"><div><strong>⌂ 작은가게</strong><p>지역의 작은 먹거리와 가게 이야기를 발견합니다.</p></div><span>데모 사이트 · 실제 구매 불가</span><div>'+nav('/partner','사장님센터')+' &nbsp; '+nav('/admin','관리자센터')+'</div></div></footer>'}
function heading(title,path,action){return '<div class="heading"><h2>'+title+'</h2>'+(path?nav(path,(action||'전체 보기')+' →','more'):'')+'</div>'}
function intro(top,title,description){return '<div class="intro"><small>'+top+'</small><h1>'+title+'</h1><p>'+description+'</p></div>'}
function productTile(g){const s=stores[g[1]];return nav('/product/'+g[0],'<div class="tilepic">'+img(photo[s[5]],g[2])+'<span>'+s[2]+'</span></div><div class="tilebody"><small>'+g[4]+' · 데모 상품</small><h3>'+g[2]+'</h3><div class="tilefoot"><b>'+won(g[3])+'</b><small>상품 보기 ›</small></div></div>','tile')}
function storeTile(s){return nav('/store/'+s[0],img(photo[s[5]],s[1])+'<div class="storetext"><small>'+s[2]+' · '+s[4]+'</small><h3>'+s[1]+'</h3><p>지역 먹거리와 점주 인터뷰를 소개하는 예시입니다.</p><strong>가게 이야기 보기 →</strong></div>','storetile')}
function regionChips(){return '<div class="chips">'+regions.map(r=>nav('/region/'+r[0],'⌖ '+r[1])).join('')+'</div>'}
function recordTile(r){return '<div class="record">'+img(r[3],r[0])+'<div><small>'+r[1]+'</small><h3>'+r[0]+'</h3><p>방문 당시 메뉴·가격 기록 예시입니다.</p><b>'+won(r[2])+'</b></div></div>'}
function home(){
 const searchTerm=new URLSearchParams(location.search).get('q')||'';
 const filtered=goods.filter(g=>[g[2],g[4],stores[g[1]][1],stores[g[1]][2]].join(' ').includes(searchTerm));
 return note+'<div class="hero"><div class="herotext"><small>전국의 작은 먹거리 지도</small><h1>전국의 작은 맛을<br><em>찾아서</em></h1><p>방문해서 듣고, 기록하고, 소개합니다.<br>지역의 가게 이야기부터 상품까지 한곳에서.</p>'+nav('/stores','가게 둘러보기 →','heroaction')+'</div><div class="heroimg">'+img(photo.a,'작은 가게 음식 이미지')+'<span>통영 · 인터뷰 준비 중 ◉</span></div></div>'+
 '<div class="features"><section class="panel">'+heading('지역으로 찾기','/regions','전국 지역 보기')+'<p>전국 시·군·구별로 작은 가게를 찾아보세요.</p>'+regionChips()+'<small>정식 전국 지도는 구축 예정</small></section>'+
 '<section class="panel">'+heading('이번에 만나는 가게','/store/tongyeong-honey','가게 이야기')+'<div class="featured">'+img(photo.a,'통영 꿀빵 가게')+'<div><small>경남 통영시</small><h3>통영 꿀빵 작업실</h3><p>점주와 직접 대화한 영상이 공개되면 이곳에 표시됩니다.</p>'+status('인터뷰 촬영 전')+'<p>'+nav('/store/tongyeong-honey','자세히 보기 →','red')+'</p></div></div></section></div>'+
 '<section class="section">'+heading('배송 가능한 작은가게','/stores','가게 모두 보기')+(searchTerm?'<p class="muted">검색: '+esc(searchTerm)+' · '+filtered.length+'개</p>':'')+'<div class="products">'+(filtered.map(productTile).join('')||'검색 결과가 없습니다.')+'</div></section>'+
 '<section class="section">'+heading('그 동네에서 먹고 왔어요','/records','맛집기록 더보기')+'<div class="records">'+records.map(recordTile).join('')+'</div></section>'
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
function dashboard(admin){const navs=admin?['오늘 할 일','입점·가게','상품','주문·정산','콘텐츠']:['오늘 할 일','상품','주문·배송','정산','내 가게'];const metrics=admin?[['입점 가게','6곳'],['입점 목표','10곳'],['등록 상품','6개'],['시연 주문','3건'],['거래액','47,000원'],['수수료 1%','470원']]:[['신규 주문','5건'],['배송 대기','3건'],['이번 달 매출','418,000원'],['정산 예정액','356,000원']];const panels=admin?[
 ['오늘 처리할 일',tasks([['입점 승인','3건'],['배송 문의','2건'],['상품 수정 검토','4건'],['정산 검토','1건']])],
 ['입점·가게',kv(stores.slice(0,4).map(s=>[s[1],s[2]]))],
 ['상품 현황',kv(goods.slice(0,4).map(g=>[g[2],won(g[3])]))],
 ['주문·정산',table()+'<p>판매중개수수료 <b>1%</b> · PG 실비 별도</p>'],
 ['콘텐츠',kv([['점주 인터뷰','0편'],['맛집기록','3건'],['촬영 준비','목표 10곳']])],
 ['지역별 분포',regionChips()]
 ]:[
 ['오늘 처리할 일',tasks([['주문 확인','2건'],['송장번호 입력','3건'],['재고 부족 확인','1건'],['고객 문의 답변','1건']])],
 ['내 가게 정보',kv([['가게','통영 꿀빵 작업실'],['지역','경남 통영시'],['인터뷰','미등록']])],
 ['주문·배송',table()],
 ['정산 요약','<p>시연 예정 정산금 <b>356,000원</b></p><p>중개수수료 1% · PG 별도</p>'],
 ['상품 관리',kv(goods.slice(0,2).map(g=>[g[2],won(g[3])]))],
 ['인터뷰 콘텐츠','<div class="quiet">▶ 영상 제작 준비 중</div>']
 ];return note+'<div class="dashboard"><aside class="sidebar"><h3>'+(admin?'운영 관리자':'사장님 센터')+'</h3>'+navs.map((x,i)=>'<a href="#panel-'+i+'">'+x+'</a>').join('')+'<small>데모 · 실거래 정보 없음</small></aside><div class="dashmain"><div class="dashtop"><div><small>'+(admin?'PLATFORM':'PARTNER')+' · DEMO</small><h1>'+(admin?'운영 대시보드':'통영 꿀빵 작업실 운영 현황')+'</h1><p>업무를 한눈에 살펴보는 예시 화면</p></div>'+nav('/','사이트 보기 →','outline')+'</div><div class="metrics">'+metrics.map(x=>'<div><small>◉ '+x[0]+'</small><b>'+x[1]+'</b><small>시연 자료</small></div>').join('')+'</div><div class="dashcards">'+panels.map((x,i)=>'<section class="panel" id="panel-'+i+'"><h2>'+x[0]+'</h2>'+x[1]+'</section>').join('')+'</div></div></div>'}
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
function render(scroll){const r=route();document.title=r[0]+' | 작은가게';document.getElementById('app').innerHTML=header()+'<main class="wrap main">'+r[1]+'</main>'+footer();if(scroll)window.scrollTo(0,0)}
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