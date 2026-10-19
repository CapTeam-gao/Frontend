// Design/notice-detail-v3.html 단일 본문 구성에 관리자 액션을 연결한다.
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";
import styles from "../../user/notice/UserNoticeDetail.module.css";
import adminStyles from "./AdminNoticeDetail.module.css";
import Header from "../../../components/common/header/Header";
import AppFooter from "../../../components/common/footer/AppFooter";
import EmptyState from "../../../components/common/empty/EmptyState";
import ModalOverlay from "../../../components/common/modal/ModalOverlay";
import useInView from "../../../hooks/useInView";
import { NoticeDetailSkeleton } from "../../user/notice/UserNoticeDetail";
import {
    requestDeleteNotice,
    requestNoticeDetail,
} from "../../../api/noticeApi";
import { formatCreatedAt } from "../../../utils/format";
import TeamResultNoticeDetail from "../../../components/common/notice/TeamResultNoticeDetail";
import { parseTeamResultNoticeContent } from "../../../utils/teamResultNotice";

const AdminNoticeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [notice, setNotice] = useState(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    const contentRef = useInView({ replayKey: `${isLoading}-${id}` });

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

    const teamResultParsed =
        notice?.noticeType === "TEAM_RESULT" && notice.teamResult
            ? parseTeamResultNoticeContent(notice.content)
            : null;
    const isImportant = notice?.important === "IMPORTANT";

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.body}>
                <div className={styles.inner} ref={contentRef}>
                    <div className={styles.backRow}>
                        <Link to="/admin/notice" className={styles.backLink}>
                            ← 공지 목록
                        </Link>
                    </div>

                    {isLoading ? (
                        <NoticeDetailSkeleton />
                    ) : error || !notice ? (
                        <EmptyState
                            variant={error ? "error" : "empty"}
                            title={
                                error
                                    ? "공지를 불러오지 못했어요"
                                    : "공지를 찾을 수 없어요"
                            }
                            description={
                                error ||
                                "삭제되었거나 주소가 잘못되었을 수 있어요."
                            }
                        />
                    ) : (
                        <div className={styles.columns}>
                            <article className={styles.article}>
                                <header className={styles.articleHead}>
                                    {(isImportant || teamResultParsed) && (
                                        <div
                                            data-reveal
                                            className={styles.badgeRow}
                                        >
                                            {isImportant && (
                                                <span
                                                    className={
                                                        styles.importantBadge
                                                    }
                                                >
                                                    중요
                                                </span>
                                            )}
                                            {teamResultParsed && (
                                                <span
                                                    className={styles.typeBadge}
                                                >
                                                    팀 배정 결과
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <h1 data-reveal className={styles.title}>
                                        {notice.title}
                                    </h1>

                                    <div
                                        data-reveal
                                        className={adminStyles.metaRow}
                                    >
                                        <p className={styles.metaLine}>
                                            <span>{notice.writer}</span>
                                            <i aria-hidden="true">·</i>
                                            <time dateTime={notice.createdAt || undefined}>
                                                {formatCreatedAt(notice.createdAt)}
                                            </time>
                                            <i aria-hidden="true">·</i>
                                            <span>{teamResultParsed ? "팀 배정 결과" : "일반 공지"}</span>
                                        </p>

                                        <div className={adminStyles.actions}>
                                            <Link
                                                to={`/admin/notice/${id}/edit`}
                                                className={
                                                    adminStyles.outlineButton
                                                }
                                            >
                                                수정
                                            </Link>
                                            <button
                                                type="button"
                                                className={
                                                    adminStyles.dangerButton
                                                }
                                                onClick={() =>
                                                    setIsDeleteModalOpen(true)
                                                }
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    </div>
                                </header>

                                <div className={styles.contentArea}>
                                    {teamResultParsed ? (
                                        <TeamResultNoticeDetail
                                            notice={notice}
                                            parsed={teamResultParsed}
                                        />
                                    ) : (
                                        <>
                                            <div data-reveal>
                                                <MDEditor.Markdown
                                                    className={styles.markdown}
                                                    source={notice.content}
                                                />
                                            </div>
                                            {isImportant && (
                                                <div
                                                    data-reveal
                                                    className={
                                                        styles.importantNote
                                                    }
                                                >
                                                    중요한 공지예요. 내용을
                                                    확인한 뒤 팀원들과
                                                    공유해주세요.
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </article>

                            <div className={styles.articleFooter}>
                                <Link to="/admin/notice" className={styles.footerLink}>
                                    ← 공지 목록으로
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {isDeleteModalOpen && (
                <ModalOverlay
                    onClose={() => setIsDeleteModalOpen(false)}
                    overlayClassName={adminStyles.modalOverlay}
                    modalClassName={adminStyles.modalBox}
                    ariaLabelledby="admin-notice-delete-title"
                >
                    <>
                        <h2 id="admin-notice-delete-title" className={adminStyles.modalTitle}>
                            이 공지를 삭제할까요?
                        </h2>
                        <p className={adminStyles.modalText}>
                            삭제한 공지는 다시 되돌릴 수 없어요.
                        </p>

                        {deleteError && (
                            <p className={adminStyles.deleteError}>
                                {deleteError}
                            </p>
                        )}

                        <div className={adminStyles.modalActions}>
                            <button
                                type="button"
                                className={adminStyles.cancelButton}
                                disabled={isDeleting}
                                onClick={() => setIsDeleteModalOpen(false)}
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                className={adminStyles.confirmDeleteButton}
                                disabled={isDeleting}
                                onClick={handleDeleteNotice}
                            >
                                {isDeleting ? "삭제 중..." : "삭제하기"}
                            </button>
                        </div>
                    </>
                </ModalOverlay>
            )}
            <AppFooter role="admin" />
        </div>
    );
};

export default AdminNoticeDetail;
