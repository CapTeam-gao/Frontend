import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import styles from "./UserNoticeDetail.module.css";
import Header from "../../components/common/Header";
import MDEditor from "@uiw/react-md-editor";
import { requestNoticeDetail } from "../../api/noticeApi";
import { formatCreatedAt } from "../../utils/format";

const UserNoticeDetail = () => {
    const { id } = useParams();

    const [notice, setNotice] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const getNoticeDetail = async () => {
            try {
                const data = await requestNoticeDetail(id);
                setNotice(data);
            } catch {
                setError("공지 상세 정보를 불러오지 못했습니다.");
            } finally {
                setIsLoading(false);
            }
        };

        getNoticeDetail();
    }, [id]);

    if (isLoading) {
        return (
            <div className={styles.page}>
                <Header />
                <main className={styles.body}>
                    <Link to="/user/notice" className={styles.backLink}>
                        ← 목록
                    </Link>
                    <section className={styles.emptyBox}>
                        공지를 불러오는 중입니다.
                    </section>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.page}>
                <Header />
                <main className={styles.body}>
                    <Link to="/user/notice" className={styles.backLink}>
                        ← 목록
                    </Link>
                    <section className={styles.emptyBox}>{error}</section>
                </main>
            </div>
        );
    }

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
                            {notice.important === "IMPORTANT" && (
                                <span className={styles.tag}>중요</span>
                            )}
                        </div>

                        <div className={styles.meta}>
                            <span>교사 {notice.writer}</span>
                            <span>{formatCreatedAt(notice.createdAt)}</span>
                        </div>
                    </div>

                    <div className={styles.contentArea}>
                        <MDEditor.Markdown
                            className={styles.content}
                            source={notice.content}
                        />
                        {notice.important === "IMPORTANT" && (
                            <p className={styles.importantContent}>
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
