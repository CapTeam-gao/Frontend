import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import TeamCreateIcon from "../../assets/icons/teamCreate.svg";
import TeamIcon from "../../assets/icons/team.svg";
import ChatIcon from "../../assets/icons/chat.svg";
import CapstonLogIcon from "../../assets/icons/capstonLog.svg";
import NoticeIcon from "../../assets/icons/notice.svg";
import { requestAdminDashboard } from "../../api/dashboardApi";
import styles from "./AdminDashboard.module.css";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState({
        teamCreated: false,
        totalTeamCount: 0,
        grade2TeamCount: 0,
        grade3TeamCount: 0,
        activeChatRoomCount: 0,
        journalNotSubmittedTeamCount: 0,
        totalStudentCount: 0,
        hasUnreadNotice: false,
    });
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
            }
        };

        getDashboard();
    }, []);

    const isTeamCreated = dashboard.teamCreated;

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.body}>
                {error && <p className={styles.errorText}>{error}</p>}

                <section className={styles.dashboard}>
                    <div className={styles.topGrid}>
                        <Link
                            to={
                                isTeamCreated
                                    ? "/admin/team-manage"
                                    : "/admin/team-create"
                            }
                            className={`${styles.mainCard} ${
                                !isTeamCreated ? styles.mainCardPending : ""
                            }`}
                        >
                            <div className={styles.mainContent}>
                                <div className={styles.mainHeader}>
                                    <h1 className={styles.mainTitle}>
                                        {isTeamCreated
                                            ? "팀 관리"
                                            : "팀을 생성해주세요"}
                                    </h1>
                                    <div className={styles.largeIcon}>
                                        <img
                                            src={
                                                isTeamCreated
                                                    ? TeamIcon
                                                    : TeamCreateIcon
                                            }
                                            alt=""
                                        />
                                    </div>
                                </div>

                                {isTeamCreated && (
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
                                        : "학생 데이터를 분석하여 최적의 팀을 자동으로 생성합니다."}
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
                                <p className={styles.description}>
                                    {isTeamCreated
                                        ? `${dashboard.activeChatRoomCount}개 진행중`
                                        : "팀 생성 후 이용 가능합니다"}
                                </p>
                            </div>
                        </Link>
                    </div>

                    <div className={styles.bottomGrid}>
                        <Link to="/admin/log" className={styles.smallCard}>
                            <div className={styles.logText}>
                                <h2 className={styles.cardTitle}>
                                    캡스톤 일지
                                </h2>
                                <p className={styles.statusText}>
                                    {isTeamCreated
                                        ? `${dashboard.journalNotSubmittedTeamCount}팀 미제출`
                                        : "팀 생성 후 이용 가능합니다"}
                                </p>
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
                                <span className={styles.countBadge}>
                                    {dashboard.totalStudentCount}명 등록
                                </span>
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
