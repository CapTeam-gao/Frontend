import styles from "./UserNoticeList.module.css";
import UserNoticeItem from "../../components/user/UserNoticeItem";
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
    {
        id: 8,
        title: "팀 정보 수정 기간 안내",
        writer: "관리자",
        content: "팀명과 프로젝트 주제 수정 기간을 확인해주세요.",
        date: "2026.05.12",
        important: false,
    },
    {
        id: 9,
        title: "멘토링 신청 안내",
        writer: "관리자",
        content: "멘토링이 필요한 팀은 신청 기간 안에 신청해주세요.",
        date: "2026.05.11",
        important: false,
    },
    {
        id: 10,
        title: "최종 발표 리허설 안내",
        writer: "관리자",
        content: "최종 발표 전 리허설 일정을 확인해주세요.",
        date: "2026.05.10",
        important: true,
    },
    {
        id: 11,
        title: "깃허브 저장소 제출 안내",
        writer: "관리자",
        content: "팀별 깃허브 저장소 주소를 제출해주세요.",
        date: "2026.05.09",
        important: false,
    },
    {
        id: 12,
        title: "캡스톤 운영 규칙 안내",
        writer: "관리자",
        content: "캡스톤 진행 중 지켜야 할 운영 규칙을 확인해주세요.",
        date: "2026.05.08",
        important: false,
    },
];

const UserNoticeList = () => {
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 설정
    const totalPage = Math.ceil(notices.length / NOTICE_PER_PAGE); // 공지 수 / 나눠서 보여줄 공지 수
    const startIndex = (currentPage - 1) * NOTICE_PER_PAGE;
    // 예를 들어서 currentPage = 1 이면 (1-1) * 6 = 0 임 그럼 0번 페이지부터 보ㅓ여줌
    // currentPage = 2 이면 (2-1) * 6 = 6 임 그럼 6번 페이지부터 보여줌
    const currentNotices = notices.slice(
        startIndex,
        startIndex + NOTICE_PER_PAGE
    );
    // startIndex는 1부터 시작하므로 0부터 6번 인덱스까지의 공지를 갖고옴

    return (
        <div className={styles.container}>
            <Header />
            <div className={styles.body}>
                <h1 className={styles.title}>공지사항</h1>
                <ul className={styles.list}>
                    {currentNotices.map((notice) => (
                        <UserNoticeItem key={notice.id} notice={notice} />
                    ))}
                </ul>

                <div className={styles.pagination}>
                    {Array.from({ length: totalPage }, (_, index) => {
                        const pageNumber = index + 1;

                        return (
                            <button
                                key={pageNumber}
                                className={`${styles.pageButton} ${
                                    currentPage === pageNumber
                                        ? styles.activePage
                                        : ""
                                }`}
                                type="button"
                                onClick={() => setCurrentPage(pageNumber)}
                            >
                                {pageNumber}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default UserNoticeList;
