import { useEffect, useState } from "react";
import Header from "../../../components/common/header/Header";
import { requestUserLogDetail, requestUserLogList } from "../../../api/logApi";
import useDelayedLoading from "../../../hooks/useDelayedLoading";
import { getLogTeamName } from "../../../utils/log";
import styles from "./UserLogResult.module.css";

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

const formatLogResultDate = (date) => {
    if (!date) return "";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return date;

    return `${parsed.getMonth() + 1}월 ${parsed.getDate()}일(${
        DAY_LABELS[parsed.getDay()]
    })`;
};

const UserLogResult = () => {
    const [journalDetail, setJournalDetail] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const showLoading = useDelayedLoading(isLoading);

    useEffect(() => {
        const getCompletedJournal = async () => {
            try {
                const journals = await requestUserLogList();

                const completedJournals = journals
                    .filter((journal) => journal.status === "COMPLETED")
                    .sort(
                        (a, b) =>
                            new Date(b.date).getTime() -
                            new Date(a.date).getTime()
                    );

                if (completedJournals.length === 0) {
                    setError("아직 완료된 캡스톤 일지가 없습니다.");
                    return;
                }

                const latestJournal = completedJournals[0];

                const detail = await requestUserLogDetail(
                    latestJournal.journalId
                );

                setJournalDetail(detail);
            } catch {
                setError("캡스톤 일지 조회에 실패했습니다.");
            } finally {
                setIsLoading(false);
            }
        };

        getCompletedJournal();
    }, []);

    if (isLoading) {
        return (
            <div className={styles.page}>
                <Header />
                <main className={styles.content}>
                    <p className={styles.message}>
                        {showLoading && "캡스톤 일지를 불러오는 중입니다."}
                    </p>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.page}>
                <Header />
                <main className={styles.content}>
                    <p className={styles.errorText}>{error}</p>
                </main>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.content}>
                <section className={styles.pageHead}>
                    <div className={styles.pageTitle}>
                        {getLogTeamName(journalDetail)} 캡스톤 일지
                    </div>
                    <div className={styles.pageMeta}>
                        <span className={styles.pageStatus}>
                            제출 완료 · {journalDetail.entries?.length ?? 0}/
                            {journalDetail.entries?.length ?? 0}명
                        </span>
                        <span className={styles.pageDate}>
                            {formatLogResultDate(journalDetail.date)}
                        </span>
                    </div>
                </section>

                {journalDetail.todayActivityContent && (
                    <section className={styles.section}>
                        <div className={styles.sectionTitle}>
                            <span className={styles.sectionIndex}>01</span>
                            오늘 방과후 프로젝트 진행 상황
                        </div>
                        <p className={styles.sectionBody}>
                            {journalDetail.todayActivityContent}
                        </p>
                    </section>
                )}

                <section className={styles.section}>
                    <div className={styles.sectionTitle}>
                        <span className={styles.sectionIndex}>
                            {journalDetail.todayActivityContent ? "02" : "01"}
                        </span>
                        팀원별 활동 내용
                    </div>

                    <div className={styles.entryGrid}>
                        {journalDetail.entries?.map((entry) => (
                            <article
                                key={entry.entryId}
                                className={styles.entry}
                            >
                                <div className={styles.entryName}>
                                    {entry.writerName}
                                </div>

                                <div className={styles.entryBlock}>
                                    <div className={styles.entryLabel}>
                                        활동 내용
                                    </div>
                                    <p className={styles.entryText}>
                                        {entry.activityContent}
                                    </p>
                                </div>

                                <div className={styles.entryBlock}>
                                    <div className={styles.entryLabel}>
                                        다음 계획
                                    </div>
                                    <p className={styles.entryText}>
                                        {entry.nextPlanContent}
                                    </p>
                                </div>

                                <div className={styles.entryBlock}>
                                    <div className={styles.entryLabel}>
                                        자기 반성
                                    </div>
                                    <p className={styles.entryText}>
                                        {entry.reflectionContent}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default UserLogResult;
