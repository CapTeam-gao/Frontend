import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../../../components/common/header/Header";
import { requestAdminLogDetail } from "../../../api/logApi";
import { formatLogDate, getLogTeamName, isSubmittedLog } from "../../../utils/log";
import styles from "./AdminLogDetail.module.css";
import useDelayedLoading from "../../../hooks/useDelayedLoading";

const getEntryContent = (content) => {
    return content || "작성된 내용이 없습니다.";
};

const AdminLogDetail = () => {
    const { id } = useParams();
    const [log, setLog] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const showLoading = useDelayedLoading(isLoading);

    useEffect(() => {
        const getAdminLogDetail = async () => {
            try {
                setIsLoading(true);

                const data = await requestAdminLogDetail(id);

                setLog(data);
                setError("");
            } catch {
                setError("캡스톤 일지 상세 정보를 불러오지 못했습니다.");
            } finally {
                setIsLoading(false);
            }
        };

        getAdminLogDetail();
    }, [id]);

    const memberNames = log?.teamMemberNames ?? [];
    const entries = log?.entries ?? [];
    const submitted = isSubmittedLog(log);
    const teamName = getLogTeamName(log);

    if (isLoading) {
        return (
            <div className={styles.page}>
                <Header />

                <main className={styles.body}>
                    <Link to="/admin/log" className={styles.backLink}>
                        ← 목록으로
                    </Link>

                    <section className={styles.emptyBox}>
                        {showLoading && <h1>일지를 불러오는 중입니다.</h1>}
                    </section>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.page}>
                <Header />

                <main className={styles.body}>
                    <Link to="/admin/log" className={styles.backLink}>
                        ← 목록으로
                    </Link>

                    <section className={styles.emptyBox}>
                        <h1>{error}</h1>
                        <p>잠시 후 다시 시도해주세요.</p>
                    </section>
                </main>
            </div>
        );
    }

    if (!log) {
        return (
            <div className={styles.page}>
                <Header />

                <main className={styles.body}>
                    <Link to="/admin/log" className={styles.backLink}>
                        ← 목록으로
                    </Link>

                    <section className={styles.emptyBox}>
                        <h1>일지를 찾을 수 없습니다.</h1>
                        <p>목록에서 다시 확인해주세요.</p>
                    </section>
                </main>
            </div>
        );
    }

    if (!submitted) {
        return (
            <div className={styles.page}>
                <Header />

                <main className={styles.body}>
                    <Link to="/admin/log" className={styles.backLink}>
                        ← 목록으로
                    </Link>

                    <section className={styles.emptyBox}>
                        <h1>{teamName}</h1>
                        <p>일지 작성이 완료되지 않았습니다.</p>
                    </section>
                </main>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.body}>
                <Link to="/admin/log" className={styles.backLink}>
                    ← 목록으로
                </Link>

                <article className={styles.detailCard}>
                    <header className={styles.detailHeader}>
                        <div className={styles.headerMain}>
                            <div className={styles.titleGroup}>
                                <h1>{teamName}</h1>
                                <span className={styles.statusBadge}>
                                    제출완료
                                </span>
                            </div>
                            <p>
                                팀별 캡스톤 진행 상황과 다음 작업 계획을 확인하는
                                상세 일지입니다.
                            </p>
                        </div>

                        <div className={styles.headerMeta}>
                            <div>
                                <span>제출 인원</span>
                                <strong>
                                    {entries.length}/{memberNames.length}명
                                </strong>
                            </div>
                            <div>
                                <span>작성일</span>
                                <time>{formatLogDate(log.date)}</time>
                            </div>
                        </div>
                    </header>

                    <section className={styles.memberPanel}>
                        <div>
                            <span>팀원</span>
                            <strong>{memberNames.length}명</strong>
                        </div>
                        <ul>
                            {memberNames.map((member) => (
                                <li key={member}>{member}</li>
                            ))}
                        </ul>
                    </section>

                    <section className={styles.sectionBlock}>
                        <div className={styles.sectionHeader}>
                            <span>01</span>
                            <h2>팀원별 활동 내용</h2>
                        </div>
                        <div className={styles.entryList}>
                            {entries.map((entry) => (
                                <div
                                    key={entry.entryId}
                                    className={styles.entryBox}
                                >
                                    <strong>{entry.writerName}</strong>
                                    <p>
                                        {getEntryContent(
                                            entry.activityContent
                                        )}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className={styles.sectionBlock}>
                        <div className={styles.sectionHeader}>
                            <span>02</span>
                            <h2>오늘 방과후 프로젝트 진행 상황</h2>
                        </div>
                        <div className={styles.summaryBox}>
                            <p>{getEntryContent(log.todayActivityContent)}</p>
                        </div>
                    </section>

                    <section className={styles.sectionBlock}>
                        <div className={styles.sectionHeader}>
                            <span>03</span>
                            <h2>다음 캡스톤 시간까지 팀원별 진행할 내용</h2>
                        </div>
                        <div className={styles.entryList}>
                            {entries.map((entry) => (
                                <div
                                    key={`next-${entry.entryId}`}
                                    className={styles.entryBox}
                                >
                                    <strong>{entry.writerName}</strong>
                                    <p>
                                        {getEntryContent(
                                            entry.nextPlanContent
                                        )}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className={styles.sectionBlock}>
                        <div className={styles.sectionHeader}>
                            <span>04</span>
                            <h2>오늘 프로젝트 수행 만족도 및 자기 반성</h2>
                        </div>
                        <div className={styles.entryList}>
                            {entries.map((entry) => (
                                <div
                                    key={`reflection-${entry.entryId}`}
                                    className={styles.entryBox}
                                >
                                    <strong>{entry.writerName}</strong>
                                    <p>
                                        {getEntryContent(
                                            entry.reflectionContent
                                        )}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                </article>
            </main>
        </div>
    );
};

export default AdminLogDetail;
