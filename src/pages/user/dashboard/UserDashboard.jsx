import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../components/common/header/Header";
import ChatIcon from "../../../assets/icons/chat.svg";
import CapstonLogIcon from "../../../assets/icons/capstonLog.svg";
import NoticeIcon from "../../../assets/icons/notice.svg";
import ProjectIcon from "../../../assets/icons/project.svg";
import { requestUserDashboard } from "../../../api/dashboardApi";
import { subscribeNoticeCreated } from "../../../api/noticeSocket";
import authStore from "../../../store/authStore";
import styles from "./UserDashboard.module.css";

const UserDashboard = () => {
    const accessToken = authStore((state) => state.accessToken);
    const [dashboard, setDashboard] = useState({
        teamCreated: false,
        teamChatActiveStudentCount: 0,
        capstoneTime: false,
        todayJournalSubmitted: false,
        hasUnreadNotice: false,
    });
    const [error, setError] = useState("");

    useEffect(() => {
        const getDashboard = async () => {
            try {
                const data = await requestUserDashboard();
                setDashboard((prevDashboard) => ({
                    ...prevDashboard,
                    ...data,
                }));
            } catch {
                setError("대시보드 정보를 불러오지 못했습니다.");
            }
        };

        getDashboard();
    }, []);

    useEffect(() => {
        if (!accessToken) return undefined;

        return subscribeNoticeCreated(accessToken, () => {
            setDashboard((prevDashboard) => ({
                ...prevDashboard,
                hasUnreadNotice: true,
            }));
        });
    }, [accessToken]);

    const featurePath = (path) =>
        dashboard.teamCreated ? path : "/user/dashboard";
    const chatStatusText = dashboard.teamCreated ? "" : "팀 생성 전입니다";
    const logStatusText = !dashboard.teamCreated
        ? "팀 생성 전입니다"
        : dashboard.capstoneTime && !dashboard.todayJournalSubmitted
        ? "오늘 일지 미제출"
        : "";

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.body}>
                {error && <p className={styles.errorText}>{error}</p>}

                <section className={styles.dashboard}>
                    <Link
                        to={featurePath("/user/chat")}
                        className={styles.card}
                    >
                        <div className={styles.iconBox}>
                            <img src={ChatIcon} alt="" />
                        </div>

                        <div className={styles.cardText}>
                            <h1 className={styles.cardTitle}>팀 채팅</h1>
                            {chatStatusText && (
                                <p className={styles.statusText}>
                                    {chatStatusText}
                                </p>
                            )}
                        </div>
                    </Link>

                    <Link
                        to={featurePath("/user/project")}
                        className={styles.card}
                    >
                        <div className={styles.iconBox}>
                            <img src={ProjectIcon} alt="" />
                        </div>

                        <div className={styles.cardText}>
                            <h2 className={styles.cardTitle}>프로젝트</h2>
                            {!dashboard.teamCreated && (
                                <p className={styles.statusText}>
                                    팀 생성 전입니다
                                </p>
                            )}
                        </div>
                    </Link>

                    <Link to={featurePath("/user/log")} className={styles.card}>
                        <div className={styles.iconBox}>
                            <img src={CapstonLogIcon} alt="" />
                        </div>

                        <div className={styles.cardText}>
                            <h2 className={styles.cardTitle}>캡스톤 일지</h2>
                            {logStatusText && (
                                <p
                                    className={`${styles.statusText} ${
                                        dashboard.teamCreated
                                            ? styles.dangerStatus
                                            : ""
                                    }`}
                                >
                                    {logStatusText}
                                </p>
                            )}
                        </div>
                    </Link>

                    <Link to="/user/notice" className={styles.card}>
                        {dashboard.hasUnreadNotice && (
                            <span className={styles.newBadge}>N</span>
                        )}

                        <div className={styles.iconBox}>
                            <img src={NoticeIcon} alt="" />
                        </div>

                        <div className={styles.cardText}>
                            <h2 className={styles.cardTitle}>공지</h2>
                        </div>
                    </Link>
                </section>
            </main>
        </div>
    );
};

export default UserDashboard;
