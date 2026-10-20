// 일지 작성 대기 화면. 왼쪽 안내 + 주간 일정, 오른쪽 큰 타이머.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../components/common/header/Header";
import useInView from "../../../hooks/useInView";
import LogCountdown from "../../../components/user/log/LogCountdown";
import {
    formatCapstoneLogDateTime,
    getCapstoneLogRemainingMs,
    getNextCapstoneLogWindow,
    getNextCapstoneLogStartRemainingMs,
    isCapstoneLogTime,
} from "../../../utils/capstoneLogTime";
import styles from "./UserLogCountdown.module.css";
import logWriteIcon from "../../../assets/images/logWriteV3.webp";
import logWaitIcon from "../../../assets/images/logWaitV3.webp";

const WEEK_DAYS = ["월", "화", "수", "목", "금"];

const UserLogCountdown = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const contentRef = useInView();

    useEffect(() => {
        const timerId = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timerId);
    }, []);

    const canWriteLog = isCapstoneLogTime(currentTime);
    const nextWindow = getNextCapstoneLogWindow(currentTime);
    const remainingMs = canWriteLog
        ? getCapstoneLogRemainingMs(currentTime)
        : getNextCapstoneLogStartRemainingMs(currentTime);

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.body} ref={contentRef}>
                <div className={styles.inner}>
                    <section className={styles.copy}>
                        <img
                            data-reveal
                            className={styles.heroIcon}
                            src={canWriteLog ? logWriteIcon : logWaitIcon}
                            alt=""
                        />
                        <p data-reveal className={styles.eyebrow}>
                            캡스톤 일지
                        </p>

                        {canWriteLog ? (
                            <>
                                <h1 data-reveal className={styles.headline}>
                                    지금 일지를
                                    <br />
                                    작성할 수 있어요
                                </h1>
                                <p data-reveal className={styles.subline}>
                                    오늘 활동 내용을 남기면
                                    <br />
                                    팀원 일지와 함께 자동으로 취합돼요.
                                </p>
                            </>
                        ) : (
                            <>
                                <h1 data-reveal className={styles.headline}>
                                    지금은 일지를
                                    <br />
                                    작성할 시간이 아니에요
                                </h1>
                                <p data-reveal className={styles.subline}>
                                    캡스톤 일지는 매주{" "}
                                    <b>수요일 15:40 ~ 18:10</b>에만
                                    <br />
                                    작성할 수 있어요.
                                </p>
                            </>
                        )}

                        <ol data-reveal className={styles.week} aria-label="일지 작성 요일">
                            {WEEK_DAYS.map((day) => (
                                <li
                                    key={day}
                                    className={day === "수" ? styles.weekOn : ""}
                                >
                                    <span>{day}</span>
                                    {day === "수" && <b>15:40–18:10</b>}
                                </li>
                            ))}
                        </ol>

                        <div data-reveal className={styles.actions}>
                            <Link
                                to={
                                    canWriteLog
                                        ? "/user/log/write"
                                        : "/user/log/result"
                                }
                                className={styles.primaryButton}
                            >
                                {canWriteLog ? "일지 작성하기" : "지난 일지 보기"}
                            </Link>
                            <Link
                                to="/user/dashboard"
                                className={styles.ghostButton}
                            >
                                홈으로
                            </Link>
                        </div>
                    </section>

                    <section data-reveal className={styles.timerPanel}>
                        <p
                            className={`${styles.timerState} ${
                                canWriteLog ? styles.timerStateOpen : ""
                            }`}
                        >
                            {canWriteLog ? "지금 작성 가능" : "작성 시간 아님"}
                        </p>
                        <p className={styles.timerLabel}>
                            {canWriteLog
                                ? "작성 마감까지"
                                : "다음 작성 시작까지"}
                        </p>
                        <LogCountdown milliseconds={remainingMs} />
                        <p className={styles.timerNote}>
                            <span>
                                {canWriteLog ? "마감" : "다음 작성"}
                            </span>
                            <b>
                                {canWriteLog
                                    ? "오늘 18:10"
                                    : `${formatCapstoneLogDateTime(
                                          nextWindow.startAt
                                      )} – ${nextWindow.endAt
                                          .toTimeString()
                                          .slice(0, 5)}`}
                            </b>
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default UserLogCountdown;
