import { Link } from "react-router-dom";
import Header from "../../components/common/Header";
import TeamCreateIcon from "../../assets/icons/teamCreate.svg";
import TeamIcon from "../../assets/icons/team.svg";
import ChatIcon from "../../assets/icons/chat.svg";
import CapstonLogIcon from "../../assets/icons/capstonLog.svg";
import NoticeIcon from "../../assets/icons/notice.svg";
import styles from "./AdminDashboard.module.css";

const AdminDashboard = () => {
    const isTeamCreated = false;

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.body}>
                <section className={styles.dashboard}>
                    <div className={styles.topGrid}>
                        <article className={styles.mainCard}>
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
                                            17팀
                                        </strong>
                                        <p className={styles.teamMeta}>
                                            2학년: 12팀 | 3학년: 5팀
                                        </p>
                                    </>
                                )}

                                <div className={styles.divider} />

                                <p className={styles.description}>
                                    {isTeamCreated
                                        ? "팀 별 정보를 조회할 수 있습니다."
                                        : "학생 데이터를 분석하여 최적의 팀을 자동으로 생성합니다."}
                                </p>
                            </div>
                        </article>

                        <article className={styles.sideCard}>
                            <div className={styles.mediumIcon}>
                                <img src={ChatIcon} alt="" />
                            </div>
                            <div>
                                <h2 className={styles.cardTitle}>
                                    팀별 채팅방
                                </h2>
                                <p className={styles.description}>
                                    {isTeamCreated
                                        ? "7개 진행중"
                                        : "팀 생성 후 이용 가능합니다"}
                                </p>
                            </div>
                        </article>
                    </div>

                    <div className={styles.bottomGrid}>
                        <article className={styles.smallCard}>
                            <div className={styles.logText}>
                                <h2 className={styles.cardTitle}>
                                    캡스톤 일지
                                </h2>
                                <p className={styles.statusText}>
                                    {isTeamCreated
                                        ? "2팀 미제출"
                                        : "팀 생성 후 이용 가능합니다"}
                                </p>
                            </div>
                            <div className={styles.smallIcon}>
                                <img src={CapstonLogIcon} alt="" />
                            </div>
                        </article>

                        <article className={styles.smallCard}>
                            <div>
                                <h2 className={styles.cardTitle}>학생</h2>
                                <span className={styles.countBadge}>
                                    135명 등록
                                </span>
                            </div>
                            <div className={styles.smallIcon}>
                                <img src={TeamIcon} alt="" />
                            </div>
                        </article>

                        <article className={styles.smallCard}>
                            <div>
                                <h2 className={styles.cardTitle}>공지</h2>
                                <Link
                                    to="/admin/notice/create"
                                    className={styles.quickButton}
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
