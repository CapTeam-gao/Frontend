import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../../components/common/header/Header";
import TeamCreateIcon from "../../../assets/icons/teamCreate.svg";
import TeamIcon from "../../../assets/icons/team.svg";
import ChatIcon from "../../../assets/icons/chat.svg";
import CapstonLogIcon from "../../../assets/icons/capstonLog.svg";
import NoticeIcon from "../../../assets/icons/notice.svg";
import { requestAdminDashboard } from "../../../api/dashboardApi";
import {
    getAdminTeamCreationStatus,
    getNextTeamCreateMessage,
} from "../../../utils/teamStatus";
import styles from "./AdminDashboard.module.css";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState({
        teamCreated: false,
        grade2TeamCreated: false,
        grade3TeamCreated: false,
        totalTeamCount: 0,
        grade2TeamCount: 0,
        grade3TeamCount: 0,
        activeChatRoomCount: 0,
        journalNotSubmittedTeamCount: 0,
        totalStudentCount: 0,
        hasUnreadNotice: false,
    });
    const [isDashboardLoading, setIsDashboardLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const getDashboard = async () => {
            try {
                const data = await requestAdminDashboard();
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

    const teamStatus = getAdminTeamCreationStatus(dashboard);
    const isTeamCreated = teamStatus.allTeamCreated;
    const isDashboardReady = !isDashboardLoading;
    const teamStatusMessage = isDashboardLoading
        ? ""
        : getNextTeamCreateMessage(teamStatus);
    const chatRoomStatusText = isDashboardLoading
        ? ""
        : isTeamCreated
        ? `${dashboard.activeChatRoomCount}개 진행중`
        : "팀 생성 후 이용 가능합니다";
    const logStatusText = isDashboardLoading
        ? ""
        : isTeamCreated
        ? `${dashboard.journalNotSubmittedTeamCount}팀 미제출`
        : "팀 생성 후 이용 가능합니다";

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.body}>
                {error && <p className={styles.errorText}>{error}</p>}

                <section className={styles.dashboard}>
                    <div className={styles.topGrid}>
                        <Link
                            to={
                                isDashboardLoading
                                    ? "/admin/dashboard"
                                    : isTeamCreated
                                    ? "/admin/team-manage"
                                    : "/admin/team-create"
                            }
                            className={`${styles.mainCard} ${
                                isDashboardReady && !isTeamCreated
                                    ? styles.mainCardPending
                                    : ""
                            }`}
                        >
                            <div className={styles.mainContent}>
                                <div className={styles.mainHeader}>
                                    <div>
                                        <h1 className={styles.mainTitle}>
                                            {!isDashboardReady
                                                ? ""
                                                : isTeamCreated
                                                ? "팀 관리"
                                                : "팀을 생성해주세요"}
                                        </h1>
                                        {!isTeamCreated &&
                                            teamStatusMessage && (
                                                <p
                                                    className={
                                                        styles.mainSubText
                                                    }
                                                >
                                                    {teamStatusMessage}
                                                </p>
                                            )}
                                    </div>
                                    <div className={styles.largeIcon}>
                                        <img
                                            src={
                                                isDashboardReady &&
                                                isTeamCreated
                                                    ? TeamIcon
                                                    : TeamCreateIcon
                                            }
                                            alt=""
                                        />
                                    </div>
                                </div>

                                {isDashboardReady && isTeamCreated && (
                                    <>
                                        <strong className={styles.teamCount}>
                                            {dashboard.totalTeamCount}팀
                                        </strong>
                                        <p className={styles.teamMeta}>
                                            2학년: {dashboard.grade2TeamCount}팀
                                            | 3학년: {dashboard.grade3TeamCount}
                                            팀
                                        </p>
                                    </>
                                )}

                                <p className={styles.description}>
                                    {isTeamCreated
                                        ? "팀 별 정보를 조회할 수 있습니다."
                                        : isDashboardReady
                                        ? "2학년과 3학년 팀 생성이 모두 완료되면 팀 관리가 가능합니다."
                                        : ""}
                                </p>
                            </div>
                        </Link>

                        <Link to="/admin/chat" className={styles.sideCard}>
                            <div className={styles.mediumIcon}>
                                <img src={ChatIcon} alt="" />
                            </div>
                            <div className={styles.sideText}>
                                <h2 className={styles.cardTitle}>
                                    팀별 채팅방
                                </h2>
                                {chatRoomStatusText && (
                                    <p className={styles.description}>
                                        {chatRoomStatusText}
                                    </p>
                                )}
                            </div>
                        </Link>
                    </div>

                    <div className={styles.bottomGrid}>
                        <Link to="/admin/log" className={styles.smallCard}>
                            <div className={styles.logText}>
                                <h2 className={styles.cardTitle}>
                                    캡스톤 일지
                                </h2>
                                {logStatusText && (
                                    <p className={styles.statusText}>
                                        {logStatusText}
                                    </p>
                                )}
                            </div>
                            <div className={styles.smallIcon}>
                                <img src={CapstonLogIcon} alt="" />
                            </div>
                        </Link>

                        <Link
                            to="/admin/student"
                            className={`${styles.smallCard} ${styles.studentCard}`}
                        >
                            <div className={styles.smallText}>
                                <h2 className={styles.cardTitle}>학생</h2>
                                {isDashboardReady && (
                                    <span className={styles.countBadge}>
                                        {dashboard.totalStudentCount}명 등록
                                    </span>
                                )}
                            </div>
                            <div className={styles.smallIcon}>
                                <img src={TeamIcon} alt="" />
                            </div>
                        </Link>

                        <article
                            className={`${styles.smallCard} ${styles.noticeCard}`}
                            onClick={() => {
                                navigate("/admin/notice");
                            }}
                        >
                            <div className={styles.smallText}>
                                <h2 className={styles.cardTitle}>공지</h2>
                                <Link
                                    to="/admin/notice/create"
                                    className={styles.quickButton}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    빠른 작성
                                </Link>
                            </div>
                            <div className={styles.smallIcon}>
                                <img src={NoticeIcon} alt="" />
                            </div>
                        </article>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default AdminDashboard;
