// Design/AdminDashboard.html 반영.
// [임시 목데이터] 학생 현황 / 캡스톤 일지 제출 현황 / 팀별 채팅 미리보기 / 최근 공지는
// requestAdminStudentList·requestAdminLogList·requestNoticeList 등 실제 API 대신
// Design html 목업과 동일한 값을 하드코딩해서 우선 디자인만 맞춘 상태.
// 백엔드 연동 시 아래 MOCK_* 상수를 실제 API 응답으로 교체할 것.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../components/common/header/Header";
import TeamRequiredModal from "../../../components/common/modal/TeamRequiredModal";
import { requestAdminDashboard } from "../../../api/dashboardApi";
import {
    formatCountdownTime,
    getCapstoneLogRemainingMs,
    isCapstoneLogTime,
} from "../../../utils/capstoneLogTime";
import {
    formatCreatedAt,
    stripMarkdown,
    truncateText,
} from "../../../utils/format";
import { gradeLabels } from "../../../constants/team";
import { getAdminTeamCreationStatus } from "../../../utils/teamStatus";
import { setStoredAdminTeamCreated } from "../../../utils/adminTeamStatusStorage";
import useUnreadChatCount from "../../../hooks/useUnreadChatCount";
import heroVisualPending from "../../../assets/images/dashboardHeroPuzzle.png";
import heroVisualCreated from "../../../assets/images/dashboardHeroPuzzleUser.png";
import styles from "./AdminDashboard.module.css";

// Design/AdminDashboard.html(설문·팀 생성 진행 중 상태) 목데이터
const MOCK_SURVEY_PROGRESS = { respondedCount: 27, totalCount: 32 };

const PENDING_MOCK = {
    studentStatus: {
        totalStudentCount: 64,
        grade2Responded: 28,
        grade2Total: 32,
        grade3Responded: 27,
        grade3Total: 32,
    },
    journalStatus: {
        submittedTeamCount: 4,
        totalTeamCount: 6,
        notSubmittedTeamNames: ["2학년 3팀", "2학년 4팀"],
    },
    chat: {
        activeChatRoomCount: 4,
        unreadMessageCount: 2,
        recentMessages: [
            {
                teamName: "2학년 1팀",
                timeText: "10분 전",
                preview: "허재원: 오늘 회의는 7시에 할게요",
                extraSenderCount: 2,
            },
            {
                teamName: "3학년 4팀",
                timeText: "32분 전",
                preview: "파일 업로드: 기획서_초안.pdf",
                extraSenderCount: 1,
            },
        ],
    },
    notices: [
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
    ],
};

// Design/CreatedAdminDashboard.html(모든 학년 팀 생성 완료 상태) 목데이터
const ALL_CREATED_MOCK = {
    hero: {
        totalTeamCount: 6,
        grade2TeamCount: 4,
        grade3TeamCount: 2,
    },
    studentStatus: {
        totalStudentCount: 64,
        grade2Responded: 32,
        grade2Total: 32,
        grade3Responded: 32,
        grade3Total: 32,
    },
    journalStatus: {
        submittedTeamCount: 4,
        totalTeamCount: 6,
        notSubmittedTeamNames: ["2학년 3팀", "2학년 4팀"],
    },
    chat: {
        activeChatRoomCount: 6,
        unreadMessageCount: 3,
        recentMessages: [
            {
                teamName: "2학년 1팀",
                timeText: "10분 전",
                preview: "허재원: 오늘 회의는 7시에 할게요",
                extraSenderCount: 2,
            },
            {
                teamName: "3학년 2팀",
                timeText: "32분 전",
                preview: "파일 업로드: 기획서_초안.pdf",
                extraSenderCount: 1,
            },
        ],
    },
    notices: [
        {
            noticeId: 4,
            title: "3학년 팀 배정 결과 안내",
            content:
                "3학년 2개 팀의 최종 배정 결과와 팀장, 역할 구성을 공지 상세에서 확인할 수 있습니다.",
            important: "IMPORTANT",
            writer: "관리자",
            createdAt: "2026-07-25",
        },
        {
            noticeId: 1,
            title: "2학년 팀 배정 결과 안내",
            content: "",
            important: "NORMAL",
            writer: "관리자",
            createdAt: "2026-07-20",
        },
        {
            noticeId: 2,
            title: "캡스톤 일지 작성 시간 변경 안내",
            content: "",
            important: "NORMAL",
            writer: "관리자",
            createdAt: "2026-07-22",
        },
    ],
};

const AdminDashboard = () => {
    const [dashboard, setDashboard] = useState({
        teamCreated: false,
        grade2TeamCreated: false,
        grade3TeamCreated: false,
        totalTeamCount: 0,
        grade2TeamCount: 0,
        grade3TeamCount: 0,
        activeChatRoomCount: 0,
        journalNotSubmittedTeamCount: 0,
        totalStudentCount: 0,
        hasUnreadNotice: false,
    });
    const [isDashboardLoading, setIsDashboardLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [error, setError] = useState("");
    const [teamRequiredModal, setTeamRequiredModal] = useState(null);

    useEffect(() => {
        const getDashboardData = async () => {
            try {
                const dashboardData = await requestAdminDashboard();
                setDashboard((prevDashboard) => ({
                    ...prevDashboard,
                    ...dashboardData,
                }));
                setStoredAdminTeamCreated(
                    getAdminTeamCreationStatus(dashboardData)
                        .teamManageAccessible
                );
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

    const teamStatus = getAdminTeamCreationStatus(dashboard);
    const isTeamManageAccessible = teamStatus.teamManageAccessible;
    const nextGrade = !teamStatus.grade2TeamCreated
        ? "GRADE_2"
        : !teamStatus.grade3TeamCreated
        ? "GRADE_3"
        : null;
    const { unreadChatCount } = useUnreadChatCount({
        enabled: isTeamManageAccessible,
    });

    const blockTeamRequiredCard = (event, message) => {
        if (isTeamManageAccessible) return;

        event.preventDefault();
        setTeamRequiredModal({ message });
    };

    const nextGradeRespondedCount = MOCK_SURVEY_PROGRESS.respondedCount;
    const nextGradeTotalCount = MOCK_SURVEY_PROGRESS.totalCount;
    const nextGradeSurveyPercent = nextGradeTotalCount
        ? Math.round((nextGradeRespondedCount / nextGradeTotalCount) * 100)
        : 0;

    const mock = nextGrade ? PENDING_MOCK : ALL_CREATED_MOCK;
    const grade2NotResponded =
        mock.studentStatus.grade2Total - mock.studentStatus.grade2Responded;
    const grade3NotResponded =
        mock.studentStatus.grade3Total - mock.studentStatus.grade3Responded;

    const journalRatioPercent = mock.journalStatus.totalTeamCount
        ? (mock.journalStatus.submittedTeamCount /
              mock.journalStatus.totalTeamCount) *
          100
        : 0;

    const featuredNotice = mock.notices[0];
    const restNotices = mock.notices.slice(1, 3);

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
                                    관리자 대시보드
                                </div>

                                {nextGrade ? (
                                    <>
                                        <h1 className={styles.heroTitle}>
                                            <em>{gradeLabels[nextGrade]}</em>{" "}
                                            팀을 생성해주세요
                                        </h1>
                                        <p className={styles.heroSub}>
                                            설문 응답이 {nextGradeSurveyPercent}
                                            % 모였습니다. 지금 생성하면 AI가
                                            역할과 실력 균형을 고려해 팀을
                                            추천합니다.
                                        </p>

                                        <div className={styles.heroProgress}>
                                            <div
                                                className={
                                                    styles.heroProgressTrack
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles.heroProgressFill
                                                    }
                                                    style={{
                                                        width: `${nextGradeSurveyPercent}%`,
                                                    }}
                                                />
                                            </div>
                                            <div
                                                className={
                                                    styles.heroProgressLabel
                                                }
                                            >
                                                {gradeLabels[nextGrade]} 설문
                                                완료{" "}
                                                <b>
                                                    {nextGradeRespondedCount} /{" "}
                                                    {nextGradeTotalCount}명
                                                </b>{" "}
                                                · {nextGradeSurveyPercent}%
                                            </div>
                                        </div>

                                        <div className={styles.heroActions}>
                                            <Link
                                                to="/admin/team-create"
                                                className={styles.heroCta}
                                            >
                                                {gradeLabels[nextGrade]} 팀
                                                생성하기
                                            </Link>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <h1 className={styles.heroTitle}>
                                            이번 학기{" "}
                                            <em>
                                                {
                                                    ALL_CREATED_MOCK.hero
                                                        .totalTeamCount
                                                }
                                                팀
                                            </em>{" "}
                                            생성이 완료됐어요
                                        </h1>
                                        <p className={styles.heroSub}>
                                            2학년{" "}
                                            {
                                                ALL_CREATED_MOCK.hero
                                                    .grade2TeamCount
                                            }
                                            팀, 3학년{" "}
                                            {
                                                ALL_CREATED_MOCK.hero
                                                    .grade3TeamCount
                                            }
                                            팀이 모두 확정되어 프로젝트를 진행
                                            중입니다.
                                        </p>

                                        <div className={styles.heroProgress}>
                                            <div
                                                className={
                                                    styles.heroProgressTrack
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles.heroProgressFill
                                                    }
                                                    style={{ width: "100%" }}
                                                />
                                            </div>
                                            <div
                                                className={
                                                    styles.heroProgressLabel
                                                }
                                            >
                                                학생 설문 · 팀 생성 <b>완료</b>{" "}
                                                · 100%
                                            </div>
                                        </div>

                                        <div className={styles.heroActions}>
                                            <Link
                                                to="/admin/team-manage"
                                                className={styles.heroCta}
                                            >
                                                팀 관리 보기
                                            </Link>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className={styles.heroVisual}>
                                <img
                                    src={
                                        nextGrade
                                            ? heroVisualPending
                                            : heroVisualCreated
                                    }
                                    alt=""
                                />
                            </div>
                        </div>
                    </section>

                    <div className={styles.midSection}>
                        <div className={styles.sectionGrid}>
                            <div
                                className={`${styles.section} ${styles.sizeSm}`}
                            >
                                <div className={styles.sectionHeader}>
                                    <div className={styles.sectionTitle}>
                                        학생 현황
                                    </div>
                                    <Link
                                        to="/admin/student"
                                        className={styles.sectionAction}
                                    >
                                        학생 관리
                                    </Link>
                                </div>
                                <p className={styles.tileMeta}>
                                    전체{" "}
                                    <b>
                                        {mock.studentStatus.totalStudentCount}명
                                    </b>{" "}
                                    등록
                                </p>
                                <div className={styles.miniBars}>
                                    <div className={styles.miniBarRow}>
                                        <span className={styles.miniBarLabel}>
                                            2학년
                                        </span>
                                        <div className={styles.miniBarTrack}>
                                            <div
                                                className={styles.miniBarFill}
                                                style={{
                                                    width: `${
                                                        (mock.studentStatus
                                                            .grade2Responded /
                                                            mock.studentStatus
                                                                .grade2Total) *
                                                        100
                                                    }%`,
                                                }}
                                            />
                                        </div>
                                        <span className={styles.miniBarValue}>
                                            {mock.studentStatus.grade2Responded}
                                            /{mock.studentStatus.grade2Total}
                                        </span>
                                    </div>
                                    <div className={styles.miniBarRow}>
                                        <span className={styles.miniBarLabel}>
                                            3학년
                                        </span>
                                        <div className={styles.miniBarTrack}>
                                            <div
                                                className={styles.miniBarFill}
                                                style={{
                                                    width: `${
                                                        (mock.studentStatus
                                                            .grade3Responded /
                                                            mock.studentStatus
                                                                .grade3Total) *
                                                        100
                                                    }%`,
                                                }}
                                            />
                                        </div>
                                        <span className={styles.miniBarValue}>
                                            {mock.studentStatus.grade3Responded}
                                            /{mock.studentStatus.grade3Total}
                                        </span>
                                    </div>
                                </div>
                                <p className={styles.plainRowMeta}>
                                    설문 미제출 2학년 {grade2NotResponded}명 ·
                                    3학년 {grade3NotResponded}명
                                </p>
                            </div>

                            <div
                                className={`${styles.section} ${styles.sizeLg}`}
                            >
                                <div className={styles.sectionHeader}>
                                    <div className={styles.sectionTitle}>
                                        캡스톤 일지 제출 현황
                                    </div>
                                    <Link
                                        to="/admin/log"
                                        className={styles.sectionAction}
                                        onClick={(event) =>
                                            blockTeamRequiredCard(
                                                event,
                                                "팀 생성이 완료되면 팀별 캡스톤 일지를 확인할 수 있습니다."
                                            )
                                        }
                                    >
                                        전체보기
                                    </Link>
                                </div>
                                {isCapstoneLogTime(currentTime) ? (
                                    <>
                                        <div
                                            className={styles.ratioChart}
                                        >
                                            <div
                                                className={
                                                    styles.ratioTrack
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles.ratioFill
                                                    }
                                                    style={{
                                                        width: `${journalRatioPercent}%`,
                                                    }}
                                                />
                                            </div>
                                            <div
                                                className={
                                                    styles.ratioLabel
                                                }
                                            >
                                                {
                                                    mock.journalStatus
                                                        .submittedTeamCount
                                                }
                                                <span>
                                                    {" "}
                                                    /{" "}
                                                    {
                                                        mock.journalStatus
                                                            .totalTeamCount
                                                    }
                                                    팀
                                                </span>
                                            </div>
                                        </div>
                                        <p className={styles.countdownLine}>
                                            제출 마감까지{" "}
                                            <b>
                                                {formatCountdownTime(
                                                    getCapstoneLogRemainingMs(
                                                        currentTime
                                                    )
                                                )}
                                            </b>
                                        </p>
                                        <div className={styles.sectionList}>
                                            {mock.journalStatus.notSubmittedTeamNames.map(
                                                (teamName) => (
                                                    <div
                                                        key={teamName}
                                                        className={
                                                            styles.plainRow
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                styles.plainRowTitle
                                                            }
                                                        >
                                                            {teamName}
                                                        </div>
                                                        <span
                                                            className={`${styles.tag} ${styles.tagDanger}`}
                                                        >
                                                            미제출
                                                        </span>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <p className={styles.tileDisabledMsg}>
                                        오늘은 캡스톤 일지 작성일이 아닙니다.
                                    </p>
                                )}
                            </div>

                            <div
                                className={`${styles.section} ${styles.sizeMd}`}
                            >
                                <div className={styles.sectionHeader}>
                                    <div className={styles.sectionTitle}>
                                        팀별 채팅방
                                    </div>
                                    <Link
                                        to="/admin/chat"
                                        className={styles.sectionAction}
                                        onClick={(event) =>
                                            blockTeamRequiredCard(
                                                event,
                                                "팀 생성이 완료되면 팀별 채팅방을 확인할 수 있습니다."
                                            )
                                        }
                                    >
                                        채팅 관리
                                    </Link>
                                </div>
                                <p className={styles.tileMeta}>
                                    운영 중인 채팅방{" "}
                                    <b>{mock.chat.activeChatRoomCount}개</b> ·
                                    읽지 않은 메시지 {unreadChatCount}개
                                </p>
                                <div className={styles.sectionList}>
                                    {mock.chat.recentMessages.map(
                                        (message, index) => (
                                            <div
                                                key={index}
                                                className={styles.plainRow}
                                            >
                                                <div>
                                                    <div
                                                        className={
                                                            styles.plainRowTitle
                                                        }
                                                    >
                                                        {message.teamName}
                                                    </div>
                                                    <div
                                                        className={
                                                            styles.plainRowMeta
                                                        }
                                                    >
                                                        {message.timeText} ·{" "}
                                                        {message.preview}
                                                    </div>
                                                </div>
                                                {message.extraSenderCount >
                                                    0 && (
                                                    <span
                                                        className={styles.tag}
                                                    >
                                                        +
                                                        {
                                                            message.extraSenderCount
                                                        }
                                                    </span>
                                                )}
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.bottomSection}>
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <div className={styles.sectionTitle}>
                                    최근 공지
                                </div>
                                <Link
                                    to="/admin/notice"
                                    className={styles.sectionAction}
                                >
                                    전체보기
                                </Link>
                            </div>

                            {featuredNotice ? (
                                <div className={styles.noticeLayout}>
                                    <Link
                                        to={`/admin/notice/${featuredNotice.noticeId}`}
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

                                    <div className={styles.noticeListCompact}>
                                        {restNotices.map((notice) => (
                                            <Link
                                                key={notice.noticeId}
                                                to={`/admin/notice/${notice.noticeId}`}
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

export default AdminDashboard;
