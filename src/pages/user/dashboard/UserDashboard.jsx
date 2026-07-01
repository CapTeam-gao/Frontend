import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../components/common/header/Header";
import TeamRequiredModal from "../../../components/common/TeamRequiredModal";
import ChatIcon from "../../../assets/icons/chat.svg";
import CapstonLogIcon from "../../../assets/icons/capstonLog.svg";
import NoticeIcon from "../../../assets/icons/notice.svg";
import ProjectIcon from "../../../assets/icons/project.svg";
import { requestUserDashboard } from "../../../api/dashboardApi";
import { subscribeNoticeCreated } from "../../../api/noticeSocket";
import { getCapstoneLogStatusText } from "../../../utils/capstoneLogTime";
import authStore from "../../../store/authStore";
import useUnreadChatCount from "../../../hooks/useUnreadChatCount";
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
    const [isDashboardLoading, setIsDashboardLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [error, setError] = useState("");
    const [teamRequiredModal, setTeamRequiredModal] = useState(null);
    const { hasUnreadChat } = useUnreadChatCount({
        enabled: dashboard.teamCreated,
    });

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
            } finally {
                setIsDashboardLoading(false);
            }
        };

        getDashboard();
    }, []);
    useEffect(() => {
        const timerId = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000 * 60);

        return () => clearInterval(timerId);
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
    const blockTeamRequiredCard = (event, message) => {
        if (dashboard.teamCreated) return;

        event.preventDefault();
        setTeamRequiredModal({
            message,
        });
    };
    const chatStatusText =
        !isDashboardLoading && !dashboard.teamCreated
            ? "팀 생성 전입니다"
            : hasUnreadChat
            ? "읽지 않은 채팅이 있습니다"
            : "";
    const projectStatusText =
        !isDashboardLoading && !dashboard.teamCreated ? "팀 생성 전입니다" : "";
    const logStatusText = isDashboardLoading
        ? ""
        : getCapstoneLogStatusText({
              teamCreated: dashboard.teamCreated,
              todayJournalSubmitted: dashboard.todayJournalSubmitted,
              baseDate: currentTime,
          });

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.body}>
                {error && <p className={styles.errorText}>{error}</p>}

                <section className={styles.dashboard}>
                    <Link
                        to={featurePath("/user/chat")}
                        className={styles.card}
                        onClick={(event) =>
                            blockTeamRequiredCard(
                                event,
                                "팀 생성이 완료되면 팀 채팅을 사용할 수 있습니다."
                            )
                        }
                    >
                        {dashboard.teamCreated && hasUnreadChat && (
                            <span
                                className={styles.chatUnreadDot}
                                aria-label="읽지 않은 채팅"
                            />
                        )}

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
                        onClick={(event) =>
                            blockTeamRequiredCard(
                                event,
                                "팀 생성이 완료되면 프로젝트 정보를 작성할 수 있습니다."
                            )
                        }
                    >
                        <div className={styles.iconBox}>
                            <img src={ProjectIcon} alt="" />
                        </div>

                        <div className={styles.cardText}>
                            <h2 className={styles.cardTitle}>프로젝트</h2>
                            {projectStatusText && (
                                <p className={styles.statusText}>
                                    {projectStatusText}
                                </p>
                            )}
                        </div>
                    </Link>

                    <Link
                        to={featurePath("/user/log")}
                        className={styles.card}
                        onClick={(event) =>
                            blockTeamRequiredCard(
                                event,
                                "팀 생성이 완료되면 캡스톤 일지를 작성할 수 있습니다."
                            )
                        }
                    >
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

            {teamRequiredModal && (
                <TeamRequiredModal
                    message={teamRequiredModal.message}
                    onClose={() => setTeamRequiredModal(null)}
                />
            )}
        </div>
    );
};

export default UserDashboard;
