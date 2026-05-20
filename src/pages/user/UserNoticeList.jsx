import styles from "./UserNoticeList.module.css";
import NoticeItem from "../../components/common/NoticeItem";
import Pagination from "../../components/common/Pagination";
import Header from "../../components/common/Header";
import { useState } from "react";
import { Link } from "react-router-dom";
import notices from "../../data/noticeDummy";

const NOTICE_PER_PAGE = 6; // 공지 몇 개로 페이지를 나눌지 선정

const UserNoticeList = () => {
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 설정
    const totalPage = Math.ceil(notices.length / NOTICE_PER_PAGE); // 공지 수 / 나눠서 보여줄 공지 수
    const startIndex = (currentPage - 1) * NOTICE_PER_PAGE;
    // 예를 들어서 currentPage = 1 이면 (1-1) * 6 = 0 임 그럼 0번 페이지부터 보여줌
    // currentPage = 2 이면 (2-1) * 6 = 6 임 그럼 6번 페이지부터 보여줌
    const currentNotices = notices.slice(
        startIndex,
        startIndex + NOTICE_PER_PAGE
    );
    // startIndex는 0부터 시작하므로 0부터 6을 잘라서 0부터 5번까지의 공지를 배열로 만듦

    return (
        <div className={styles.container}>
            <Header />
            <div className={styles.body}>
                <h1 className={styles.title}>공지사항</h1>
                <ul className={styles.list}>
                    {currentNotices.map((notice) => (
                        <Link key={notice.id} to={`/user/notice/${notice.id}`}>
                            <NoticeItem notice={notice} />
                        </Link>
                    ))}
                </ul>

                <Pagination
                    currentPage={currentPage}
                    totalPage={totalPage}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
};

export default UserNoticeList;
