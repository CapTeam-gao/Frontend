import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AdminStudentDetailModal from "../../../components/admin/student/AdminStudentDetailModal";
import Header from "../../../components/common/header/Header";
import AppFooter from "../../../components/common/footer/AppFooter";
import Skeleton from "../../../components/common/skeleton/Skeleton";
import useInView from "../../../hooks/useInView";
import {
    requestAdminStudentDetail,
    requestAdminStudentList,
} from "../../../api/studentApi";
import { levelLabels, roleLabels, summaryFilters } from "../../../constants/student";
import {
    getStudentNumberInfo,
    getStudentSearchText,
    normalizeSearchText,
} from "../../../utils/student";
import { getApiErrorMessage } from "../../../utils/apiError";
import { isSurveyCompleted } from "../../../utils/survey";
import studentTitleImage from "../../../assets/images/adminStudentTitleV3.webp";
import studentEmptyImage from "../../../assets/images/adminStudentEmptyV3.webp";
import styles from "./AdminStudentManage.module.css";

const ListSkeleton = () => (
    <div className={styles.grid}>
        {[0, 1, 2].map((index) => (
            <div key={index} className={styles.skeletonTile}>
                <Skeleton width={160} height={24} />
                <Skeleton width={288} height={20} style={{ marginTop: 12 }} />
            </div>
        ))}
    </div>
);

const roleColors = {
    FRONTEND: "#4c9be8", BACKEND: "#f07c5c", AI: "#8b7cf6", APP: "#e8a04a",
    DESIGN: "#e86fa6", GAME: "#f29a3a", DEVOPS: "#2bb3a8", SECURITY: "#6573c3", FULLSTACK: "#22b573",
};

const AdminStudentManage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
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
    const [detailLoading, setDetailLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const targetUserId = searchParams.get("userId");
    const openedQueryUserIdRef = useRef(null);
    const detailRequestRef = useRef(0);

    const loadStudents = useCallback(async () => {
            try {
                setIsLoading(true);
                setError("");
                const data = await requestAdminStudentList();
                setStudents(
                    (Array.isArray(data.students) ? data.students : []).map(
                        (student) => ({
                            ...student,
                            surveyCompleted: isSurveyCompleted(student.surveyCompleted),
                        })
                    )
                );
                setSummaryCounts({
                    all: data.totalStudentCount || 0,
                    grade2: data.grade2StudentCount || 0,
                    grade3: data.grade3StudentCount || 0,
                    surveyPending: data.surveyNotSubmittedCount || 0,
                });
            } catch (e) {
                setError(
                    getApiErrorMessage(e, "학생 정보를 불러오지 못했습니다.")
                );
            } finally {
                setIsLoading(false);
            }
    }, []);

    useEffect(() => { loadStudents(); }, [loadStudents]);

    useEffect(() => {
        if (isLoading || !targetUserId || selectedStudent) return;
        if (openedQueryUserIdRef.current === targetUserId) return;

        const targetStudent = students.find(
            (student) => student.userId === targetUserId
        );

        if (!targetStudent) return;

        openedQueryUserIdRef.current = targetUserId;
        handleOpenStudent(targetStudent);
    }, [isLoading, selectedStudent, students, targetUserId]);

    useEffect(() => {
        if (targetUserId) return;

        openedQueryUserIdRef.current = null;
    }, [targetUserId]);

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
                    !isSurveyCompleted(student.surveyCompleted));

            return matchesKeyword && matchesSummary;
        });
    }, [activeSummaryFilter, searchKeyword, students]);

    // 필터·검색이 바뀔 때마다 진입 모션을 다시 재생
    const listRef = useInView({
        replayKey: `${isLoading}-${activeSummaryFilter}-${searchKeyword}`,
    });

    const handleOpenStudent = async (student) => {
        const requestId = ++detailRequestRef.current;
        setModalError("");
        setSelectedStudent(student);
        setDetailLoading(false);
        if (!isSurveyCompleted(student.surveyCompleted)) {
            return;
        }

        try {
            setDetailLoading(true);
            const detail = await requestAdminStudentDetail(student.userId);
            if (detailRequestRef.current !== requestId) return;
            setSelectedStudent({
                ...student,
                ...detail,
                surveyCompleted: student.surveyCompleted,
            });
        } catch (e) {
            if (detailRequestRef.current !== requestId) return;
            setModalError(
                getApiErrorMessage(e, "학생 상세 정보를 불러오지 못했습니다.")
            );
        } finally {
            if (detailRequestRef.current === requestId) setDetailLoading(false);
        }
    };

    const retryStudentDetail = () => {
        if (selectedStudent) handleOpenStudent(selectedStudent);
    };

    const handleCloseStudentModal = () => {
        detailRequestRef.current += 1;
        if (targetUserId) {
            const nextSearchParams = new URLSearchParams(searchParams);
            nextSearchParams.delete("userId");
            setSearchParams(nextSearchParams, { replace: true });
        }

        setSelectedStudent(null);
    };

    const resetFilters = () => {
        setSearchKeyword("");
        setActiveSummaryFilter("all");
    };

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.body}>
                <section className={styles.pageHead}>
                    <div className={styles.titleWrap}>
                        <img
                            className={styles.titleImage}
                            src={studentTitleImage}
                            alt=""
                            aria-hidden="true"
                        />
                        <div className={styles.titleBlock}>
                        <div className={styles.titleLine}>
                            <h1 className={styles.headline}>학생 관리</h1>
                            {!isLoading && summaryCounts.all > 0 && (
                                <span className={styles.totalCount}>
                                    전체 {summaryCounts.all}명
                                </span>
                            )}
                        </div>
                        <p className={styles.lead}>
                            학생 정보와 설문 응답을 확인하고 관리해요
                        </p>
                        </div>
                    </div>

                    {!isLoading && summaryCounts.all > 0 && (
                        <p className={styles.surveyStatus}>
                            <span aria-hidden="true" />
                            설문 미제출
                            <strong>{summaryCounts.surveyPending}명</strong>
                        </p>
                    )}
                </section>

                <div className={styles.controls}>
                    <div className={styles.segments}>
                        {summaryFilters.map((filter) => (
                            <button
                                key={filter.key}
                                type="button"
                                className={`${styles.segment} ${
                                    activeSummaryFilter === filter.key
                                        ? styles.segmentOn
                                        : ""
                                }`}
                                onClick={() =>
                                    setActiveSummaryFilter(filter.key)
                                }
                                aria-pressed={activeSummaryFilter === filter.key}
                            >
                                {filter.label}
                                <span
                                    className={`${styles.segmentCount} ${
                                        filter.key === "surveyPending"
                                            ? styles.segmentCountDanger
                                            : ""
                                    }`}
                                >
                                    {summaryCounts[filter.key]}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className={styles.searchBox}>
                        <svg
                            className={styles.searchIcon}
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.9"
                            strokeLinecap="round"
                            aria-hidden="true"
                        >
                            <circle cx="11" cy="11" r="7" />
                            <path d="m20 20-3.5-3.5" />
                        </svg>
                        <input
                            type="text"
                            className={styles.search}
                            value={searchKeyword}
                            placeholder="이름, 학번, 희망 직군 검색"
                            onChange={(event) =>
                                setSearchKeyword(event.target.value)
                            }
                        />
                    </div>
                </div>

                {!isLoading && !error && summaryCounts.all > 0 && (
                    <div className={styles.listMeta}>
                        <p><strong>{filteredStudents.length}</strong>명</p>
                        <p className={styles.legend}>
                            <span><span className={styles.legendMeter}><i className={styles.levelOn} /><i className={styles.levelOn} /><i className={styles.levelOn} /><i /><i /></span>실력</span>
                            <span><span className={styles.legendPending}>설문 미제출</span></span>
                        </p>
                    </div>
                )}

                {isLoading ? (
                    <ListSkeleton />
                ) : error ? (
                    <div className={styles.emptyState}>
                        <h2>학생 정보를 불러오지 못했어요</h2>
                        <p>{error}</p>
                        <button type="button" className={styles.resetButton} onClick={loadStudents}>다시 시도</button>
                    </div>
                ) : summaryCounts.all === 0 && !searchKeyword && activeSummaryFilter === "all" ? (
                    <div className={styles.emptyState}>
                        <img src={studentEmptyImage} alt="" aria-hidden="true" />
                        <h2>아직 등록된 학생이 없어요</h2>
                        <p>학생이 가입하면 여기에 표시돼요.</p>
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <div className={styles.emptyState}>
                        <img src={studentEmptyImage} alt="" aria-hidden="true" />
                        <h2>조건에 맞는 학생이 없어요</h2>
                        <p>검색어나 필터를 바꾸면 학생을 다시 확인할 수 있어요.</p>
                        <button
                            type="button"
                            className={styles.resetButton}
                            onClick={resetFilters}
                        >
                            필터 초기화
                        </button>
                    </div>
                ) : (
                    <div className={styles.grid} ref={listRef}>
                        {filteredStudents.map((student, index) => {
                            const numberInfo = getStudentNumberInfo(
                                student.userId
                            );
                            const levelLabel = levelLabels[student.studentLevel];
                            const levelValue = { UPPER: 5, UPPER_MIDDLE: 4, MIDDLE: 3, LOWER_MIDDLE: 2, LOWER: 1 }[student.studentLevel] || 0;
                            const roleLabel = roleLabels[student.studentRole];
                            const teamName = student.projectTeamName || student.teamName || "미배정";

                            return (
                                <button
                                    key={student.userId}
                                    type="button"
                                    data-reveal
                                    className={styles.tile}
                                    style={{ "--tile-index": Math.min(index, 12) }}
                                    onClick={() => handleOpenStudent(student)}
                                >
                                    <span className={styles.tileTop}>
                                        <span className={`${styles.tileRole} ${roleLabel ? "" : styles.tileRoleMuted}`} style={{ "--role-color": roleColors[student.studentRole] || "#c9d1cd" }}>
                                            {roleLabel || "희망 직군 미입력"}
                                        </span>
                                        {student.leaderRole === "LEADER" && <span className={styles.tileLeader}>팀장</span>}
                                    </span>
                                    <span className={styles.tileWho}>
                                        <strong className={styles.tileName}>{student.name}</strong>
                                        <span className={styles.tileClass}>{numberInfo.classText}</span>
                                    </span>
                                    <span className={`${styles.tileSkills} ${!student.surveyCompleted ? styles.tileSkillsWait : ""}`}>
                                        {student.surveyCompleted ? (student.skill?.length ? student.skill.join(" · ") : "기술 스택 미입력") : "설문 응답을 기다리고 있어요"}
                                    </span>
                                    <span className={styles.tileFoot}>
                                        {student.surveyCompleted ? <>
                                            {levelLabel && <span className={styles.tileLevel} aria-label={`실력 ${levelLabel}`}>
                                                <span className={styles.levelMeter} aria-hidden="true">{[1, 2, 3, 4, 5].map((step) => <i key={step} className={step <= levelValue ? styles.levelOn : ""} />)}</span>
                                                실력 <b>{levelLabel}</b>
                                            </span>}
                                            <span className={styles.tileTeam}>팀 {teamName}</span>
                                        </> : <span className={styles.pendingBadge}>설문 미제출</span>}
                                        <span className={styles.chevron} aria-hidden="true">→</span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </main>

            <AppFooter role="admin" />

            {selectedStudent && (
                <AdminStudentDetailModal
                    student={selectedStudent}
                    students={students}
                    modalError={modalError}
                    detailLoading={detailLoading}
                    onRetry={retryStudentDetail}
                    onOpenStudent={handleOpenStudent}
                    onClose={handleCloseStudentModal}
                />
            )}
        </div>
    );
};

export default AdminStudentManage;
