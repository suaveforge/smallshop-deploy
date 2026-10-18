# smallshop server123 운영 문서

## 1. 서비스 격리
- 기존 WorkLinks, Kimse, WattGuard 등의 Docker 서비스는 수정하거나 내리지 않음.
- 프로젝트 이름 `smallshop`, 컨테이너명 `smallshop-web`만 사용.
- 서버 내부 127.0.0.1:18195 포트만 기본 바인딩. 공용 포트·프록시 설정은 별도 승인 후.

## 2. 선행 검증
1. 정확한 self-hosted runner 라벨이 `self-hosted, linux, x64, server123`인지 GitHub 설정에서 확인. 일치하지 않으면 deploy workflow의 runs-on을 **해당 서버에만 매칭되도록** 교정.
2. 해당 runner에 Docker + Docker Compose plugin + curl 설치/접근 권한이 있는지 확인.
3. `SMALLSHOP_SOURCE_READ_TOKEN`을 배포 저장소 Secret으로 등록. private `suaveforge/smallshop` Contents 읽기만 허용.
4. `SMALLSHOP_PORT` repository variable을 지정할 수 있음. 기본값 18195. 이미 쓰는 포트인지 확인.
5. 별도 reverse-proxy/도메인, TLS 설정 확인 후 공개. 샘플 Nginx 설정은 그대로 적용 금지.

## 3. 배포
- GitHub Actions > Deploy smallshop (manual, server123) > Run workflow
- source_ref로 main 또는 검증된 커밋 SHA 입력.
- 워크플로는 source repo를 읽기 전용 checkout, Docker 이미지 빌드, `smallshop-web`만 Compose up.
- 출처 불명의 파이프라인에서 자동 재배포하지 않음.

## 4. 검증
```sh
docker compose -p smallshop -f compose.yaml ps
SMALLSHOP_PORT=18195 bash scripts/check-health.sh
curl -I http://127.0.0.1:18195/
```
- `/api/health`가 HTTP 200 + `mode:demo`, `payments:disabled`인지 확인.
- 공개 사이트는 실제 데이터 도입 전 noindex 유지.

## 5. 주의
이 문서와 Actions 설정만으로 실 서버 배포가 완료되는 것은 아닙니다. 러너/시크릿/포트/도메인과 소스 빌드 검증 후 수동 워크플로를 실행해야 합니다.
