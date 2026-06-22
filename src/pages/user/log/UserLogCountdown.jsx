import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../components/common/header/Header";
import {
    formatCountdownTime,
    getCapstoneLogRemainingMs,
    isCapstoneLogTime,
} from "../../../utils/capstoneLogTime";
import styles from "./UserLogCountdown.module.css";

const UserLogCountdown = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timerId);
    }, []);

    const remainingMs = getCapstoneLogRemainingMs(currentTime);
    const countdownText = formatCountdownTime(remainingMs);
    const canWriteLog = isCapstoneLogTime(currentTime);

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.content}>
                <section className={styles.countdownSection}>
                    <h1>
                        {canWriteLog
                            ? "오늘 일지 작성까지"
                            : "현재는 일지 작성 시간이 아닙니다"}
                    </h1>

                    {canWriteLog ? (
                        <div className={styles.timerArea}>
                            <strong>{countdownText}</strong>
                            <span>남았어요</span>
                        </div>
                    ) : (
                        <p className={styles.description}>
                            캡스톤 일지는 매주 수요일 15:40부터 18:10까지 작성할
                            수 있습니다.
                        </p>
                    )}

                    <div className={styles.actionGroup}>
                        <Link
                            to={
                                canWriteLog
                                    ? "/user/log/write"
                                    : "/user/dashboard"
                            }
                            className={`${styles.actionButton} ${
                                !canWriteLog ? styles.secondaryButton : ""
                            }`}
                        >
                            {canWriteLog
                                ? "일지 작성하러 가기"
                                : "대시보드로 돌아가기"}
                        </Link>

                        <Link
                            to="/user/log/result"
                            className={`${styles.actionButton} ${styles.secondaryButton}`}
                        >
                            완료된 일지 확인하기
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default UserLogCountdown;
