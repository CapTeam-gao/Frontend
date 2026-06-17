import { useMemo, useState } from "react";
import Header from "../../../components/common/header/Header";
import AdminLogItem from "../../../components/admin/log/AdminLogItem";
import styles from "./AdminLogList.module.css";
import logIcon from "../../../assets/icons/capstonLog.svg";

const summaryCards = [
    {
        key: "all",
        label: "전체 일지",
        iconType: "log",
    },
    {
        key: "submitted",
        label: "제출 일지",
    },
    {
        key: "pending",
        label: "미제출 일지",
    },
];

const dummyLogs = [
    {
        id: 1,
        teamName: "팀 Gao",
        grade: "2학년",
        projectName: "CapTeam - AI 기반 캡스톤 팀 관리 서비스",
        date: "2026.04.22",
        status: "submitted",
        submittedCount: 5,
        totalCount: 5,
    },
    {
        id: 2,
        teamName: "팀 Linker",
        grade: "2학년",
        projectName: "학생 프로젝트 일정 관리 서비스",
        date: "2026.04.22",
        status: "pending",
        submittedCount: 0,
        totalCount: 5,
    },
    {
        id: 3,
        teamName: "팀 Orbit",
        grade: "2학년",
        projectName: "교내 공모전 추천 플랫폼",
        date: "2026.04.22",
        status: "submitted",
        submittedCount: 4,
        totalCount: 4,
    },
    {
        id: 4,
        teamName: "팀 Bridge",
        grade: "3학년",
        projectName: "팀 협업 기록 자동 정리 서비스",
        date: "2026.04.22",
        status: "pending",
        submittedCount: 2,
        totalCount: 5,
    },
    {
        id: 5,
        teamName: "팀 Nova",
        grade: "3학년",
        projectName: "AI 기반 진로 포트폴리오 서비스",
        date: "2026.04.22",
        status: "submitted",
        submittedCount: 5,
        totalCount: 5,
    },
];

const AdminLogList = () => {
    const [activeGrade, setActiveGrade] = useState("2학년");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [activeStatus, setActiveStatus] = useState("all");

    const summary = useMemo(() => {
        const total = dummyLogs.length;
        const submitted = dummyLogs.filter(
            (log) => log.status === "submitted"
        ).length;

        return {
            total,
            submitted,
            pending: total - submitted,
        };
    }, []);

    const filteredLogs = useMemo(() => {
        const keyword = searchKeyword.trim().toLowerCase();

        return dummyLogs.filter((log) => {
            const matchesGrade = log.grade === activeGrade;
            const matchesKeyword =
                !keyword ||
                `${log.teamName} ${log.projectName} ${log.date}`
                    .toLowerCase()
                    .includes(keyword);
            const matchesStatus =
                activeStatus === "all" || log.status === activeStatus;
            return matchesGrade && matchesKeyword && matchesStatus;
        });
    }, [activeGrade, searchKeyword, activeStatus]);

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.body}>
                <section className={styles.pageHeader}>
                    <div>
                        <h1>캡스톤 일지 관리</h1>
                        <p>
                            팀별 일지 제출 현황을 확인하고 피드백을 제공합니다.
                        </p>
                    </div>
                </section>

                <section className={styles.summaryGrid}>
                    {summaryCards.map((card) => {
                        const count = summary[card.key] ?? summary.total;
                        const isActive = activeStatus === card.key;

                        return (
                            <button
                                key={card.key}
                                type="button"
                                className={`${styles.summaryCard} ${
                                    styles[card.key]
                                } ${isActive ? styles.active : ""}`}
                                aria-pressed={isActive}
                                onClick={() => setActiveStatus(card.key)}
                            >
                                <div>
                                    <span>{card.label}</span>
                                    <strong>{count}</strong>
                                </div>

                                {card.iconType === "log" && (
                                    <div className={styles.summaryIcon}>
                                        <img src={logIcon} alt="" />
                                    </div>
                                )}
                                {card.iconType === "check" && (
                                    <span className={styles.statusIcon}>
                                        <span className={styles.hiddenText}>
                                            제출 완료
                                        </span>
                                    </span>
                                )}
                                {card.iconType === "close" && (
                                    <span className={styles.mutedIcon}>
                                        <span className={styles.hiddenText}>
                                            미제출
                                        </span>
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </section>

                <section className={styles.controlArea}>
                    <div className={styles.gradeTabs}>
                        {["2학년", "3학년"].map((grade) => (
                            <button
                                key={grade}
                                type="button"
                                className={
                                    activeGrade === grade ? styles.selected : ""
                                }
                                onClick={() => setActiveGrade(grade)}
                            >
                                {grade}
                            </button>
                        ))}
                    </div>

                    <label className={styles.searchBox}>
                        <input
                            type="text"
                            value={searchKeyword}
                            placeholder="팀명 또는 작성날짜를 검색하세요...."
                            onChange={(e) => setSearchKeyword(e.target.value)}
                        />
                        <span>⌕</span>
                    </label>
                </section>

                <section className={styles.logList}>
                    {filteredLogs.map((log) => (
                        <AdminLogItem key={log.id} log={log} />
                    ))}
                </section>
            </main>
        </div>
    );
};

export default AdminLogList;
