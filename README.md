# smallshop-deploy

SuaveForge '작은가게'의 **배포 설정만** 저장하는 저장소입니다. 서비스 소스는 별도의 [smallshop](https://github.com/suaveforge/smallshop)에 있습니다.

- 운영 예상 서버: server123의 셀프호스트 Linux 러너 (러너 라벨 확인 전까지 자동 배포 금지)
- 기본 컨테이너: `smallshop-web`, Compose project: `smallshop`
- 기본 내부 포트: `127.0.0.1:18195` (충돌 검사 필요)
- 배포 절차: GitHub Actions 수동 `workflow_dispatch`만 지원
- 처음 공개할 버전: 데모 데이터, 로그인/PG 미연동, robots noindex

## 필수 설정
- `SMALLSHOP_SOURCE_READ_TOKEN` 배포 저장소 Actions Secret: `suaveforge/smallshop`의 Contents 읽기 전용 토큰.
- `SMALLSHOP_PORT` 선택적 Repository Variable, 기본값 18195.
- 러너 레이블이 `server123`인지 확인. **다르면 그대로 실행하지 말고 정확한 레이블로 수정**.
- Docker/Compose/포트 가용성/기존 역방향 프록시 확인.

## 사용
Actions에서 `Deploy smallshop (manual, server123)`을 수동 실행. `source_ref`로 검증된 소스 커밋 지정.
워크플로는 다른 컨테이너에 `down`, `prune`을 사용하지 않고, smallshop 컨테이너만 갱신합니다.

운영 체크리스트: [docs/OPERATIONS.md](docs/OPERATIONS.md)

현재 코드를 구성한 것과 실제 운영 서버에 배포한 것은 별개의 상태입니다.
