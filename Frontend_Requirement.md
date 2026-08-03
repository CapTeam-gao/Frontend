# Frontend 유지보수 진행 현황 & 개발 순서

이 문서는 "지금 뭐가 끝났고, 뭐가 남았고, 다음엔 뭐부터 해야 하는지"만 보여주는 스냅샷이다. 필드명·API 상세 스펙은 항상 루트의 [Frontend.md](../Frontend.md)(Notion 원본 기준)를 따르고, 과거 작업 이력·왜 그렇게 했는지는 [FrontendResult.md](../FrontendResult.md)를 본다. 이 문서 자체는 진행 상황이 바뀔 때마다 갱신한다.

**전제**: 아래 순서는 전부 "Notion 유지보수 계획에 적힌 API를 백엔드가 그대로 구현해서 넘겨준다"는 가정하에 짠 순서다. 실제로 그 필드가 안 내려오면 대부분 항목이 기존 동작으로 자연 폴백되도록 짜여 있지만(리스크 없음), 체감 효과는 백엔드가 실제로 붙어야 나타난다.

---

## 완료된 것

- 설문 문항 역량 태그 제거
- 선호 팀원 검색·선택 UI (`UserSurvey.jsx`) — API 존재 여부만 미확인
- 팀 생성 배치 스트리밍(로딩 → 첫 팀 도착 시 조기 전환) — API 필드 존재 여부만 미확인
- **팀 재생성 → 버전 기반 전·후 비교**(재생성도 같은 로딩 화면 재사용, "변경사항" 모달로 검토 후 적용/취소) — API·엔티티 전부 미확인
- **팀 구성 방식 선택(AI 자동 / 직접 구성)** — `AdminTeamCreate.jsx`에 모드 선택 UI, `AdminTeamManualCreate.jsx`(직접 구성 화면, 역할 검색·5명 정원 제한 포함) 실제 페이지, `requestCreateManualTeams` API 연동까지 전부 이전 세션에 이미 완료됨(`FrontendResult.md` 18번). Design 목업 단계가 아니라 실구현 상태 — 이 문서 이전 버전에 "미착수"로 잘못 적혀 있었음, 정정.
- 관리자 대시보드 미응답 알림 버튼 제거(기능 자체가 계획에서 제외됨)
- 전체 서비스 디자인 스윕(배경색 배지 제거, 폰트 굵기, border-radius 등)

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
3. **`GET /api/students/search?keyword=`** — 선호 팀원 검색, 역할 라벨 매칭 포함. 없으면 검색이 항상 빈 결과.
4. **대시보드 `MOCK_*` → 실제 API 교체** — `requestMyTeam`/`requestUserProjectPlan`/`requestNoticeList`/`requestAdminStudentList`/`requestAdminLogList`는 이미 존재 확인됨(연결만 하면 됨). 채팅 미리보기(`recentChatMessages`)만 대응 API가 아예 없어서 백엔드에 신규 필드 요청 필요.

### 3순위 — 아직 프론트 실구현도 안 한 것
Notion P0 항목은 위 완료 목록으로 전부 끝났음(설문 태그 제거·선호 팀원 검색·버전 저장·재생성 비교·팀 구성 방식 선택 5개 다 완료). 여기서부터는 P1→P2 순서.

1. **캡스톤 일지 마감 알림** — FCM 공통 인프라(`FcmToken`/`NotificationLog`, 토큰 등록 API 연동)부터 시작해야 함. 현재 프로젝트에 FCM 코드가 전혀 없는 그린필드 상태. `AdminLogList`의 수동 발송 버튼(있다면) 제거도 함께. P1.
2. **AI 처리 진행률/신뢰성 설명 보강** — LLM 비용 관련은 백엔드/AI 담당 영역이 커서 프론트는 처리 시간·토큰 사용량 등을 보여주는 UI 정도만 해당(있다면). P1, 범위 작음.
3. **팀 채팅 — 메시지 고정 / 읽음 상태 / 담당 업무 표시** — 디자인 목업도 아직 없음. P2.
4. **팀 채팅 FCM 푸시 + 포그라운드 토스트** — 1번(FCM 인프라) 선행 필요. P1이지만 FCM 인프라에 종속.
5. **공지 등록 시 FCM 알림** — 1번 선행 필요, 프론트 작업량은 거의 없음(공통 알림 수신 분기에 케이스 하나 추가). P1이지만 FCM 인프라에 종속.

### 보류
- 팀 버전 이력 목록 화면(`GET /api/admin/team-recommendations/versions?grade=` 전체 목록 UI) — 지금은 "직전 버전과의 비교"만 구현, 여러 버전을 오가며 보는 UI는 필요성이 확인되면 추가.

---

## 다음에 손댈 것 (제안)

Notion P0는 전부 끝났다. **FCM 공통 인프라(`FcmToken`/`NotificationLog`, 토큰 등록 API) 구축 → 캡스톤 일지 마감 알림**부터 시작하는 걸 추천한다 — P1에서 가장 앞서 있고, 한 번 만들면 팀 채팅 알림·공지 알림이 그 위에 그대로 얹히는 구조라 나머지 P1 항목 2개를 자동으로 절반 이상 끝내주는 선행 작업이다.
