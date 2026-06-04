import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import styles from "./AdminNoticeDetail.module.css";
import Header from "../../components/common/Header";
import Button from "../../components/common/Button";
import { requestDeleteNotice, requestNoticeDetail } from "../../api/noticeApi";
import MDEditor from "@uiw/react-md-editor";
import { formatCreatedAt } from "../../utils/format";

const AdminNoticeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [notice, setNotice] = useState(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

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

    const handleDeleteNotice = async () => {
        try {
            setDeleteError("");
            setIsDeleting(true);

            await requestDeleteNotice(notice.id);
            navigate("/admin/notice");
        } catch {
            setDeleteError(
                "공지 삭제에 실패했습니다. 잠시 후 다시 시도해주세요."
            );
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className={styles.page}>
                <Header />
                <main className={styles.body}>
                    <Link to="/admin/notice" className={styles.backLink}>
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
                    <Link to="/admin/notice" className={styles.backLink}>
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
                    <Link to="/admin/notice" className={styles.backLink}>
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
                <Link to="/admin/notice" className={styles.backLink}>
                    ← 목록
                </Link>

                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                        <div className={styles.headerTop}>
                            <div>
                                <div className={styles.titleRow}>
                                    <h1 className={styles.title}>
                                        {notice.title}
                                    </h1>
                                    {notice.important === "IMPORTANT" && (
                                        <span className={styles.tag}>중요</span>
                                    )}
                                </div>

                                <div className={styles.meta}>
                                    <span>교사 {notice.writer}</span>
                                    <span>
                                        {formatCreatedAt(notice.createdAt)}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.actionButtons}>
                                <Link
                                    to={`/admin/notice/${id}/edit`}
                                    className={styles.editLink}
                                >
                                    <Button
                                        type="button"
                                        buttonSize="small"
                                        buttonColor="secondary"
                                        className={`${styles.button} ${styles.editButton}`}
                                    >
                                        수정
                                    </Button>
                                </Link>
                                <Button
                                    type="button"
                                    buttonSize="small"
                                    buttonColor="danger"
                                    onClick={() => setIsDeleteModalOpen(true)}
                                    className={`${styles.button} ${styles.deleteButton}`}
                                >
                                    삭제
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className={styles.contentArea}>
                        <MDEditor.Markdown
                            className={styles.content}
                            source={notice.content}
                        />
                        {notice.important === "IMPORTANT" && (
                            <p className={styles.important}>
                                중요한 공지이므로 내용을 확인한 뒤 팀원들과
                                공유해주세요.
                            </p>
                        )}
                    </div>
                </section>
            </main>

            {isDeleteModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalBox}>
                        <h2 className={styles.modalTitle}>
                            정말 삭제하시겠습니까?
                        </h2>
                        <p className={styles.modalText}>
                            삭제한 공지는 다시 되돌릴 수 없습니다.
                        </p>

                        {deleteError && (
                            <p className={styles.deleteError}>{deleteError}</p>
                        )}

                        <div className={styles.modalActions}>
                            <Button
                                type="button"
                                buttonSize="small"
                                buttonColor="ghost"
                                disabled={isDeleting}
                                onClick={() => setIsDeleteModalOpen(false)}
                                className={styles.no}
                            >
                                아니요
                            </Button>
                            <Button
                                type="button"
                                buttonSize="small"
                                buttonColor="danger"
                                disabled={isDeleting}
                                onClick={handleDeleteNotice}
                                className={styles.delete}
                            >
                                {isDeleting ? "삭제 중..." : "삭제"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminNoticeDetail;
