import styles from "./UserNoticeList.module.css";
import NoticeItem from "../../components/common/NoticeItem";
import Pagination from "../../components/common/Pagination";
import Header from "../../components/common/Header";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { requestNoticeList } from "../../api/noticeApi";

const NOTICE_PER_PAGE = 6;

const UserNoticeList = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [notices, setNotices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const totalPage = Math.ceil(notices.length / NOTICE_PER_PAGE);

    const startIndex = (currentPage - 1) * NOTICE_PER_PAGE;
    const currentNotices = notices.slice(
        startIndex,
        startIndex + NOTICE_PER_PAGE
    );

    useEffect(() => {
        const getNoticeList = async () => {
            try {
                const data = await requestNoticeList();
                setNotices(Array.isArray(data) ? data : []);
            } catch {
                setError("공지 목록을 불러오지 못했습니다.");
            } finally {
                setIsLoading(false);
            }
        };

        getNoticeList();
    }, []);

    let content;

    if (isLoading) {
        content = (
            <p className={styles.loadingText}>공지를 불러오는 중입니다.</p>
        );
    } else if (error) {
        content = <p className={styles.errorText}>{error}</p>;
    } else {
        content = (
            <>
                <ul className={styles.list}>
                    {currentNotices.map((notice) => (
                        <Link key={notice.id} to={`/user/notice/${notice.id}`}>
                            <NoticeItem notice={notice} />
                        </Link>
                    ))}
                </ul>

                {totalPage > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPage={totalPage}
                        onPageChange={setCurrentPage}
                    />
                )}
            </>
        );
    }

    return (
        <div className={styles.container}>
            <Header />
            <div className={styles.body}>
                <h1 className={styles.title}>공지사항</h1>
                {content}
            </div>
        </div>
    );
};

export default UserNoticeList;
