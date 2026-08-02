import { useMemo, useState, useEffect } from "react";
import Header from "../../../components/common/header/Header";
import AdminLogItem from "../../../components/admin/log/AdminLogItem";
import styles from "./AdminLogList.module.css";
import { requestAdminLogList } from "../../../api/logApi";
import {
    getLogTeamName,
    LOG_GRADE_OPTIONS,
    matchesLogStatus,
} from "../../../utils/log";
import useDelayedLoading from "../../../hooks/useDelayedLoading";

const summaryCards = [
    { key: "all", label: "전체 일지" },
    { key: "submitted", label: "제출 일지" },
    { key: "pending", label: "미제출 일지" },
];

const AdminLogList = () => {
    const [activeGrade, setActiveGrade] = useState("GRADE_2");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [activeStatus, setActiveStatus] = useState("all");
    const [logData, setLogData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const showLoading = useDelayedLoading(isLoading);

    useEffect(() => {
        const getAdminLogs = async () => {
            try {
                setIsLoading(true);

                const data = await requestAdminLogList();

                setLogData(data);
                setError("");
            } catch {
                setError("캡스톤 일지 목록을 불러오지 못했습니다.");
            } finally {
                setIsLoading(false);
            }
        };

        getAdminLogs();
    }, []);

    const summary = useMemo(() => {
        return {
            all: logData?.totalCount ?? 0,
            submitted: logData?.submittedCount ?? 0,
            pending: logData?.notSubmittedCount ?? 0,
        };
    }, [logData]);

    const filteredLogs = useMemo(() => {
        const logs = logData?.journals ?? [];
        const keyword = searchKeyword.trim().toLowerCase();

        return logs.filter((log) => {
            const matchesGrade = log.grade === activeGrade;
            const matchesKeyword =
                !keyword ||
                `${getLogTeamName(log)} ${log.serviceName} ${log.date}`
                    .toLowerCase()
                    .includes(keyword);
            const matchesStatus = matchesLogStatus(log, activeStatus);

            return matchesGrade && matchesKeyword && matchesStatus;
        });
    }, [activeGrade, searchKeyword, activeStatus, logData]);

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.body}>
                <h1 className={styles.pageTitle}>캡스톤 일지 관리</h1>
                <p className={styles.pageSub}>
                    팀별 일지 제출 현황을 확인합니다.
                </p>

                <div className={styles.summaryRow}>
                    {summaryCards.map((card) => {
                        const count = summary[card.key] ?? 0;
                        const isActive = activeStatus === card.key;

                        return (
                            <button
                                key={card.key}
                                type="button"
                                className={`${styles.summaryItem} ${
                                    isActive ? styles.active : ""
                                }`}
                                aria-pressed={isActive}
                                onClick={() => setActiveStatus(card.key)}
                            >
                                <div className={styles.summaryLabel}>
                                    {card.label}
                                </div>
                                <div
                                    className={`${styles.summaryValue} ${
                                        styles[card.key] ?? ""
                                    }`}
                                >
                                    {count}
                                </div>
                            </button>
                        );
                    })}
                </div>

                <p className={styles.autoNotifyNote}>
                    미제출 팀에게는 마감 30분 전에 자동으로 알림이
                    발송됩니다.
                </p>

                <section className={styles.controlRow}>
                    <div className={styles.gradeTabs}>
                        {LOG_GRADE_OPTIONS.map((grade) => (
                            <button
                                key={grade.value}
                                type="button"
                                className={`${styles.gradeTab} ${
                                    activeGrade === grade.value
                                        ? styles.active
                                        : ""
                                }`}
                                onClick={() => setActiveGrade(grade.value)}
                            >
                                {grade.label}
                            </button>
                        ))}
                    </div>

                    <input
                        type="text"
                        className={styles.search}
                        value={searchKeyword}
                        placeholder="팀명 또는 작성날짜를 검색하세요"
                        onChange={(e) => setSearchKeyword(e.target.value)}
                    />
                </section>

                <section className={styles.logList}>
                    {isLoading && showLoading && (
                        <div className={styles.emptyText}>
                            캡스톤 일지 목록을 불러오는 중입니다.
                        </div>
                    )}

                    {!isLoading && error && (
                        <div className={styles.emptyText}>{error}</div>
                    )}

                    {!isLoading &&
                        !error &&
                        filteredLogs.map((log) => {
                            const logKey =
                                log.journalId ??
                                `${log.teamId}-${log.date}-${log.grade}`;

                            return <AdminLogItem key={logKey} log={log} />;
                        })}

                    {!isLoading && !error && filteredLogs.length === 0 && (
                        <div className={styles.emptyText}>
                            작성된 일지가 없습니다.
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default AdminLogList;
