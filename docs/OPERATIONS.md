# 작은가게 server123 운영 가이드

## 현재 서비스

| 구성 | 주소 / 컨테이너 |
|---|---|
| 소비자·점주·관리자 데모 | `https://smallshop.suaveforge.com:18459/` |
| API 상태 | `https://smallshop.suaveforge.com:18459/api/health` |
| 독립 Nginx HTTPS | `smallshop-highport-nginx`, `0.0.0.0:18459` |
| 내부 Next.js | `smallshop-web`, `127.0.0.1:18195` |
| 전용 Certbot 갱신 | `smallshop-highport-cert-renewer` |
| Spaceship DNS | `smallshop.suaveforge.com` → `211.255.25.123` |

### 검증

```bash
curl -fsS https://smallshop.suaveforge.com:18459/api/health
curl -I https://smallshop.suaveforge.com:18459/
docker ps --filter name=smallshop
```

기대 건강상태: `{"service":"smallshop","status":"ok","mode":"demo","payments":"disabled"}`.

## 변경·배포 정책

1. `suaveforge/smallshop` 메인 브랜치에서 기존 server123 셀프호스트 러너로 CI 테스트와 Next.js 빌드.
2. CI 성공 후 독립 `smallshop-web` 컨테이너만 Docker CLI로 배포.
3. 기존 배포 스크립트 `scripts/deploy-docker.sh`는 앱 18195용. 고포트 Nginx 및 TLS 관리 스크립트는 소스 저장소 `scripts/highport-smallshop.sh`.
4. Nginx 설정은 `/home/suaveforge/runtime/smallshop-highport/nginx.conf`. TLS는 동일 경로의 `letsencrypt` 하위에 보관.
5. 다른 컨테이너를 내리거나 80/443, Caddy를 변경하지 않음. 작은가게는 443을 사용하지 않음.
6. `compose.yaml`은 서버에 Docker Compose가 없으므로 사용하지 않음.

## 앱 미구현 사항

실제 판매자·결제·정산·재고 DB, 회원 인증, 개인정보 처리는 아직 연결되지 않았습니다. 관리 페이지는 데모이므로 실거래 데이터를 넣지 마세요.
