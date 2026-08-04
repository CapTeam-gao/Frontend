# Frontend 유지보수 진행 현황 & 개발 순서

이 문서는 "지금 뭐가 끝났고, 뭐가 남았고, 다음엔 뭐부터 해야 하는지"만 보여주는 스냅샷이다. 필드명·API 상세 스펙은 항상 루트의 [Frontend.md](../Frontend.md)(Notion 원본 기준)를 따르고, 과거 작업 이력·왜 그렇게 했는지는 [FrontendResult.md](../FrontendResult.md)를 본다. 이 문서 자체는 진행 상황이 바뀔 때마다 갱신한다.

**전제**: 아래 순서는 전부 "Notion 유지보수 계획에 적힌 API를 백엔드가 그대로 구현해서 넘겨준다"는 가정하에 짠 순서다. 실제로 그 필드가 안 내려오면 대부분 항목이 기존 동작으로 자연 폴백되도록 짜여 있지만(리스크 없음), 체감 효과는 백엔드가 실제로 붙어야 나타난다.

---

## 완료된 것

- 설문 문항 역량 태그 제거
- 선호 팀원 검색·선택 UI (`UserSurvey.jsx`) — 경로/필드 버그 수정 완료(구 0순위, 커밋 `67f50f2`)
- 팀 생성 배치 스트리밍(로딩 → 첫 팀 도착 시 조기 전환) — API 필드 존재 여부만 미확인
- **팀 재생성 → 버전 기반 전·후 비교**(재생성도 같은 로딩 화면 재사용, "변경사항" 모달로 검토 후 적용/취소) — API·엔티티 전부 미확인
- **팀 구성 방식 선택(AI 자동 / 직접 구성)** — `AdminTeamCreate.jsx`에 모드 선택 UI, `AdminTeamManualCreate.jsx`(직접 구성 화면, 역할 검색·5명 정원 제한 포함) 실제 페이지, `requestCreateManualTeams` API 연동까지 전부 이전 세션에 이미 완료됨(`FrontendResult.md` 18번). Design 목업 단계가 아니라 실구현 상태 — 이 문서 이전 버전에 "미착수"로 잘못 적혀 있었음, 정정.
- 관리자 대시보드 미응답 알림 버튼 제거(기능 자체가 계획에서 제외됨)
- 전체 서비스 디자인 스윕(배경색 배지 제거, 폰트 굵기, border-radius 등)
- **dev 환경 로그인 404 수정(8/3)** — `.env.development`가 git 추적에서 빠진 뒤 대체 템플릿이 없어서 새로 클론한 환경에선 로그인이 404가 나던 문제. `vite.config.js`에 `/api`,`/ws` → `localhost:8080` 프록시 추가 + `.env.example` 신규(＋`.gitignore` 예외 처리), 커밋 `9192d16`.
- **FCM 공통 인프라 뼈대(8/3)** — `src/firebase/firebaseConfig.js`/`messaging.js`(토큰 발급·포그라운드 수신), `public/firebase-messaging-sw.js`(백그라운드 알림), `src/api/notificationApi.js`(토큰 등록/해제), `src/hooks/useFcmNotifications.js`(로그인 시 등록·로그아웃 시 해제, 포그라운드 알림 토스트) + `NotificationToast` 컴포넌트, `App.jsx`에 연결. `notificationType`(`JOURNAL_DEADLINE`/`CHAT_MESSAGE`/`NOTICE_CREATED`) 전부 제네릭하게 처리하므로 캡스톤 일지 마감 알림·공지 알림은 프론트 쪽 추가 작업 없이 이 인프라만으로 끝남. **실제 Firebase 프로젝트 설정값이 아직 없어서(`VITE_FIREBASE_*`, VAPID key) 지금은 아무 것도 등록되지 않는 안전한 no-op 상태** — 값이 채워지면 바로 동작.
- **팀 채팅 전역 알림(8/3)** — api.md 8번. `chatSocket.js`에 `subscribeUserChatNotifications` 추가(경로를 `/sub/users/{userId}/notifications`에서 이 코드베이스의 실제 관례인 `/user/queue/chat/notifications`로 정정), `useFcmNotifications.js`에서 로그인 시(학생 계정만) 구독해 FCM 토스트와 같은 `NotificationToast`로 표시. `/user/chat` 페이지를 보고 있을 때는 그 화면 안에서 이미 실시간으로 보이므로 전역 토스트는 생략. api.md/Notion 8번 섹션도 같이 정정. 백엔드가 이 경로로 아직 발행 안 하면 구독만 걸린 채 조용히 아무 일도 안 일어남(기존 동작 안 깨짐).

## 계획에서 제외된 것

- 설문 미응답 학생 FCM 알림 (실효성 없다고 판단해 제외 확정)
- "학생 희망 팀 제출 후 AI 보정" 방식 (AI 자동 / 직접 구성 2가지로 축소)

---

## 남은 작업 순서

### 1순위 — 지금 만든 기능 검증 (백엔드 무관, 바로 가능)
- [ ] 로그인해서 팀 재생성 전체 흐름(재생성 → 로딩 → 팀 에딧 복귀 → 변경사항 모달 → 적용/취소) 브라우저 실사용 검증
- [ ] 이번 세션에서 손댄 화면 전체 브라우저 검증(대부분 `npm run build`/`eslint`만 통과한 상태)

### 2순위 — 백엔드 확인 필요, 확인되는 즉시 마무리 가능 (거의 다 됨)
1. **팀 재생성 버전 API** — `TeamMatchingVersion` 엔티티, `versions/{id}`, `versions/diff`, `versions/{id}/apply`, `versions/{id}/discard`, `MatchingJob`의 `origin`/`baseVersionId`/`versionId` 필드. 프론트는 이미 이 스펙대로 `AdminTeamEdit.jsx`/`AdminTeamCreateLoading.jsx`/`teamApi.js`에 연결까지 끝냄 — 필드만 내려오면 그대로 동작.
2. **팀 생성 배치 스트리밍** — `totalBatches`/`completedBatches`/`partialTeams`. 위와 마찬가지로 프론트 구현은 끝, 확인만 남음.
3. **대시보드 `MOCK_*` → 실제 API 교체** — `requestMyTeam`/`requestUserProjectPlan`/`requestNoticeList`/`requestAdminStudentList`/`requestAdminLogList`는 이미 존재 확인됨(연결만 하면 됨). 채팅 미리보기(`recentChatMessages`)만 대응 API가 아예 없어서 백엔드에 신규 필드 요청 필요.
4. **`POST /api/admin/teams/manual` 백엔드 미구현 확인(8/3)** — `AdminTeamController`(`/api/admin/teams`)를 직접 읽어보니 `/manual` 매핑이 아예 없음. `AdminTeamManualCreate.jsx`의 "직접 구성 완료" 버튼을 누르면 지금은 404가 날 것으로 보임(프론트 코드 자체는 api.md 스펙대로 맞게 구현돼 있음 — 백엔드 쪽만 없는 상태). 실제로 눌러서 재현 확인 필요.
5. **`/user/queue/chat/notifications` 백엔드 발행 확인** — 팀 채팅 전역 알림용 신규 채널. 백엔드가 아직 이 경로로 안 보내면 조용히 no-op(위 완료 목록 참고).

### 2.5순위 — Firebase 프로젝트 실제 값만 있으면 바로 되는 것
1. **`VITE_FIREBASE_*`/VAPID key 필요** — 팀에서 Firebase 프로젝트를 만들면 `.env.development`/`.env.production`에 `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_VAPID_KEY`를 채우고, `public/firebase-messaging-sw.js`의 `REPLACE_ME` 6곳도 같은 값으로 채워야 함(서비스워커는 정적 파일이라 `import.meta.env`를 못 씀). **`.env` 파일 자체는 직접 건드리면 안 되는 파일이라 이 작업은 팀원이 직접 해야 함.**
2. **`POST /api/user/fcm-token`/`DELETE /api/user/fcm-token` 백엔드 확인** — `FcmToken` 엔티티, 로그인/로그아웃 시 등록·해제 API. 프론트는 `useFcmNotifications.js`에 이미 연결 완료.
3. **`JournalDeadlineScheduler` 등 백엔드 자동 발송 확인** — `notificationType: JOURNAL_DEADLINE`/`NOTICE_CREATED` payload가 실제로 오는지. 프론트는 `NotificationToast`가 타입 무관하게 제네릭 처리하므로 추가 작업 없음.

### 3순위 — 아직 프론트 실구현도 안 한 것
Notion P0 항목은 위 완료 목록으로 전부 끝났음(설문 태그 제거·선호 팀원 검색·버전 저장·재생성 비교·팀 구성 방식 선택 5개 다 완료). 여기서부터는 P1→P2 순서.

1. **AI 처리 진행률/신뢰성 설명 보강** — LLM 비용 관련은 백엔드/AI 담당 영역이 커서 프론트는 처리 시간·토큰 사용량 등을 보여주는 UI 정도만 해당(있다면). P1, 범위 작음.
2. **팀 채팅 — 메시지 고정 / 읽음 상태 / 담당 업무 표시** — 디자인 목업도 아직 없음. P2.

### 보류
- 팀 버전 이력 목록 화면(`GET /api/admin/team-recommendations/versions?grade=` 전체 목록 UI) — 지금은 "직전 버전과의 비교"만 구현, 여러 버전을 오가며 보는 UI는 필요성이 확인되면 추가.

---

## 다음에 손댈 것 (제안)

Notion P0는 전부 끝났고, FCM 인프라·팀 채팅 전역 알림 뼈대까지 세웠다. 프론트에서 백엔드 확인 없이 바로 할 수 있는 새 작업은 이제 별로 안 남았음 — 남은 건 대부분 2순위/2.5순위의 "백엔드 확인 필요" 항목이거나(버전 API, 배치 스트리밍, `teams/manual`, 채팅 알림 발행, Firebase 키), 디자인부터 새로 해야 하는 P2(팀 채팅 고정/읽음/담당업무). 다음 세션은 **1순위 브라우저 실사용 검증**부터 하고, 그다음은 2순위 항목들을 백엔드 팀원과 하나씩 맞춰나가는 걸 추천한다.
