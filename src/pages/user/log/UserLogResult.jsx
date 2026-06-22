import { useEffect, useState } from "react";
import Header from "../../../components/common/header/Header";
import { requestUserLogDetail, requestUserLogList } from "../../../api/logApi";
import useDelayedLoading from "../../../hooks/useDelayedLoading";
import { getLogTeamName } from "../../../utils/log";
import styles from "./UserLogResult.module.css";

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
                <section className={styles.headerSection}>
                    <p className={styles.eyebrow}>캡스톤 일지 결과</p>
                    <h1>{getLogTeamName(journalDetail)} 캡스톤 일지</h1>
                    <span>{journalDetail.date}</span>
                </section>

                {journalDetail.todayActivityContent && (
                    <section className={styles.section}>
                        <h2>오늘 방과후 프로젝트 진행 상황</h2>
                        <p>{journalDetail.todayActivityContent}</p>
                    </section>
                )}

                <section className={styles.section}>
                    <h2>팀원별 활동 내용</h2>

                    <div className={styles.entryList}>
                        {journalDetail.entries?.map((entry) => (
                            <article
                                key={entry.entryId}
                                className={styles.entryCard}
                            >
                                <h3>{entry.writerName}</h3>

                                <div className={styles.entryBlock}>
                                    <strong>활동 내용</strong>
                                    <p>{entry.activityContent}</p>
                                </div>

                                <div className={styles.entryBlock}>
                                    <strong>다음 계획</strong>
                                    <p>{entry.nextPlanContent}</p>
                                </div>

                                <div className={styles.entryBlock}>
                                    <strong>자기 반성</strong>
                                    <p>{entry.reflectionContent}</p>
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
