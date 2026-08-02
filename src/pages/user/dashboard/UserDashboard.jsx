// Design/UserDashboard.html 반영.
// [임시 목데이터] 프로젝트 기획서 / 팀 채팅 미리보기 / 최근 공지는
// requestUserProjectPlan·requestNoticeList 등 실제 API 대신
// Design html 목업과 동일한 값을 하드코딩해서 우선 디자인만 맞춘 상태.
// 백엔드 연동 시 아래 MOCK_* 상수를 실제 API 응답으로 교체할 것.
// (사용자 요청으로 "내 팀" 위젯은 제거 — 팀 생성 여부와 무관하게 프로젝트 기획서/팀 채팅 2개만 노출)
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../components/common/header/Header";
import TeamRequiredModal from "../../../components/common/modal/TeamRequiredModal";
import { requestUserDashboard } from "../../../api/dashboardApi";
import {
    formatCountdownTime,
    getCapstoneLogRemainingMs,
    getCapstoneLogUnavailableText,
    isCapstoneLogTime,
} from "../../../utils/capstoneLogTime";
import { formatCreatedAt, stripMarkdown, truncateText } from "../../../utils/format";
import useUnreadChatCount from "../../../hooks/useUnreadChatCount";
import heroVisualPending from "../../../assets/images/dashboardHeroPuzzle.png";
import heroVisualDone from "../../../assets/images/dashboardHeroPuzzleUser.png";
import styles from "./UserDashboard.module.css";

const MOCK_PROJECT_PLAN = {
    completedCount: 3,
    totalCount: 4,
    summaryText: "서비스 소개, 주요 기능까지 작성됨 · 마지막 수정 어제",
    incompleteItemLabels: ["역할 분담"],
};

const MOCK_CHAT = {
    unreadMessageCount: 3,
    recentMessages: [
        {
            senderName: "김도윤",
            timeText: "10분 전",
            preview: "오늘 회의는 7시에 할게요",
            extraSenderCount: 2,
        },
        {
            senderName: "이수아",
            timeText: "32분 전",
            preview: "파일 업로드: 기획서_초안.pdf",
            extraSenderCount: 1,
        },
    ],
};

// Design/UserDashboard.html(팀 생성 완료 상태) 목데이터
const TEAM_CREATED_NOTICES = [
    {
        noticeId: 1,
        title: "2학년 팀 배정 결과 안내",
        content:
            "2학년 4개 팀의 최종 배정 결과와 팀장, 역할 구성을 공지 상세에서 확인할 수 있습니다.",
        important: "IMPORTANT",
        writer: "관리자",
        createdAt: "2026-07-24",
    },
    {
        noticeId: 2,
        title: "캡스톤 일지 작성 시간 변경 안내",
        content: "",
        important: "NORMAL",
        writer: "관리자",
        createdAt: "2026-07-22",
    },
    {
        noticeId: 3,
        title: "3학년 설문 마감 임박 안내(~07.27)",
        content: "",
        important: "IMPORTANT",
        writer: "관리자",
        createdAt: "2026-07-21",
    },
];

// Design/UserDashboardPending.html(팀 생성 전 상태) 목데이터
const PENDING_NOTICES = [
    {
        noticeId: 4,
        title: "3학년 팀 생성 일정 안내",
        content:
            "3학년 팀 생성은 설문 마감 이후 순차적으로 진행됩니다. 결과는 이 화면과 공지에서 바로 확인할 수 있어요.",
        important: "IMPORTANT",
        writer: "관리자",
        createdAt: "2026-07-20",
    },
    {
        noticeId: 5,
        title: "설문 제출 안내",
        content: "",
        important: "NORMAL",
        writer: "관리자",
        createdAt: "2026-07-15",
    },
    {
        noticeId: 6,
        title: "캡스톤 프로젝트 운영 계획 안내",
        content: "",
        important: "NORMAL",
        writer: "관리자",
        createdAt: "2026-07-10",
    },
];

const UserDashboard = () => {
    const [dashboard, setDashboard] = useState({
        teamCreated: false,
        todayJournalSubmitted: false,
    });
    const [isDashboardLoading, setIsDashboardLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [error, setError] = useState("");
    const [teamRequiredModal, setTeamRequiredModal] = useState(null);
    const { unreadChatCount } = useUnreadChatCount({
        enabled: dashboard.teamCreated,
    });

    useEffect(() => {
        const getDashboardData = async () => {
            try {
                const dashboardData = await requestUserDashboard();
                setDashboard((prevDashboard) => ({
                    ...prevDashboard,
                    ...dashboardData,
                }));
            } catch {
                setError("대시보드 정보를 불러오지 못했습니다.");
            } finally {
                setIsDashboardLoading(false);
            }
        };

        getDashboardData();
    }, []);

    useEffect(() => {
        const timerId = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timerId);
    }, []);

    const blockTeamRequiredCard = (event, message) => {
        if (dashboard.teamCreated) return;

        event.preventDefault();
        setTeamRequiredModal({ message });
    };

    const canWriteLog = isCapstoneLogTime(currentTime);
    const hero = !dashboard.teamCreated
        ? {
              title: "팀 생성을 기다리고 있어요",
              sub: "설문 제출이 완료됐습니다. 관리자가 AI로 팀을 생성하면 이 화면에서 바로 확인할 수 있어요.",
              statusText: "팀 생성 대기 중",
              noteText: "공지 확인하기",
              noteTo: "/user/notice",
          }
        : canWriteLog && !dashboard.todayJournalSubmitted
        ? {
              title: "오늘 캡스톤 일지를 작성해주세요",
              sub: "아직 오늘 일지를 작성하지 않았습니다. 작성 가능 시간 안에 활동 내용을 남기면 팀원 일지와 함께 취합됩니다.",
              countdownText: formatCountdownTime(
                  getCapstoneLogRemainingMs(currentTime)
              ),
              ctaText: "일지 작성하기",
              ctaTo: "/user/log",
              noteText: "지난 일지 보기",
              noteTo: "/user/log/result",
          }
        : canWriteLog
        ? {
              title: "오늘 캡스톤 일지 작성을 완료했어요",
              sub: "수고하셨습니다. 지난 일지는 언제든 다시 확인할 수 있습니다.",
              ctaText: "지난 일지 보기",
              ctaTo: "/user/log/result",
          }
        : {
              title: "지금은 캡스톤 일지 작성 시간이 아니에요",
              sub: getCapstoneLogUnavailableText(currentTime),
              ctaText: "지난 일지 보기",
              ctaTo: "/user/log/result",
          };

    const notices = dashboard.teamCreated
        ? TEAM_CREATED_NOTICES
        : PENDING_NOTICES;
    const featuredNotice = notices[0];
    const restNotices = notices.slice(1, 3);

    return (
        <div className={styles.page}>
            <Header />

            {!isDashboardLoading && (
                <main className={styles.body}>
                    {error && <p className={styles.errorText}>{error}</p>}

                    <section className={styles.hero}>
                        <div className={styles.heroGrid}>
                            <div>
                                <div className={styles.heroEyebrow}>
                                    학생 대시보드
                                </div>
                                <h1 className={styles.heroTitle}>
                                    {hero.title}
                                </h1>
                                <p className={styles.heroSub}>{hero.sub}</p>

                                {hero.countdownText && (
                                    <p className={styles.countdownLine}>
                                        작성 마감까지{" "}
                                        <b>{hero.countdownText}</b>
                                    </p>
                                )}

                                {hero.statusText && (
                                    <p className={styles.countdownLine}>
                                        설문 제출 완료 ·{" "}
                                        <b>{hero.statusText}</b>
                                    </p>
                                )}

                                {(hero.ctaText || hero.noteText) && (
                                    <div className={styles.heroActions}>
                                        {hero.ctaText && (
                                            <Link
                                                to={hero.ctaTo}
                                                className={styles.heroCta}
                                                onClick={(event) =>
                                                    blockTeamRequiredCard(
                                                        event,
                                                        "팀 생성이 완료되면 캡스톤 일지를 작성할 수 있습니다."
                                                    )
                                                }
                                            >
                                                {hero.ctaText}
                                            </Link>
                                        )}
                                        {hero.noteText && (
                                            <span
                                                className={styles.heroNote}
                                            >
                                                <Link to={hero.noteTo}>
                                                    {hero.noteText}
                                                </Link>
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className={styles.heroVisual}>
                                <img
                                    src={
                                        dashboard.teamCreated
                                            ? heroVisualDone
                                            : heroVisualPending
                                    }
                                    alt=""
                                />
                            </div>
                        </div>
                    </section>

                    <div className={styles.midSection}>
                        {!dashboard.teamCreated ? (
                            <div className={styles.sectionGrid}>
                                {["프로젝트 기획서", "팀 채팅"].map(
                                    (title) => (
                                        <div
                                            key={title}
                                            className={`${styles.section} ${styles.sizeHalf} ${styles.tileDisabled}`}
                                        >
                                            <div
                                                className={
                                                    styles.sectionHeader
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles.sectionTitle
                                                    }
                                                >
                                                    {title}
                                                </div>
                                            </div>
                                            <p
                                                className={
                                                    styles.tileDisabledMsg
                                                }
                                            >
                                                팀 생성이 완료되면 이용할 수
                                                있습니다.
                                            </p>
                                        </div>
                                    )
                                )}
                            </div>
        ) : (
                        <div className={styles.sectionGrid}>
                            <div
                                className={`${styles.section} ${styles.sizeHalf}`}
                            >
                                <div className={styles.sectionHeader}>
                                    <div className={styles.sectionTitle}>
                                        프로젝트 기획서
                                    </div>
                                    <Link
                                        to="/user/project"
                                        className={styles.sectionAction}
                                        onClick={(event) =>
                                            blockTeamRequiredCard(
                                                event,
                                                "팀 생성이 완료되면 프로젝트 정보를 작성할 수 있습니다."
                                            )
                                        }
                                    >
                                        기획서 보기
                                    </Link>
                                </div>

                                {dashboard.teamCreated ? (
                                    <>
                                        <div className={styles.ratioChart}>
                                            <div
                                                className={styles.ratioTrack}
                                            >
                                                <div
                                                    className={
                                                        styles.ratioFill
                                                    }
                                                    style={{
                                                        width: `${
                                                            (MOCK_PROJECT_PLAN.completedCount /
                                                                MOCK_PROJECT_PLAN.totalCount) *
                                                            100
                                                        }%`,
                                                    }}
                                                />
                                            </div>
                                            <div
                                                className={styles.ratioLabel}
                                            >
                                                {
                                                    MOCK_PROJECT_PLAN.completedCount
                                                }
                                                <span>
                                                    {" "}
                                                    /{" "}
                                                    {
                                                        MOCK_PROJECT_PLAN.totalCount
                                                    }
                                                    항목
                                                </span>
                                            </div>
                                        </div>

                                        <p className={styles.plainRowMeta}>
                                            {MOCK_PROJECT_PLAN.summaryText}
                                        </p>

                                        <div className={styles.sectionList}>
                                            {MOCK_PROJECT_PLAN.incompleteItemLabels.map(
                                                (label) => (
                                                    <div
                                                        key={label}
                                                        className={
                                                            styles.plainRow
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                styles.plainRowTitle
                                                            }
                                                        >
                                                            {label}
                                                        </div>
                                                        <span
                                                            className={`${styles.tag} ${styles.tagDanger}`}
                                                        >
                                                            미작성
                                                        </span>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <p className={styles.tileMeta}>
                                        팀 생성 전입니다
                                    </p>
                                )}
                            </div>

                            <div
                                className={`${styles.section} ${styles.sizeHalf}`}
                            >
                                <div className={styles.sectionHeader}>
                                    <div className={styles.sectionTitle}>
                                        팀 채팅
                                    </div>
                                    <Link
                                        to="/user/chat"
                                        className={styles.sectionAction}
                                        onClick={(event) =>
                                            blockTeamRequiredCard(
                                                event,
                                                "팀 생성이 완료되면 팀 채팅을 사용할 수 있습니다."
                                            )
                                        }
                                    >
                                        채팅으로 이동
                                    </Link>
                                </div>

                                {dashboard.teamCreated ? (
                                    <>
                                        <p className={styles.tileMeta}>
                                            읽지 않은 메시지{" "}
                                            <b>{unreadChatCount}개</b>
                                        </p>
                                        <div className={styles.sectionList}>
                                            {MOCK_CHAT.recentMessages.map(
                                                (message, index) => (
                                                <div
                                                    key={index}
                                                    className={
                                                        styles.plainRow
                                                    }
                                                >
                                                    <div>
                                                        <div
                                                            className={
                                                                styles.plainRowTitle
                                                            }
                                                        >
                                                            {
                                                                message.senderName
                                                            }
                                                        </div>
                                                        <div
                                                            className={
                                                                styles.plainRowMeta
                                                            }
                                                        >
                                                            {message.timeText}{" "}
                                                            ·{" "}
                                                            {message.preview}
                                                        </div>
                                                    </div>
                                                    {message.extraSenderCount >
                                                        0 && (
                                                        <span
                                                            className={
                                                                styles.tag
                                                            }
                                                        >
                                                            +
                                                            {
                                                                message.extraSenderCount
                                                            }
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <p className={styles.tileMeta}>
                                        팀 생성 전입니다
                                    </p>
                                )}
                            </div>
                        </div>
                        )}
                    </div>

                    <div className={styles.bottomSection}>
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <div className={styles.sectionTitle}>
                                    최근 공지
                                </div>
                                <Link
                                    to="/user/notice"
                                    className={styles.sectionAction}
                                >
                                    전체보기
                                </Link>
                            </div>

                            {featuredNotice ? (
                                <div className={styles.noticeLayout}>
                                    <Link
                                        to={`/user/notice/${featuredNotice.noticeId}`}
                                        className={styles.noticeFeatured}
                                    >
                                        {featuredNotice.important ===
                                            "IMPORTANT" && (
                                            <span
                                                className={`${styles.tag} ${styles.tagMint}`}
                                            >
                                                중요
                                            </span>
                                        )}
                                        <div
                                            className={
                                                styles.noticeFeaturedTitle
                                            }
                                        >
                                            {featuredNotice.title}
                                        </div>
                                        {featuredNotice.content && (
                                            <p
                                                className={
                                                    styles.noticeFeaturedExcerpt
                                                }
                                            >
                                                {truncateText(
                                                    stripMarkdown(
                                                        featuredNotice.content
                                                    ),
                                                    80
                                                )}
                                            </p>
                                        )}
                                        <div
                                            className={
                                                styles.noticeFeaturedFoot
                                            }
                                        >
                                            <span
                                                className={
                                                    styles.noticeFeaturedMeta
                                                }
                                            >
                                                {featuredNotice.writer} ·{" "}
                                                {formatCreatedAt(
                                                    featuredNotice.createdAt
                                                )}
                                            </span>
                                            <span
                                                className={
                                                    styles.noticeFeaturedLink
                                                }
                                            >
                                                자세히 보기
                                            </span>
                                        </div>
                                    </Link>

                                    <div
                                        className={styles.noticeListCompact}
                                    >
                                        {restNotices.map((notice) => (
                                            <Link
                                                key={notice.noticeId}
                                                to={`/user/notice/${notice.noticeId}`}
                                                className={
                                                    styles.noticeCompactRow
                                                }
                                            >
                                                {notice.important ===
                                                    "IMPORTANT" && (
                                                    <span
                                                        className={`${styles.tag} ${styles.tagMint}`}
                                                    >
                                                        중요
                                                    </span>
                                                )}
                                                <div
                                                    className={
                                                        styles.plainRowTitle
                                                    }
                                                >
                                                    {notice.title}
                                                </div>
                                                <div
                                                    className={
                                                        styles.plainRowMeta
                                                    }
                                                >
                                                    {notice.writer} ·{" "}
                                                    {formatCreatedAt(
                                                        notice.createdAt
                                                    )}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <p className={styles.tileMeta}>
                                    등록된 공지가 없습니다.
                                </p>
                            )}
                        </div>
                    </div>
                </main>
            )}

            {teamRequiredModal && (
                <TeamRequiredModal
                    message={teamRequiredModal.message}
                    onClose={() => setTeamRequiredModal(null)}
                />
            )}
        </div>
    );
};

export default UserDashboard;
