# smallshop-deploy

이 저장소는 **작은가게 공개 시연용 사이트 및 배포 설정**을 관리합니다.

## 실제 사용자 접속 주소

**https://smallshop.suaveforge.com/**

2026-10-19 기준 GitHub Pages가 HTTPS 인증서를 발급했고, 외부에서 홈·가게·상품·점주·관리자 데모 페이지를 검증했습니다.

- DNS: Spaceship `smallshop.suaveforge.com` CNAME → `suaveforge.github.io`
- 공개 웹: 이 저장소 `main`에서 자동 게시되는 GitHub Pages 정적 데모
- 원본 개발 저장소: [suaveforge/smallshop](https://github.com/suaveforge/smallshop) (비공개 Next.js)
- server123 내부 앱: `smallshop-web` → `127.0.0.1:18195`
- 18459 독립 Nginx: 기존 서버 구성은 유지되지만, **공개 도메인은 현재 GitHub Pages로 연결됨**
- Caddy: 작은가게 호스트 설정 없음. 다른 기존 서비스는 변경하지 않음.

## 구현 상태

메인·지역·가게·상품·맛집기록·장바구니(브라우저 로컬)·점주 데모·관리자 데모를 제공합니다. **실제 사업자 입점, 판매, 결제, 로그인, 개인정보 DB, API 연동은 아직 미구현입니다.** 샘플 가게·주문·가격은 검증된 실거래 데이터가 아닙니다.

**주의:** 이 공개 Pages 데모는 원본 Next.js 프로젝트와 별도 배포물입니다. 현재 자동 동기화 파이프라인은 없으므로, 실제 서비스 준비 시 단일 소스에서 정적 프런트엔드를 생성하도록 통합해야 합니다.

## GitHub

- `suaveforge/smallshop`: 메인 애플리케이션 소스, 서버123 셀프호스트 CI
- `suaveforge/smallshop-deploy`: 공개 정적 데모 Pages 및 서버 배포 스크립트

## 운영

서버 배포는 기존 Docker CLI로 `smallshop-web`만 변경하며 기존 컨테이너·Caddy·방화벽을 변경하지 않습니다. [운영 안내](docs/OPERATIONS.md)를 참조하세요.

## 가게 방문 상담용 안내

- 공개 입점 안내: https://smallshop.suaveforge.com/join/
- 업종 필터가 있는 전국지도: https://smallshop.suaveforge.com/regions/
- 예시 가게는 **가상 자료**이며 지도 핀은 도시 중심입니다. 실제 방문 가능한 매장 목록이 아닙니다.
- 가게 소개 영상·게시 비용은 초기 무료, 판매 시 중개수수료 1%, PG·택배·포장 실비 별도라는 **준비 단계 정책**을 안내합니다. 실제 계약·동의·판매 시스템은 아직 없습니다.


## CI runner policy

- The public Pages repository does not run its own QA jobs because public repositories do not automatically access the organization's private self-hosted runner group.
- Public storefront code and live-site Chrome QA are checked by the private suaveforge/smallshop workflow .github/workflows/public-pages-qa.yml, targeting only [self-hosted, linux, x64, server123, suaveforge-org]. The source CI/deploy remains unchanged.
- Keep tests/geo-smoke.mjs here; the private workflow checks out this public repo read-only, waits for the live asset checksum, and executes Chrome in an isolated Docker image.
- GitHub Pages branch publishing is a GitHub-managed service, not a user-authored Actions workflow. Its internal runner cannot be changed with runs-on. A custom Pages publishing workflow requires a separate deliberate migration of the Pages repository settings.
- Never enable organization self-hosted runner access for a public repository simply to unblock QA, as it exposes the shared server123 to untrusted workflows.
