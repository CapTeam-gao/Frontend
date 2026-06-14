import { useEffect, useMemo, useState } from "react";
import Header from "../../../components/common/header/Header";
import {
    requestAdminStudentDetail,
    requestAdminStudentList,
} from "../../../api/studentApi";
import styles from "./AdminStudentManage.module.css";

const roleLabels = {
    FRONTEND: "프론트엔드",
    BACKEND: "백엔드",
    AI: "AI",
    APP: "앱 개발",
    DESIGN: "디자인",
};

const levelLabels = {
    UPPER: "상",
    MIDDLE: "중",
    LOWER: "하",
};

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

const getStudentNumberInfo = (userId = "") => {
    const number = userId.replace("stu", "");

    if (number.length !== 4) {
        return {
            number,
            classText: "-",
        };
    }

    return {
        number,
        classText: `${number[0]}학년 ${number[1]}반 ${Number(
            number.slice(2)
        )}번`,
    };
};

const normalizeSearchText = (value = "") =>
    String(value).toLowerCase().replace(/\s/g, "");

const getStudentSearchText = (student) => {
    const numberInfo = getStudentNumberInfo(student.userId);
    const roleText = roleLabels[student.studentRole] || student.studentRole;

    return [
        student.name,
        student.userId,
        numberInfo.number,
        numberInfo.classText,
        roleText,
    ]
        .filter(Boolean)
        .map(normalizeSearchText)
        .join(" ");
};

const AdminStudentManage = () => {
    const [students, setStudents] = useState([]);
    const [summaryCounts, setSummaryCounts] = useState({
        all: 0,
        grade2: 0,
        grade3: 0,
        surveyPending: 0,
    });
    const [searchKeyword, setSearchKeyword] = useState("");
    const [activeSummaryFilter, setActiveSummaryFilter] = useState("all");
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [error, setError] = useState("");
    const [modalError, setModalError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const getStudents = async () => {
            try {
                setIsLoading(true);
                const data = await requestAdminStudentList();
                setStudents(Array.isArray(data.students) ? data.students : []);
                setSummaryCounts({
                    all: data.totalStudentCount || 0,
                    grade2: data.grade2StudentCount || 0,
                    grade3: data.grade3StudentCount || 0,
                    surveyPending: data.surveyNotSubmittedCount || 0,
                });
            } catch (e) {
                setError(
                    e.response?.data?.message ||
                        e.response?.data?.error ||
                        "학생 정보를 불러오지 못했습니다."
                );
            } finally {
                setIsLoading(false);
            }
        };

        getStudents();
    }, []);

    useEffect(() => {
        if (!selectedStudent) return undefined;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [selectedStudent]);

    const filteredStudents = useMemo(() => {
        return students.filter((student) => {
            const keyword = normalizeSearchText(searchKeyword);
            const studentSearchText = getStudentSearchText(student);
            const matchesKeyword =
                !keyword || studentSearchText.includes(keyword);
            const matchesSummary =
                activeSummaryFilter === "all" ||
                (activeSummaryFilter === "grade2" &&
                    student.grade === "GRADE_2") ||
                (activeSummaryFilter === "grade3" &&
                    student.grade === "GRADE_3") ||
                (activeSummaryFilter === "surveyPending" &&
                    !student.surveyCompleted);

            return matchesKeyword && matchesSummary;
        });
    }, [activeSummaryFilter, searchKeyword, students]);

    const handleOpenStudent = async (student) => {
        if (!student.surveyCompleted) {
            setSelectedStudent(student);
            return;
        }

        try {
            setModalError("");
            const detail = await requestAdminStudentDetail(student.userId);
            setSelectedStudent({
                ...student,
                ...detail,
                surveyCompleted: student.surveyCompleted,
            });
        } catch (e) {
            setSelectedStudent(student);
            setModalError(
                e.response?.data?.message ||
                    e.response?.data?.error ||
                    "학생 상세 정보를 불러오지 못했습니다."
            );
        }
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

                {error && <p className={styles.errorText}>{error}</p>}

                {isLoading ? (
                    <p className={styles.emptyText}>
                        학생 정보를 불러오는 중입니다.
                    </p>
                ) : filteredStudents.length === 0 ? (
                    <p className={styles.emptyText}>
                        표시할 학생이 없습니다. 팀 생성 승인 후 학생 목록이
                        표시됩니다.
                    </p>
                ) : (
                    <section className={styles.studentGrid}>
                        {filteredStudents.map((student) => {
                            const numberInfo = getStudentNumberInfo(
                                student.userId
                            );
                            const visibleSkills = Array.isArray(student.skill)
                                ? student.skill.slice(0, 4)
                                : [];

                            return (
                                <button
                                    key={student.userId}
                                    type="button"
                                    className={styles.studentCard}
                                    onClick={() => handleOpenStudent(student)}
                                >
                                    <div className={styles.cardHeader}>
                                        <div>
                                            <strong>{student.name}</strong>
                                            <p>{numberInfo.classText}</p>
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
                                        <strong>
                                            {student.teamName || "미배정"}
                                        </strong>
                                    </div>

                                    <div className={styles.cardSkillList}>
                                        {visibleSkills.length > 0 ? (
                                            visibleSkills.map((skill) => (
                                                <span key={skill}>{skill}</span>
                                            ))
                                        ) : (
                                            <span>기술 정보 없음</span>
                                        )}
                                    </div>

                                    <p className={styles.cardHint}>
                                        {student.surveyCompleted
                                            ? "클릭하여 상세 정보 확인"
                                            : "설문이 미완료입니다"}
                                    </p>
                                </button>
                            );
                        })}
                    </section>
                )}
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
                            <div className={styles.meta}>
                                <h2 id="student-modal-title">
                                    {selectedStudent.name}
                                </h2>
                                <span>
                                    {levelLabels[
                                        selectedStudent.studentLevel
                                    ] ||
                                        selectedStudent.studentLevel ||
                                        "분석 전"}
                                </span>
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

                        {modalError && (
                            <p className={styles.errorText}>{modalError}</p>
                        )}

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
                                            {
                                                getStudentNumberInfo(
                                                    selectedStudent.userId
                                                ).classText
                                            }
                                        </strong>
                                    </article>
                                    <article>
                                        <span>희망 직군</span>
                                        <strong>
                                            {roleLabels[
                                                selectedStudent.studentRole
                                            ] || selectedStudent.studentRole}
                                        </strong>
                                    </article>

                                    <article>
                                        <span>소속 팀</span>
                                        <strong>
                                            {selectedStudent.teamName ||
                                                "미배정"}
                                        </strong>
                                    </article>
                                    <article>
                                        <span>팀장 선호</span>
                                        <strong>
                                            {selectedStudent.wantsLeader
                                                ? "O"
                                                : "X"}
                                        </strong>
                                    </article>
                                </div>

                                <div className={styles.detailSection}>
                                    <h3>기술 스택</h3>
                                    <div className={styles.modalStackList}>
                                        {(selectedStudent.skill || []).map(
                                            (stack) => (
                                                <span key={stack}>{stack}</span>
                                            )
                                        )}
                                    </div>
                                </div>

                                <div className={styles.detailSection}>
                                    <h3>선호 팀원</h3>
                                    <div className={styles.modalStackList}>
                                        {(
                                            selectedStudent.preferredTeammates ||
                                            []
                                        ).length > 0 ? (
                                            selectedStudent.preferredTeammates.map(
                                                (member) => (
                                                    <span key={member}>
                                                        {member}
                                                    </span>
                                                )
                                            )
                                        ) : (
                                            <span>없음</span>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.detailSection}>
                                    <h3>구현해본 기능</h3>
                                    <ul className={styles.experienceList}>
                                        {(selectedStudent.experience || []).map(
                                            (experience) => (
                                                <li key={experience}>
                                                    {experience}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </div>

                                {selectedStudent.analysisResult && (
                                    <div className={styles.detailSection}>
                                        <h3>학생 분석 결과</h3>
                                        <ul className={styles.experienceList}>
                                            <li>
                                                {selectedStudent.analysisResult}
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
};

export default AdminStudentManage;
