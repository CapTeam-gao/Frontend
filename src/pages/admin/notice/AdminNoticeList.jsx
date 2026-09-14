// Design/notice-list.html 반영. 학생 목록과 같은 구조 + 새 공지 작성 버튼.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./AdminNoticeList.module.css";
import NoticeItem from "../../../components/common/notice/NoticeItem";
import Pagination from "../../../components/common/pagination/Pagination";
import Header from "../../../components/common/header/Header";
import EmptyState from "../../../components/common/empty/EmptyState";
import useInView from "../../../hooks/useInView";
import { NoticeListSkeleton } from "../../user/notice/UserNoticeList";
import { requestNoticeList } from "../../../api/noticeApi";

const NOTICE_PER_PAGE = 6;

const sortNoticesByLatest = (notices) =>
    [...notices].sort((a, b) => {
        const timeA = new Date(a.createdAt ?? 0).getTime();
        const timeB = new Date(b.createdAt ?? 0).getTime();

        if (timeA !== timeB) return timeB - timeA;

        return Number(b.id ?? 0) - Number(a.id ?? 0);
    });

const AdminNoticeList = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [notices, setNotices] = useState([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const totalPage = Math.ceil(notices.length / NOTICE_PER_PAGE);
    const startIndex = (currentPage - 1) * NOTICE_PER_PAGE;
    const currentNotices = notices.slice(
        startIndex,
        startIndex + NOTICE_PER_PAGE
    );
    const importantCount = notices.filter(
        (notice) => notice.important === "IMPORTANT"
    ).length;

    const listRef = useInView({ replayKey: `${isLoading}-${currentPage}` });

    useEffect(() => {
        const getNoticeList = async () => {
            try {
                const data = await requestNoticeList();
                setNotices(
                    Array.isArray(data) ? sortNoticesByLatest(data) : []
                );
            } catch {
                setError("공지를 불러오지 못했습니다.");
            } finally {
                setIsLoading(false);
            }
        };

        getNoticeList();
    }, []);

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.body}>
                <section className={styles.pageHead}>
                    <div className={styles.titleGroup}>
                        <div className={styles.titleLine}>
                            <h1 className={styles.headline}>공지 관리</h1>
                            {!isLoading && (
                                <span className={styles.totalCount}>
                                    전체 {notices.length}건
                                </span>
                            )}
                        </div>
                    </div>

                    <div className={styles.headActions}>
                        {!isLoading && importantCount > 0 && (
                            <p className={styles.importantStatus}>
                                <span aria-hidden="true" />
                                중요 공지 <strong>{importantCount}건</strong>
                            </p>
                        )}
                        <Link
                            to="/admin/notice/create"
                            className={styles.writeButton}
                        >
                            공지 작성
                        </Link>
                    </div>
                </section>

                {isLoading ? (
                    <NoticeListSkeleton className={styles.list} />
                ) : error ? (
                    <EmptyState
                        variant="error"
                        title="공지를 불러오지 못했어요"
                        description={error}
                    />
                ) : notices.length === 0 ? (
                    <EmptyState
                        title="아직 작성한 공지가 없어요"
                        description="첫 공지를 작성하면 학생 화면에 바로 보여요."
                    />
                ) : (
                    <>
                        <ul className={styles.list} ref={listRef}>
                            <li className={styles.listHead} aria-hidden="true">
                                <span>공지 제목</span>
                                <span>작성자</span>
                                <span>등록일</span>
                                <span />
                            </li>
                            {currentNotices.map((notice) => (
                                <li key={notice.id}>
                                    <Link
                                        to={`/admin/notice/${notice.id}`}
                                        data-reveal
                                        className={styles.noticeLink}
                                    >
                                        <NoticeItem notice={notice} />
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        <Pagination
                            currentPage={currentPage}
                            totalPage={totalPage}
                            onPageChange={setCurrentPage}
                        />
                    </>
                )}
            </main>
        </div>
    );
};

export default AdminNoticeList;
