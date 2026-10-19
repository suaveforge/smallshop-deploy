# 작은가게 운영 구성 (2026-10-19)

## 공개 URL

- **https://smallshop.suaveforge.com/** — GitHub Pages (정적 사용자·점주·관리자 데모)
- Spaceship DNS `smallshop` CNAME → `suaveforge.github.io`
- GitHub Pages 커스텀 도메인 및 HTTPS 인증서 상태 검증 완료
- HTTP 접속은 프런트 스크립트가 HTTPS로 전환

## 기존 개발 서버

- `smallshop-web`: Next.js, `127.0.0.1:18195`
- `smallshop-highport-nginx`: 독립 HTTPS TCP 18459 (원래 호스트명은 이제 GitHub Pages를 가리키므로 공개 URL로 사용하지 않음)
- `smallshop-highport-cert-renewer`: 전용 Certbot 갱신
- Caddy에 작은가게 호스트 설정을 추가하지 않음

## 소스 분리 주의

GitHub Pages의 브라우저 데모는 실제 DB·PG·로그인이 없는 별도 정적 버전입니다. `suaveforge/smallshop` 코드 수정이 Pages로 자동 반영되는 구조는 아직 아닙니다. UI를 검수할 때는 Pages, 백엔드/Next.js 기능을 검수할 때는 서버측 앱을 구분하세요.

## 원칙

다른 Docker 컨테이너/기존 Caddy/공유 방화벽과 프록시를 임의로 변경하지 않음. 향후 운영 전 입점/영상 동의, 식품 표시정보, 로그인 권한, 데이터베이스, PG 및 점주 정산 검증 필요.
