import { useMemo, useState } from "react";
import Header from "../../components/common/Header";
import styles from "./AdminStudentManage.module.css";

const students = [
    {
        id: 1,
        number: "2313",
        name: "허재원",
        grade: 2,
        classNumber: 3,
        position: "프론트엔드",
        stacks: ["React", "JavaScript", "CSS Module"],
        team: "1팀",
        surveyCompleted: true,
        leaderPreference: "O",
        experiences: [
            "공지 CRUD 구현 - axios API 호출과 useState 기반 화면 상태 관리",
            "팀 수정 화면 구현 - 선택된 학생 2명을 서로 교체하는 로직 작성",
        ],
    },
    {
        id: 2,
        number: "2314",
        name: "김성현",
        grade: 2,
        classNumber: 3,
        position: "백엔드",
        stacks: ["Spring", "Java", "MySQL"],
        team: "1팀",
        surveyCompleted: true,
        leaderPreference: "X",
        experiences: [
            "공지 API 구현 - Controller, Service, Repository 구조로 CRUD 작성",
        ],
    },
    {
        id: 3,
        number: "2315",
        name: "유채민",
        grade: 2,
        classNumber: 3,
        position: "디자인",
        stacks: ["Figma", "UI/UX", "Prototype"],
        team: "2팀",
        surveyCompleted: false,
        leaderPreference: "X",
        experiences: ["Figma 기반 서비스 화면 와이어프레임 제작"],
    },
    {
        id: 4,
        number: "2321",
        name: "김지훈",
        grade: 2,
        classNumber: 4,
        position: "프론트엔드",
        stacks: ["React", "Axios", "Zustand"],
        team: "2팀",
        surveyCompleted: true,
        leaderPreference: "O",
        experiences: [
            "JWT 로그인 흐름 구현 - accessToken 저장 및 권한별 이동 처리",
        ],
    },
    {
        id: 5,
        number: "3311",
        name: "박진욱",
        grade: 3,
        classNumber: 1,
        position: "AI",
        stacks: ["Python", "FastAPI", "LangGraph"],
        team: "3팀",
        surveyCompleted: true,
        leaderPreference: "X",
        experiences: ["학생 분석 결과를 바탕으로 팀 매칭 워크플로 구현"],
    },
    {
        id: 6,
        number: "3312",
        name: "이도윤",
        grade: 3,
        classNumber: 1,
        position: "게임개발",
        stacks: ["Unity", "C#", "Git"],
        team: "3팀",
        surveyCompleted: false,
        leaderPreference: "O",
        experiences: ["Unity 기반 플레이어 이동 및 충돌 처리 기능 구현"],
    },
    {
        id: 7,
        number: "3318",
        name: "최서연",
        grade: 3,
        classNumber: 2,
        position: "백엔드",
        stacks: ["Spring", "JPA", "JWT"],
        team: "4팀",
        surveyCompleted: true,
        leaderPreference: "X",
        experiences: ["Spring Security 기반 JWT 인증 구조 구현"],
    },
    {
        id: 8,
        number: "3320",
        name: "정민재",
        grade: 3,
        classNumber: 2,
        position: "프론트엔드",
        stacks: ["React", "Router", "CSS"],
        team: "4팀",
        surveyCompleted: true,
        leaderPreference: "X",
        experiences: ["대시보드 카드 UI와 라우팅 이동 흐름 구현"],
    },
    {
        id: 9,
        number: "3324",
        name: "한지우",
        grade: 3,
        classNumber: 3,
        position: "DevOps",
        stacks: ["Docker", "AWS", "Linux"],
        team: "미배정",
        surveyCompleted: false,
        leaderPreference: "X",
        experiences: ["Docker Compose를 이용한 개발 서버 실행 환경 구성"],
    },
];

const summaryFilters = [
    {
        key: "all",
        label: "전체 학생",
    },
    {
        key: "grade2",
        label: "2학년",
    },
    {
        key: "grade3",
        label: "3학년",
    },
    {
        key: "surveyPending",
        label: "설문 미제출",
    },
];

const AdminStudentManage = () => {
    const [searchKeyword, setSearchKeyword] = useState("");
    const [activeSummaryFilter, setActiveSummaryFilter] = useState("all");
    const [selectedStudent, setSelectedStudent] = useState(null);

    const filteredStudents = useMemo(() => {
        return students.filter((student) => {
            const keyword = searchKeyword.trim().toLowerCase();
            const matchesKeyword =
                !keyword ||
                student.name.toLowerCase().includes(keyword) ||
                student.number.includes(keyword) ||
                student.position.toLowerCase().includes(keyword);
            const matchesSummary =
                activeSummaryFilter === "all" ||
                (activeSummaryFilter === "grade2" && student.grade === 2) ||
                (activeSummaryFilter === "grade3" && student.grade === 3) ||
                (activeSummaryFilter === "surveyPending" &&
                    !student.surveyCompleted);

            return matchesKeyword && matchesSummary;
        });
    }, [activeSummaryFilter, searchKeyword]);

    const totalCount = students.length;
    const secondGradeCount = students.filter(
        (student) => student.grade === 2
    ).length;
    const thirdGradeCount = students.filter(
        (student) => student.grade === 3
    ).length;
    const surveyPendingCount = students.filter(
        (student) => !student.surveyCompleted
    ).length;
    const summaryCounts = {
        all: totalCount,
        grade2: secondGradeCount,
        grade3: thirdGradeCount,
        surveyPending: surveyPendingCount,
    };

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.body}>
                <section className={styles.pageHeader}>
                    <div>
                        <h1>학생 관리</h1>
                    </div>
                    <span className={styles.resultCount}>
                        {filteredStudents.length}명 표시 중
                    </span>
                </section>

                <section className={styles.summaryGrid}>
                    {summaryFilters.map((filter) => (
                        <button
                            key={filter.key}
                            type="button"
                            className={`${styles.summaryCard} ${
                                activeSummaryFilter === filter.key
                                    ? styles.active
                                    : ""
                            }`}
                            onClick={() => setActiveSummaryFilter(filter.key)}
                        >
                            <span>{filter.label}</span>
                            <strong>{summaryCounts[filter.key]}</strong>
                        </button>
                    ))}
                </section>

                <section className={styles.controlPanel}>
                    <label className={styles.searchBox}>
                        <span>검색</span>
                        <input
                            type="text"
                            value={searchKeyword}
                            placeholder="이름, 학번, 희망 직군 검색"
                            onChange={(e) => setSearchKeyword(e.target.value)}
                        />
                    </label>
                </section>

                <section className={styles.studentGrid}>
                    {filteredStudents.map((student) => (
                        <button
                            key={student.id}
                            type="button"
                            className={styles.studentCard}
                            onClick={() => setSelectedStudent(student)}
                        >
                            <div className={styles.cardHeader}>
                                <div>
                                    <strong>{student.name}</strong>
                                    <p>
                                        {student.grade}학년{" "}
                                        {student.classNumber}반{" "}
                                        {student.number.slice(-2)}번
                                    </p>
                                </div>
                                <span
                                    className={
                                        student.surveyCompleted
                                            ? styles.doneBadge
                                            : styles.pendingBadge
                                    }
                                >
                                    {student.surveyCompleted
                                        ? "설문 완료"
                                        : "설문 미완료"}
                                </span>
                            </div>

                            <div className={styles.cardMeta}>
                                <span>소속 팀</span>
                                <strong>{student.team}</strong>
                            </div>

                            <p className={styles.cardHint}>
                                클릭하여 상세 정보 확인
                            </p>
                        </button>
                    ))}
                </section>
            </main>

            {selectedStudent && (
                <div
                    className={styles.modalOverlay}
                    role="presentation"
                    onClick={() => setSelectedStudent(null)}
                >
                    <section
                        className={styles.modal}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="student-modal-title"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.modalHeader}>
                            <div>
                                <h2 id="student-modal-title">
                                    {selectedStudent.name}
                                </h2>
                            </div>
                            <button
                                type="button"
                                className={styles.closeButton}
                                aria-label="학생 상세 모달 닫기"
                                onClick={() => setSelectedStudent(null)}
                            >
                                X
                            </button>
                        </div>

                        {!selectedStudent.surveyCompleted ? (
                            <div className={styles.emptySurveyMessage}>
                                <strong>설문이 미완료입니다</strong>
                                <p>
                                    학생이 설문을 제출하면 기술 스택과 구현
                                    경험을 확인할 수 있습니다.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className={styles.detailGrid}>
                                    <article>
                                        <span>학년/반/번호</span>
                                        <strong>
                                            {selectedStudent.grade}학년{" "}
                                            {selectedStudent.classNumber}반{" "}
                                            {selectedStudent.number.slice(-2)}번
                                        </strong>
                                    </article>
                                    <article>
                                        <span>희망 직군</span>
                                        <strong>
                                            {selectedStudent.position}
                                        </strong>
                                    </article>
                                    <article>
                                        <span>소속 팀</span>
                                        <strong>{selectedStudent.team}</strong>
                                    </article>
                                    <article>
                                        <span>팀장 선호</span>
                                        <strong>
                                            {selectedStudent.leaderPreference}
                                        </strong>
                                    </article>
                                </div>

                                <div className={styles.detailSection}>
                                    <h3>기술 스택</h3>
                                    <div className={styles.modalStackList}>
                                        {selectedStudent.stacks.map((stack) => (
                                            <span key={stack}>{stack}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.detailSection}>
                                    <h3>구현해본 기능</h3>
                                    <ul className={styles.experienceList}>
                                        {selectedStudent.experiences.map(
                                            (experience) => (
                                                <li key={experience}>
                                                    {experience}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </div>
                            </>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
};

export default AdminStudentManage;
