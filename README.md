# CapTeam · Frontend

<p align="center">
  <img src="./public/logo.png" width="92" alt="CapTeam 로고" />
</p>

<p align="center">
  <strong>설문부터 팀 운영까지, 캡스톤 프로젝트를 한 곳에서</strong><br />
  학생과 관리자를 연결하는 AI 기반 캡스톤 팀 매칭·운영 서비스
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-149E6B?style=flat-square&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-8-149E6B?style=flat-square&logo=vite&logoColor=white" alt="Vite 8" />
  <img src="https://img.shields.io/badge/JavaScript-ES2022-149E6B?style=flat-square&logo=javascript&logoColor=white" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Deploy-Vercel-149E6B?style=flat-square&logo=vercel&logoColor=white" alt="Vercel" />
</p>

## 서비스 소개

CapTeam은 학생 설문 데이터를 바탕으로 협업 성향과 기술 스택을 분석해 캡스톤 팀을 추천하고, 팀이 만들어진 뒤의 프로젝트 기획·공지·일지·채팅까지 이어서 관리하는 올인원 서비스야.

화면은 학생용과 관리자용으로 나뉘며, 반응형 레이아웃을 적용해 데스크톱과 모바일에서 같은 흐름으로 사용할 수 있도록 구성했어.

## 핵심 흐름

```text
학생 설문 작성
      ↓
관리자 AI 팀 추천 · 수동 팀 구성
      ↓
팀 확정
      ↓
프로젝트 기획서 · 공지 · 캡스톤 일지 · 팀 채팅
```

## 기능

### 학생

- 설문 작성 및 팀 매칭 결과 확인
- 프로젝트 기획서 작성·수정
- 공지 목록·상세 조회
- 캡스톤 일지 작성 및 제출 결과 확인
- 팀 채팅, 읽지 않은 메시지 알림
- 프로필 확인 및 비밀번호 변경

### 관리자

- 대시보드에서 학생·팀·일지 현황 확인
- 학년별 AI 팀 추천 및 수동 팀 구성
- 추천 팀 검토, 학생 교체, 팀 확정·수정
- 학생 목록과 설문 응답 상세 확인
- 공지 작성·수정·삭제
- 캡스톤 일지 제출 현황과 월별 캘린더 확인
- 팀별 채팅방과 메시지 관리

## 기술 스택

| 영역 | 사용 기술 |
| --- | --- |
| UI | React 19, CSS Modules |
| Build | Vite 8 |
| Routing | React Router 7 |
| 상태 관리 | Zustand 5 |
| API 통신 | Axios |
| 실시간 통신 | STOMP, SockJS |
| 알림 | Firebase Cloud Messaging |
| 애니메이션 | Motion |
| 차트 | Recharts |
| 배포 | Vercel |

## 시작하기

### 1. 설치

```bash
git clone https://github.com/CapTeam-gao/Frontend.git
cd Frontend
npm install
```

### 2. 환경 변수 설정

```bash
cp .env.example .env.development
```

`.env.development`에 연결할 백엔드 주소를 설정해줘.

```env
VITE_BASE_URL=http://localhost:8080
```

실제 운영 주소는 `.env.production`에 설정하고, 환경 변수 파일은 저장소에 커밋하지 않아.

### 3. 개발 서버 실행

```bash
npm run dev
```

터미널에 표시되는 로컬 주소(기본값 `http://localhost:5173`)로 접속하면 돼.

## 명령어

| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 생성 |
| `npm run preview` | 빌드 결과 로컬 확인 |
| `npm run lint` | ESLint 정적 검사 |

## 프로젝트 구조

```text
src/
├─ api/                 # 기능별 API 모듈
├─ components/          # 관리자·학생·공통 UI 컴포넌트
├─ hooks/               # 인증, STOMP, 알림 등 커스텀 훅
├─ pages/
│  ├─ admin/             # 관리자 화면
│  ├─ auth/              # 로그인
│  └─ user/              # 학생 화면
├─ router/               # 라우팅 및 보호 라우트
├─ store/                # Zustand 전역 상태
└─ styles/               # 전역 토큰과 공통 스타일
```

페이지 파일은 역할이 겹치지 않도록 `AdminNoticeList.jsx`, `UserNoticeList.jsx`처럼 접두어를 사용해.

## 화면 경로

| 사용자 | 주요 경로 |
| --- | --- |
| 공통 | `/login` |
| 관리자 | `/admin/dashboard`, `/admin/team`, `/admin/student`, `/admin/notice`, `/admin/log`, `/admin/chat` |
| 학생 | `/user/dashboard`, `/user/project`, `/user/notice`, `/user/log`, `/user/chat` |

관리자·학생 전용 화면은 로그인 권한을 확인하는 `ProtectedRoute`로 보호돼.

## 디자인 원칙

- 토스와 Apple처럼 **정보는 선명하게, 장식은 가볍게**
- 초록 액티브 컬러를 핵심 상태와 인터랙션에만 사용
- 불필요한 구분선과 텍스트 배경을 줄이고 충분한 여백 유지
- 모바일에서도 가로 넘침 없이 콘텐츠 우선순위가 유지되는 반응형 레이아웃
- `prefers-reduced-motion`을 고려한 접근 가능한 모션

## 참고 문서

- [프론트엔드 요구사항](./Frontend_Requirement.md)
- [프로젝트 이슈 및 작업 목록](https://github.com/CapTeam-gao/Frontend/issues)
