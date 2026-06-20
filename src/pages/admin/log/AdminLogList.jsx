import { useMemo, useState, useEffect } from "react";
import Header from "../../../components/common/header/Header";
import AdminLogItem from "../../../components/admin/log/AdminLogItem";
import styles from "./AdminLogList.module.css";
import logIcon from "../../../assets/icons/capstonLog.svg";
import { requestAdminLogList } from "../../../api/logApi";
import { LOG_GRADE_OPTIONS, matchesLogStatus } from "../../../utils/log";
import useDelayedLoading from "../../../hooks/useDelayedLoading";

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

    const logs = logData?.journals ?? [];
    const summary = useMemo(() => {
        return {
            all: logData?.totalCount ?? 0,
            submitted: logData?.submittedCount ?? 0,
            pending: logData?.notSubmittedCount ?? 0,
        };
    }, [logData]);

    const filteredLogs = useMemo(() => {
        const keyword = searchKeyword.trim().toLowerCase();

        return logs.filter((log) => {
            const matchesGrade = log.grade === activeGrade;
            const matchesKeyword =
                !keyword ||
                `${log.teamName} ${log.serviceName} ${log.date}`
                    .toLowerCase()
                    .includes(keyword);
            const matchesStatus = matchesLogStatus(log, activeStatus);

            return matchesGrade && matchesKeyword && matchesStatus;
        });
    }, [activeGrade, searchKeyword, activeStatus, logs]);

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
                        const count = summary[card.key] ?? 0;
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
                        {LOG_GRADE_OPTIONS.map((grade) => (
                            <button
                                key={grade.value}
                                type="button"
                                className={
                                    activeGrade === grade.value
                                        ? styles.selected
                                        : ""
                                }
                                onClick={() => setActiveGrade(grade.value)}
                            >
                                {grade.label}
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
                    {isLoading && showLoading && (
                        <div className={styles.messageBox}>
                            캡스톤 일지 목록을 불러오는 중입니다.
                        </div>
                    )}

                    {!isLoading && error && (
                        <div className={styles.messageBox}>{error}</div>
                    )}

                    {!isLoading &&
                        !error &&
                        filteredLogs.map((log) => (
                            <AdminLogItem key={log.journalId} log={log} />
                        ))}

                    {!isLoading && !error && filteredLogs.length === 0 && (
                        <div className={styles.messageBox}>
                            작성된 일지가 없습니다.
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default AdminLogList;
