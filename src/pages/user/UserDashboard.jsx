import { Link } from "react-router-dom";
import Header from "../../components/common/Header";
import ChatIcon from "../../assets/icons/chat.svg";
import CapstonLogIcon from "../../assets/icons/capstonLog.svg";
import NoticeIcon from "../../assets/icons/notice.svg";
import ProjectIcon from "../../assets/icons/project.svg";
import styles from "./UserDashboard.module.css";

const UserDashboard = () => {
    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.body}>
                <section className={styles.dashboard}>
                    <Link to="/user/chat" className={styles.card}>
                        <div className={styles.iconBox}>
                            <img src={ChatIcon} alt="" />
                        </div>

                        <div className={styles.cardText}>
                            <h1 className={styles.cardTitle}>팀 채팅</h1>
                            <p className={styles.statusText}>2명 현재 활동중</p>
                        </div>
                    </Link>

                    <Link to="/user/project" className={styles.card}>
                        <div className={styles.iconBox}>
                            <img src={ProjectIcon} alt="" />
                        </div>

                        <div className={styles.cardText}>
                            <h2 className={styles.cardTitle}>프로젝트</h2>
                        </div>
                    </Link>

                    <Link to="/user/log" className={styles.card}>
                        <div className={styles.iconBox}>
                            <img src={CapstonLogIcon} alt="" />
                        </div>

                        <div className={styles.cardText}>
                            <h2 className={styles.cardTitle}>캡스톤 일지</h2>
                            <p
                                className={`${styles.statusText} ${styles.dangerStatus}`}
                            >
                                오늘 일지 미제출
                            </p>
                        </div>
                    </Link>

                    <Link to="/user/notice" className={styles.card}>
                        <span className={styles.newBadge}>N</span>

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
