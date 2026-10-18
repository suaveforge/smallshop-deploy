# smallshop-deploy

작은가게의 별도 배포 저장소입니다. 애플리케이션 소스는 [suaveforge/smallshop](https://github.com/suaveforge/smallshop) (Private)에 있습니다.

## 검증된 운영 구성 (2026-10-19)

- **외부 홈페이지:** https://smallshop.suaveforge.com:18459/
- **외부 상태 점검:** https://smallshop.suaveforge.com:18459/api/health
- **DNS:** 기존 Spaceship `smallshop.suaveforge.com` A → `211.255.25.123`
- **독립 HTTPS:** Docker Nginx `smallshop-highport-nginx`, TCP `18459`
- **TLS:** Spaceship DNS-01 / Certbot, 독립 `smallshop-highport-cert-renewer`
- **애플리케이션:** Docker `smallshop-web` → `127.0.0.1:18195`
- **GitHub Actions:** 기존 server123 셀프호스트 러너. Docker CLI 사용, Compose 불필요.
- **Caddy:** 작은가게 경로 없음. 기존 다른 Caddy 사이트의 설정은 유지.
- **서비스 모드:** 시연용, `noindex`, 실제 PG 결제 비활성화.

## 코드 및 운영 경로

- 소스 배포: 소스 저장소의 `smallshop CI` 통과 → `smallshop deploy after green CI`
- 앱 배포 스크립트: [scripts/deploy-docker.sh](scripts/deploy-docker.sh)
- 독립 고포트 HTTPS 스크립트: [smallshop/scripts/highport-smallshop.sh](https://github.com/suaveforge/smallshop/blob/main/scripts/highport-smallshop.sh)
- 점검: [docs/OPERATIONS.md](docs/OPERATIONS.md)

## 주의

Docker Compose 플러그인이 서버에 없으므로 `compose.yaml`은 실행 중인 배포 방식이 아니라 참고 설정입니다.

`Deploy smallshop manually (optional)` 워크플로를 이 저장소에서 실행할 때는 별도의 읽기 전용 `SMALLSHOP_SOURCE_READ_TOKEN` Actions Secret이 필요합니다. 기본 자동 배포에는 필요하지 않습니다.

기존 WorkLinks, Kimse 등 서버·방화벽·공유 프록시·다른 컨테이너는 변경하지 않습니다.
