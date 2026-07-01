import styles from "./AdminNoticeList.module.css";
import NoticeItem from "../../../components/common/notice/NoticeItem";
import Pagination from "../../../components/common/pagination/Pagination";
import Header from "../../../components/common/header/Header";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../../components/common/button/Button";
import { requestNoticeList } from "../../../api/noticeApi";
import useDelayedLoading from "../../../hooks/useDelayedLoading";

const NOTICE_PER_PAGE = 6; // 공지 몇 개로 페이지를 나눌지 선정

const sortNoticesByLatest = (notices) =>
    [...notices].sort((a, b) => {
        const timeA = new Date(a.createdAt ?? 0).getTime();
        const timeB = new Date(b.createdAt ?? 0).getTime();

        if (timeA !== timeB) return timeB - timeA;

        return Number(b.id ?? 0) - Number(a.id ?? 0);
    });

const AdminNoticeList = () => {
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 설정
    const [notices, setNotices] = useState([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const showLoading = useDelayedLoading(isLoading);
    const totalPage = Math.ceil(notices.length / NOTICE_PER_PAGE); // 공지 수 / 나눠서 보여줄 공지 수
    const startIndex = (currentPage - 1) * NOTICE_PER_PAGE;

    const currentNotices = notices.slice(
        startIndex,
        startIndex + NOTICE_PER_PAGE
    );

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

    let content;

    if (isLoading) {
        content = (
            showLoading && (
                <p className={styles.loadingText}>
                    공지를 불러오는 중입니다.
                </p>
            )
        );
    } else if (error) {
        content = <p className={styles.errorText}>{error}</p>;
    } else {
        content = (
            <>
                <ul className={styles.list}>
                    {currentNotices.map((notice) => (
                        <Link key={notice.id} to={`/admin/notice/${notice.id}`}>
                            <NoticeItem notice={notice} />
                        </Link>
                    ))}
                </ul>
                <Pagination
                    currentPage={currentPage}
                    totalPage={totalPage}
                    onPageChange={setCurrentPage}
                />
            </>
        );
    }

    return (
        <div className={styles.container}>
            <Header />
            <div className={styles.body}>
                <div className={styles.topBar}>
                    <h1 className={styles.title}>공지사항</h1>
                    <Link
                        to="/admin/notice/create"
                        className={styles.writeLink}
                    >
                        <Button
                            className={styles.writeButton}
                            buttonSize="small"
                            buttonColor="primary"
                        >
                            새 글 작성
                        </Button>
                    </Link>
                </div>
                {content}
            </div>
        </div>
    );
};

export default AdminNoticeList;
