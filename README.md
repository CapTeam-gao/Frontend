# CapTeam Frontend

CapTeam은 학생 설문 데이터를 기반으로 캡스톤 팀을 자동 추천하고, 팀 생성 이후 운영까지 관리할 수 있는 서비스다.

프론트엔드는 학생과 관리자가 각각 필요한 기능을 사용할 수 있도록 화면, 라우팅, API 연결, 실시간 채팅 UI를 담당한다.

- 배포 주소: https://cap-team-web-frontend.vercel.app/
- API 서버: https://api.capteam.n-e.kr

## 주요 기능

### 학생

- 로그인
- 팀 매칭 설문 작성
- 공지 조회
- 프로젝트 기획서 작성 및 수정
- 캡스톤 일지 작성 및 결과 조회
- 팀 채팅
- 내 정보 확인 및 비밀번호 변경

### 관리자

- 로그인
- 대시보드 확인
- 학년별 AI 팀 생성
- 추천 팀 검토 및 학생 교체
- 팀 구성 최종 승인
- 확정 팀 관리
- 학생 관리 및 설문 결과 확인
- 공지 작성, 수정, 삭제
- 캡스톤 일지 제출 현황 확인
- 팀별 채팅 관리

## 기술 스택

| 구분 | 기술 |
| --- | --- |
| Framework | React 19, Vite |
| Routing | React Router |
| State | Zustand |
| API | Axios |
| Realtime | STOMP, WebSocket |
| Chart | Recharts |
| Styling | CSS Modules |
| Deploy | Vercel |

## 실행 방법

```bash
npm install
npm run dev
```

개발 서버 실행 후 브라우저에서 안내되는 로컬 주소로 접속하면 된다.

## 빌드

```bash
npm run build
```

## 검사

```bash
npm run lint
```

## 환경 변수

개발 환경에서는 `.env.development`, 배포 환경에서는 `.env.production`을 사용한다.

```env
VITE_BASE_URL=http://localhost:8080
```

배포 환경에서는 실제 API 주소를 바라보도록 설정한다.
