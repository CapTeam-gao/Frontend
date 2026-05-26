# AGENTS.md

이 프로젝트는 CapTeam 프론트엔드다. CapTeam은 AI 기반 캡스톤 팀 자동생성 및 관리 올인원 서비스이며, 기획 기준은 Notion 기획서와 Figma 디자인이다.

## 답변 스타일

-   사용자는 프론트엔드 기반 풀스택 개발자를 준비하는 고등학생 개발자 준비생이다.
-   설명은 반말로 하되 무례하게 말하지 않는다.
-   개발 용어를 쓰면 그 단어가 무슨 뜻인지 쉽게 풀어서 설명한다.
-   React 기초를 배웠지만 자유자재로 다루지는 못한다고 가정한다.
-   설명할 때는 네이버, 쿠팡, 학교 공지사항, 로그인 화면처럼 실제 웹 서비스 예시를 들어 이해시키면 좋다.
-   너무 실무적인 구조를 한 번에 밀어붙이지 말고, 지금 단계에서 이해하고 유지할 수 있는 수준으로 제안한다.

## 핵심 원칙

### 1. 추측하지 말고 확인하기

-   파일명, 라우터, props, API 이름을 추측해서 바로 수정하지 않는다.
-   먼저 `src` 구조, 실제 import, 라우터 연결, 현재 파일 내용을 확인한다.
-   Figma나 Notion 기준이라고 말할 때는 실제로 확인한 내용과 추론한 내용을 구분해서 말한다.
-   백엔드 API가 확정되지 않은 상태에서는 더미데이터로 UI를 먼저 만든다.

### 2. 헷갈리면 숨기지 말고 드러내기

-   권한, 로그인 상태, CORS, API 명세가 불확실하면 “이 부분은 아직 확인이 필요하다”고 말한다.
-   `ProtectedRoute` 때문에 화면이 안 뜨는 문제처럼 코드가 정상이어도 흐름상 막히는 경우를 설명한다.
-   사용자가 질문한 범위를 넘어서 큰 리팩토링이 필요해 보이면 먼저 제안하고 확인받는다.

### 3. 작고 단순하게 만들기

-   지금 단계에서는 과한 추상화, 복잡한 폴더 재구성, 공통화 남발을 피한다.
-   페이지를 만들 때는 `더미데이터 -> 화면 출력 -> 컴포넌트 분리 -> API 연결` 순서로 간다.
-   공통 컴포넌트는 UI 역할을 우선한다. 예를 들어 `SearchBar`는 검색 로직을 직접 갖지 않고 페이지에서 검색 로직을 처리한다.
-   기능 하나를 만들 때 한 번에 많은 파일을 건드리지 않는다.

### 4. 기존 코드를 함부로 지우지 않기

-   사용자가 만든 코드, 주석, 파일은 이유 없이 삭제하지 않는다.
-   안 쓰는 파일처럼 보여도 바로 삭제하지 말고 라우터와 import에서 실제로 쓰이는지 확인한다.
-   삭제나 파일명 변경은 사용자가 동의했을 때만 한다.
-   수정 후에는 어떤 파일을 왜 바꿨는지 설명한다.

## 프로젝트 기능 기준

Notion 기획서 기준 MVP는 다음 흐름을 중심으로 한다.

### 관리자

-   로그인
-   대시보드
-   팀 생성
-   팀 생성 로딩
-   팀 관리
-   팀 수정
-   캡스톤 일지 목록
-   캡스톤 일지 상세
-   학생 관리
-   공지 목록
-   공지 작성
-   공지 상세
-   채팅 관리
-   내 정보

### 학생

-   로그인
-   대시보드
-   공지 목록
-   공지 상세
-   캡스톤 일지 작성
-   캡스톤 일지 결과
-   프로젝트 기획서 입력
-   팀 채팅
-   내 정보

## 현재 폴더/파일명 규칙

페이지 파일은 관리자와 학생 파일명이 겹치지 않게 접두어를 붙인다.

```txt
src/pages/admin/AdminDashboard.jsx
src/pages/admin/AdminNoticeList.jsx
src/pages/admin/AdminNoticeDetail.jsx
src/pages/admin/AdminTeamManage.jsx

src/pages/user/UserDashboard.jsx
src/pages/user/UserNoticeList.jsx
src/pages/user/UserNoticeDetail.jsx
src/pages/user/UserTeamChat.jsx
```

라우터 import도 파일명과 맞춘다.

```jsx
import AdminNoticeList from "../pages/admin/AdminNoticeList";
import UserNoticeList from "../pages/user/UserNoticeList";
```

CSS module도 JSX 파일명과 맞춘다.

```txt
UserNoticeList.jsx
UserNoticeList.module.css
```

## 라우터 규칙

-   `/login`은 로그인 페이지다.
-   `/admin/...`은 관리자 페이지다.
-   `/user/...`는 학생 페이지다.
-   보호가 필요한 페이지는 `ProtectedRoute`로 감싼다.
-   개발 중 더미 화면을 확인해야 할 때는 임시로 `ProtectedRoute`를 빼도 되지만, 임시 변경이라고 설명해야 한다.

예시:

```jsx
<Route
    path="/user/notice"
    element={
        <ProtectedRoute requiredRole="user">
            <UserNoticeList />
        </ProtectedRoute>
    }
/>
```

## 개발 순서

초반 개발은 다음 순서를 우선한다.

1. 라우터 연결 확인
2. 로그인 입력 흐름 확인
3. 학생 공지 목록 더미데이터 화면
4. 학생 공지 상세 화면
5. 관리자 공지 목록
6. 관리자 공지 작성
7. 공지 API 연결
8. 학생 관리
9. 팀 관리
10. 캡스톤 일지
11. 팀 생성 AI 흐름
12. 채팅

## 더미데이터 개발 규칙

-   API 연결 전에는 배열 더미데이터로 화면을 먼저 만든다.
-   리스트 화면은 `map`으로 렌더링한다.
-   리스트 아이템에는 반드시 `key`를 넣는다.
-   상세 페이지는 나중에 `useParams`로 id를 꺼내는 방식으로 연결한다.

예시:

```jsx
{
    notices.map((notice) => (
        <li key={notice.id}>
            {notice.important && <strong>[중요]</strong>}
            <span>{notice.title}</span>
            <span>{notice.writer}</span>
            <span>{notice.date}</span>
        </li>
    ));
}
```

## API 연결 규칙

-   axios 직접 호출은 페이지에서 남발하지 않는다.
-   기능별 API 파일을 사용한다.

```txt
src/api/authApi.js
src/api/noticeApi.js
src/api/teamApi.js
src/api/studentApi.js
src/api/logApi.js
src/api/projectApi.js
```

-   CORS 에러는 프론트 문법 문제가 아니라 백엔드 허용 설정 문제일 수 있다.
-   `withCredentials: true`를 쓰는 경우 백엔드도 credentials 허용이 필요하다.

## UI/디자인 규칙

-   Figma 디자인을 기준으로 색, 간격, 카드 모양, 페이지 구성을 맞춘다.
-   색상과 폰트 크기는 가능한 `global.css`의 CSS 변수를 사용한다.
-   처음부터 완벽한 디자인보다 기능이 보이는 화면을 먼저 만든 뒤 다듬는다.
-   로그인 페이지에 Header나 SearchBar처럼 테스트용으로 넣은 컴포넌트는 실제 화면 구현 전에 제거 여부를 확인한다.
-   어떠한 기능이나 페이지, 컴포넌트를 만든다는 얘기를 받으면 꼭 사전에 Figma 디자인을 확인한 후 힌트나 코드를 제공한다.

## 검증 규칙

수정 후 가능한 경우 아래를 실행한다.

```bash
npm run build
npm run lint
```

-   `build` 실패는 반드시 고친다.
-   `lint` warning은 기존 warning인지 새로 만든 warning인지 구분해서 설명한다.
-   현재 알려진 warning: `src/hooks/useAuth.js`의 dependency warning.

## 커뮤니케이션 규칙

-   수정 전에는 어떤 파일을 건드릴지 짧게 말한다.
-   수정 후에는 바뀐 파일, 바뀐 이유, 확인 결과를 알려준다.
-   사용자가 “검토받으면 리팩토링해줘”라고 하면 먼저 제안만 하고, 승인 후 수정한다.
-   사용자가 “바꿔줘”라고 명확히 말하면 바로 수정한다.
