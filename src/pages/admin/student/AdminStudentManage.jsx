import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AdminStudentCard from "../../../components/admin/student/AdminStudentCard";
import AdminStudentDetailModal from "../../../components/admin/student/AdminStudentDetailModal";
import Header from "../../../components/common/header/Header";
import {
    requestAdminStudentDetail,
    requestAdminStudentList,
} from "../../../api/studentApi";
import { summaryFilters } from "../../../constants/student";
import {
    getStudentSearchText,
    normalizeSearchText,
} from "../../../utils/student";
import useDelayedLoading from "../../../hooks/useDelayedLoading";
import styles from "./AdminStudentManage.module.css";

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
    const [isLoading, setIsLoading] = useState(true);
    const showLoading = useDelayedLoading(isLoading);
    const targetUserId = searchParams.get("userId");
    const openedQueryUserIdRef = useRef(null);

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

    const handleCloseStudentModal = () => {
        if (targetUserId) {
            const nextSearchParams = new URLSearchParams(searchParams);
            nextSearchParams.delete("userId");
            setSearchParams(nextSearchParams, { replace: true });
        }

        setSelectedStudent(null);
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
                        {!isLoading && `${filteredStudents.length}명 표시 중`}
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
                            <strong>
                                {!isLoading && summaryCounts[filter.key]}
                            </strong>
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
                        {showLoading && "학생 정보를 불러오는 중입니다."}
                    </p>
                ) : filteredStudents.length === 0 ? (
                    <p className={styles.emptyText}>표시할 학생이 없습니다.</p>
                ) : (
                    <section className={styles.studentGrid}>
                        {filteredStudents.map((student) => (
                            <AdminStudentCard
                                key={student.userId}
                                student={student}
                                onClick={() => handleOpenStudent(student)}
                            />
                        ))}
                    </section>
                )}
            </main>

            {selectedStudent && (
                <AdminStudentDetailModal
                    student={selectedStudent}
                    students={students}
                    modalError={modalError}
                    onOpenStudent={handleOpenStudent}
                    onClose={handleCloseStudentModal}
                />
            )}
        </div>
    );
};

export default AdminStudentManage;
