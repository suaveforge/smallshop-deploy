# smallshop-deploy

작은가게(`smallshop`)의 격리 배포 설정과 배포 스크립트를 관리합니다.

- **애플리케이션:** [suaveforge/smallshop](https://github.com/suaveforge/smallshop) (Private)
- **배포 스크립트:** [scripts/deploy-docker.sh](scripts/deploy-docker.sh)
- **검증된 러너:** `server123`의 기존 셀프호스트 러너 (러너 구성은 수정하지 않음)
- **실제 배포 방법:** 소스 저장소의 `smallshop CI`가 성공하면 `smallshop deploy after green CI`가 해당 SHA를 체크아웃하고 이 저장소의 스크립트를 실행
- **컨테이너:** `smallshop-web`, 소유 라벨 `org.suaveforge.application=smallshop`
- **내부 주소:** `http://127.0.0.1:18195` (기본값)
- **현재 모드:** demo, noindex, 실제 PG 결제 없음

## server123 제약 및 안전장치

현재 러너에는 Docker CLI는 있지만 **Docker Compose 플러그인이 없습니다**. 그래서 실제 배포는 Compose를 호출하지 않고 Docker CLI만 사용합니다. `compose.yaml`은 향후 대체 실행을 위한 참고 설정입니다.

스크립트는 `smallshop-web`이라는 전용 컨테이너만 생성·교체합니다. 기존 동일 이름 컨테이너의 소유 라벨이 다르거나, 전용 포트가 다른 서비스에서 사용 중이면 중단합니다. 서버 패키지, 방화벽, 공유 프록시, 다른 컨테이너에는 변경을 가하지 않습니다.

## 확인

GitHub Actions의 자동 배포 성공 후 서버에서:

```bash
curl -fsS http://127.0.0.1:18195/api/health
docker ps --filter name=smallshop-web
```

기대 응답: `{"service":"smallshop","status":"ok","mode":"demo","payments":"disabled"}`

## 공개 URL은 별도 작업

2026-10-18 기준 서버에서 `smallshop.suaveforge.com` DNS 조회가 실패했습니다. 현재 공개 주소는 연결되지 않았습니다. 도메인의 DNS 설정과 기존 외부 프록시의 서비스 라우팅을 확인하기 전에는 공용 포트·프록시를 수정하지 마세요.

## 선택적 수동 재배포

이 저장소의 `Deploy smallshop manually (optional)` 워크플로는 Private 원본을 읽기 위해 배포 저장소 Secret `SMALLSHOP_SOURCE_READ_TOKEN`이 **추가로 필요**합니다. 이 설정이 없다면 소스 저장소의 자동 배포 경로를 사용하세요. 수동 워크플로는 기본 배포 수단이 아닙니다.
