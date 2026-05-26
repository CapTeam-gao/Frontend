import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import styles from "./AdminNoticeDetail.module.css";
import { getVisibleNotices, saveDeletedNoticeId } from "../../data/noticeDummy";
import Header from "../../components/common/Header";
import Button from "../../components/common/Button";
import { requestDeleteNotice } from "../../api/noticeApi";
import authStore from "../../store/authStore";
import MDEditor from "@uiw/react-md-editor";

const AdminNoticeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const accessToken = authStore((state) => state.accessToken);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    const notice = getVisibleNotices().find(
        (notice) => notice.id === Number(id)
    );

    const handleDeleteNotice = async () => {
        try {
            setDeleteError("");
            setIsDeleting(true);

            if (!accessToken) {
                setDeleteError("로그인 정보가 없어 공지를 삭제할 수 없습니다.");
                return;
            }

            await requestDeleteNotice(notice.id, accessToken);
            saveDeletedNoticeId(notice.id);
            navigate("/admin/notice");
        } catch {
            setDeleteError(
                "공지 삭제에 실패했습니다. 잠시 후 다시 시도해주세요."
            );
        } finally {
            setIsDeleting(false);
        }
    };

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
                                    {notice.important && (
                                        <span className={styles.tag}>중요</span>
                                    )}
                                </div>

                                <div className={styles.meta}>
                                    <span>교사 {notice.writer}</span>
                                    <span>{notice.date}</span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                buttonSize="small"
                                buttonColor="danger"
                                onClick={() => setIsDeleteModalOpen(true)}
                                className={styles.button}
                            >
                                삭제
                            </Button>
                        </div>
                    </div>

                    <div className={styles.contentArea}>
                        <MDEditor.Markdown
                            className={styles.content}
                            source={notice.content}
                        />
                        {notice.important && (
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
