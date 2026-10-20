// Design/notice-detail-v3.html의 단일 본문 레이아웃을 사용한다.
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import styles from "./UserNoticeDetail.module.css";
import Header from "../../../components/common/header/Header";
import AppFooter from "../../../components/common/footer/AppFooter";
import Skeleton from "../../../components/common/skeleton/Skeleton";
import EmptyState from "../../../components/common/empty/EmptyState";
import useInView from "../../../hooks/useInView";
import { requestNoticeDetail } from "../../../api/noticeApi";
import { formatCreatedAt } from "../../../utils/format";
import ChatAvatar from "../../../components/common/chat/ChatAvatar";
import noticeIcon from "../../../assets/images/dashboardNoticeIcon.webp";
import TeamResultNoticeDetail from "../../../components/common/notice/TeamResultNoticeDetail";
import { parseTeamResultNoticeContent } from "../../../utils/teamResultNotice";
import authStore from "../../../store/authStore";

export const NoticeDetailSkeleton = () => (
    <div>
        <Skeleton width={64} height={20} />
        <Skeleton height={40} style={{ marginTop: 16 }} />
        <Skeleton width="66%" height={40} style={{ marginTop: 12 }} />
        <Skeleton width={224} height={20} style={{ marginTop: 24 }} />
        <Skeleton height={20} style={{ marginTop: 40 }} />
        <Skeleton height={20} style={{ marginTop: 12 }} />
        <Skeleton width="80%" height={20} style={{ marginTop: 12 }} />
        <Skeleton height={20} style={{ marginTop: 32 }} />
        <Skeleton width="75%" height={20} style={{ marginTop: 12 }} />
    </div>
);

const UserNoticeDetail = () => {
    const { id } = useParams();
    const currentUserId = authStore((state) => state.user?.userId);

    const [notice, setNotice] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

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
                        <Link to="/user/notice" className={styles.backLink}>
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
                                    <div className={styles.headMain}>
                                        <div
                                            data-reveal
                                            className={styles.badgeRow}
                                        >
                                            <span className={styles.typeBadge}>
                                                {teamResultParsed
                                                    ? "팀 배정 결과"
                                                    : "일반 공지"}
                                            </span>
                                            {isImportant && (
                                                <span
                                                    className={
                                                        styles.importantBadge
                                                    }
                                                >
                                                    중요
                                                </span>
                                            )}
                                        </div>
    
                                        <h1 data-reveal className={styles.title}>
                                            {notice.title}
                                        </h1>
    
                                        <p data-reveal className={styles.metaLine}>
                                            <ChatAvatar name={notice.writer} size={36} />
                                            <b>{notice.writer}</b>
                                            <i aria-hidden="true">·</i>
                                            <time dateTime={notice.createdAt || undefined}>
                                                {formatCreatedAt(notice.createdAt)}
                                            </time>
                                        </p>
                                    </div>
                                    <img
                                        className={styles.headIcon}
                                        src={noticeIcon}
                                        alt=""
                                    />
                                </header>

                                <div className={styles.contentArea}>
                                    {teamResultParsed ? (
                                        <TeamResultNoticeDetail
                                            notice={notice}
                                            parsed={teamResultParsed}
                                            currentUserId={currentUserId}
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
                                <Link to="/user/notice" className={styles.footerLink}>
                                    ← 공지 목록으로
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <AppFooter />
        </div>
    );
};

export default UserNoticeDetail;
