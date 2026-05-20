import styles from "./UserNoticeList.module.css";
import NoticeItem from "../../components/common/NoticeItem";
import Pagination from "../../components/common/Pagination";
import Header from "../../components/common/Header";
import { useState } from "react";

const NOTICE_PER_PAGE = 6; // 공지 몇 개로 페이지를 나눌지 선정

const notices = [
    {
        id: 1,
        title: "캡스톤 일정 안내",
        writer: "관리자",
        content: "캡스톤 발표 일정과 준비 사항을 확인해주세요.",
        date: "2026.05.19",
        important: true,
    },
    {
        id: 2,
        title: "일지 제출 안내",
        writer: "관리자",
        content: "이번 주 캡스톤 일지는 금요일까지 제출해주세요.",
        date: "2026.05.18",
        important: false,
    },
    {
        id: 3,
        title: "프로젝트 기획서 제출 안내",
        writer: "관리자",
        content: "팀별 프로젝트 기획서를 마감 전까지 작성해주세요.",
        date: "2026.05.17",
        important: true,
    },
    {
        id: 4,
        title: "예산 신청 폼 작성 안내",
        writer: "관리자",
        content: "필요한 장비와 재료가 있다면 예산 신청 폼을 작성해주세요.",
        date: "2026.05.16",
        important: false,
    },
    {
        id: 5,
        title: "팀 채팅방 이용 안내",
        writer: "관리자",
        content: "팀 확정 후 생성된 팀 채팅방에서 소통을 시작해주세요.",
        date: "2026.05.15",
        important: false,
    },
    {
        id: 6,
        title: "중간 점검 일정 안내",
        writer: "관리자",
        content: "중간 점검은 팀별로 지정된 시간에 진행됩니다.",
        date: "2026.05.14",
        important: true,
    },
    {
        id: 7,
        title: "발표자료 형식 안내",
        writer: "관리자",
        content: "발표자료는 지정된 양식에 맞춰 제출해주세요.",
        date: "2026.05.13",
        important: false,
    },
];

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
                        <NoticeItem key={notice.id} notice={notice} />
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
