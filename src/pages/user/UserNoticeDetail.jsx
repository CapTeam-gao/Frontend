import { Link, useParams } from "react-router-dom";
import styles from "./UserNoticeDetail.module.css";
import notices from "../../data/noticeDummy";
import Header from "../../components/common/Header";

const UserNoticeDetail = () => {
    const { id } = useParams();

    const notice = notices.find((notice) => notice.id === Number(id));

    if (!notice) {
        return (
            <div className={styles.page}>
                <Header />
                <main className={styles.body}>
                    <Link to="/user/notice" className={styles.backLink}>
                        ← 목록
                    </Link>
                    <section className={styles.emptyBox}>
                        공지를 찾을 수 없습니다.
                    </section>
                </main>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <Header />
            <main className={styles.body}>
                <Link to="/user/notice" className={styles.backLink}>
                    ← 목록
                </Link>

                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={styles.titleRow}>
                            <h1 className={styles.title}>{notice.title}</h1>
                            {notice.important && (
                                <span className={styles.tag}>중요</span>
                            )}
                        </div>

                        <div className={styles.meta}>
                            <span>교사 {notice.writer}</span>
                            <span>{notice.date}</span>
                        </div>
                    </div>

                    <div className={styles.contentArea}>
                        <p className={styles.content}>{notice.content}</p>
                        {notice.important && (
                            <p className={styles.content}>
                                중요한 공지이므로 내용을 확인한 뒤 팀원들과
                                공유해주세요.
                            </p>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default UserNoticeDetail;
