# CapTeam Frontend

AI 기반 캡스톤 팀 자동 생성 및 관리 서비스 **CapTeam**의 프론트엔드 레포지토리다.

- 배포 링크: https://cap-team-web-frontend.vercel.app/
- Backend API: https://api.capteam.n-e.kr

CapTeam은 학생 설문 데이터를 바탕으로 캡스톤 팀을 추천하고, 관리자가 추천 결과를 검토한 뒤 팀 운영까지 이어갈 수 있도록 만든 서비스다.

팀 생성만 하는 도구가 아니라 공지, 채팅, 프로젝트 기획서, 캡스톤 일지까지 한 흐름 안에서 관리하는 것을 목표로 했다.

---

## 주요 기능

### 학생

- 로그인 및 권한 기반 페이지 접근
- 팀 매칭 설문 작성
- 학생 대시보드
- 공지 목록 / 상세 조회
- 프로젝트 기획서 작성 / 조회 / 수정
- 캡스톤 일지 카운트다운 / 작성 / 결과 조회
- 팀 채팅
- 내 정보 / 비밀번호 변경

### 관리자

- 로그인 및 권한 기반 페이지 접근
- 관리자 대시보드
- 학년별 AI 팀 생성 요청
- 추천 팀 검토 / 학생 수동 교체 / 최종 승인
- 확정 팀 관리
- 학생 관리 및 설문 결과 조회
- 공지 작성 / 조회 / 수정 / 삭제
- 캡스톤 일지 제출 현황 조회
- 팀별 채팅 관리
- 내 정보 / 비밀번호 변경

---

## 서비스 흐름

```txt
학생
로그인
 → 설문 작성
 → 팀 생성 대기
 → 팀 확정 후 프로젝트 기능 사용
 → 팀 채팅 / 프로젝트 기획서 / 캡스톤 일지 작성

관리자
로그인
 → 학생 설문 현황 확인
 → AI 팀 생성
 → 추천 결과 검토 및 수정
 → 팀 승인
 → 공지 / 팀 / 일지 / 채팅 관리
```

---

## 구현 포인트

### 설문 기반 팀 매칭

- 희망 직군, 기술 스택, 구현 경험 입력
- 협업 성향 / 개발 성향 설문
- 선호 팀원, 팀장 희망 여부 반영
- 응답 일관성과 신뢰도 계산 구조 반영

### AI 팀 추천 검토

- 학년별 팀 생성 요청
- AI 추천 결과 확인
- 팀원 역할과 배정 이유 확인
- 학생 수동 교체
- 최종 승인 후 실제 팀 확정

### 공지

- 일반 공지는 Markdown 기반으로 렌더링
- 팀 배정 결과 공지는 `noticeType === "TEAM_RESULT"` 기준으로 전용 화면 표시
- 팀장, 팀원, 역할 구성을 공지 상세에서 바로 확인 가능

### 실시간 채팅

- STOMP + WebSocket 기반 메시지 송수신
- 학생 팀 채팅과 관리자 채팅 관리 분리
- 채널별 메시지 조회 / 전송
- 메시지 수정 / 삭제
- 파일 업로드 / 다운로드
- 이미지 미리보기
- 읽지 않은 메시지 표시
- 온라인 / 오프라인 상태 표시

---

## 기술 스택

| 구분 | 기술 |
| --- | --- |
| Framework | React 19, Vite |
| Routing | React Router 7 |
| State | Zustand |
| API | Axios |
| Realtime | STOMP, WebSocket |
| Chart | Recharts |
| Markdown Editor | `@uiw/react-md-editor` |
| Styling | CSS Modules |
| Deploy | Vercel |

---

## 폴더 구조

```txt
src
├─ api              # API 요청 함수
├─ assets           # 이미지 / 아이콘
├─ components       # 공통, 학생, 관리자 컴포넌트
├─ constants        # 설문 문항, 고정 데이터
├─ hooks            # 커스텀 훅
├─ pages            # 페이지 컴포넌트
├─ router           # 라우터 / 보호 라우트
├─ store            # Zustand 전역 상태
├─ styles           # 전역 CSS
└─ utils            # 포맷팅 / 검증 / 데이터 가공
```

---

## 주요 라우트

### 공통

| 경로 | 설명 |
| --- | --- |
| `/` | 로그인 페이지로 이동 |
| `/login` | 로그인 |

### 학생

| 경로 | 설명 |
| --- | --- |
| `/user/survey/intro` | 설문 안내 |
| `/user/survey` | 팀 매칭 설문 |
| `/user/dashboard` | 학생 대시보드 |
| `/user/notice` | 공지 목록 |
| `/user/notice/:id` | 공지 상세 |
| `/user/project` | 프로젝트 기획서 |
| `/user/log/countdown` | 캡스톤 일지 카운트다운 |
| `/user/log` | 캡스톤 일지 작성 |
| `/user/log/result` | 캡스톤 일지 결과 |
| `/user/chat` | 팀 채팅 |
| `/user/profile` | 학생 내 정보 |

### 관리자

| 경로 | 설명 |
| --- | --- |
| `/admin/dashboard` | 관리자 대시보드 |
| `/admin/team-create` | 팀 생성 |
| `/admin/team-create/loading` | 팀 생성 로딩 |
| `/admin/team-edit` | 팀 추천안 검토 / 수정 |
| `/admin/team-manage` | 확정 팀 관리 |
| `/admin/student` | 학생 관리 |
| `/admin/notice` | 공지 목록 |
| `/admin/notice/create` | 공지 작성 |
| `/admin/notice/:id` | 공지 상세 |
| `/admin/notice/:id/edit` | 공지 수정 |
| `/admin/log` | 캡스톤 일지 목록 |
| `/admin/log/:id` | 캡스톤 일지 상세 |
| `/admin/chat` | 채팅 관리 |
| `/admin/profile` | 관리자 내 정보 |

---

## 인증 처리

- JWT 기반 로그인
- `accessToken`을 Zustand와 localStorage에 저장
- Axios interceptor에서 Authorization 헤더 자동 추가
- 토큰 만료 시 재발급 요청
- `ProtectedRoute`로 학생 / 관리자 페이지 분리
- 팀 생성 여부와 설문 완료 여부에 따라 접근 가능한 페이지 제한

---

## 배포

Vercel로 배포했다.

- 배포 주소: https://cap-team-web-frontend.vercel.app/
- API 서버: https://api.capteam.n-e.kr

HTTP API 요청은 Vercel rewrite를 통해 `/api` 경로로 전달한다.

`vercel.json`

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://api.capteam.n-e.kr/api/:path*"
    },
    {
      "source": "/ws/:path*",
      "destination": "https://api.capteam.n-e.kr/ws/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

채팅과 공지 실시간 연결은 WebSocket으로 직접 연결한다.

```txt
wss://api.capteam.n-e.kr/ws
```

---

## 환경 변수

개발 환경:

```env
VITE_BASE_URL=http://localhost:8080
```

배포 환경:

```env
VITE_BASE_URL=
```

WebSocket 주소를 별도로 지정해야 할 때:

```env
VITE_SOCKET_BASE_URL=https://api.capteam.n-e.kr
```

---

## 실행 방법

```bash
npm install
npm run dev
```

빌드:

```bash
npm run build
```

린트:

```bash
npm run lint
```

---

## 개발 상태

| 기능 | 상태 |
| --- | --- |
| 로그인 / 토큰 재발급 | 완료 |
| 학생 설문 | 완료 |
| AI 팀 생성 / 검토 / 승인 | 완료 |
| 팀 관리 | 완료 |
| 공지 CRUD | 완료 |
| 프로젝트 기획서 | 완료 |
| 캡스톤 일지 | 완료 |
| 학생 채팅 | 완료 |
| 관리자 채팅 | 완료 |
| 파일 업로드 / 미리보기 | 완료 |
| 배포 / 최종 QA | 완료 |

---

## 개선 예정

- 설문 신뢰도 계산 고도화
- AI 팀 추천 결과 설명 개선
- 채팅 알림 개선
- 모바일 반응형 보완
