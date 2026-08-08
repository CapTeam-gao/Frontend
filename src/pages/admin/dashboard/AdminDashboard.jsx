// Design/AdminDashboard.html 반영.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../components/common/header/Header";
import TeamRequiredModal from "../../../components/common/modal/TeamRequiredModal";
import { requestAdminDashboard } from "../../../api/dashboardApi";
import { requestAdminStudentList } from "../../../api/studentApi";
import { requestAdminLogList } from "../../../api/logApi";
import {
    requestAdminChannelSummaries,
    requestAdminChatRooms,
} from "../../../api/adminChatApi";
import { requestNoticeList } from "../../../api/noticeApi";
import {
    formatCountdownTime,
    getCapstoneLogRemainingMs,
    isCapstoneLogTime,
} from "../../../utils/capstoneLogTime";
import { formatChatTime } from "../../../utils/chat";
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

const countSurveyProgress = (students, grade) => {
    const gradeStudents = students.filter((student) => student.grade === grade);

    return {
        responded: gradeStudents.filter((student) => student.surveyCompleted)
            .length,
        total: gradeStudents.length,
    };
};

// 채팅방 목록에서 각 방의 마지막 메시지를 병렬로 가져온다(방 개수가 적어 N+1이어도 무해함).
const fetchRecentMessages = async (rooms) => {
    const previews = await Promise.all(
        rooms.map(async (room) => {
            const firstChannel = room.channels?.[0];
            if (!firstChannel) return null;

            const summaries = await requestAdminChannelSummaries(
                room.id
            ).catch(() => []);
            const lastMessage = summaries?.[0]?.lastMessage;

            if (!lastMessage) return null;

            return {
                teamName: room.teamName,
                timeText: formatChatTime(lastMessage.createdAt),
                preview: `${lastMessage.senderName}: ${
                    lastMessage.message ?? "파일을 보냈습니다."
                }`,
                createdAt: lastMessage.createdAt,
            };
        })
    );

    return previews
        .filter(Boolean)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 2);
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
    const [surveyProgress, setSurveyProgress] = useState({
        grade2: { responded: 0, total: 0 },
        grade3: { responded: 0, total: 0 },
    });
    const [journalStatus, setJournalStatus] = useState({
        submittedTeamCount: 0,
        totalTeamCount: 0,
        notSubmittedTeamNames: [],
    });
    const [recentMessages, setRecentMessages] = useState([]);
    const [notices, setNotices] = useState([]);
    const [sectionErrors, setSectionErrors] = useState({});
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
        const getSectionData = async () => {
            const [studentsResult, logsResult, roomsResult, noticesResult] =
                await Promise.allSettled([
                    requestAdminStudentList(),
                    requestAdminLogList(),
                    requestAdminChatRooms(),
                    requestNoticeList(),
                ]);

            const nextSectionErrors = {};

            if (studentsResult.status === "fulfilled") {
                const students = studentsResult.value?.students ?? [];
                setSurveyProgress({
                    grade2: countSurveyProgress(students, "GRADE_2"),
                    grade3: countSurveyProgress(students, "GRADE_3"),
                });
            } else {
                nextSectionErrors.students = "학생 현황을 불러오지 못했습니다.";
            }

            if (logsResult.status === "fulfilled") {
                const logData = logsResult.value;
                const journals = Array.isArray(logData?.journals)
                    ? logData.journals
                    : [];
                setJournalStatus({
                    submittedTeamCount: logData?.submittedCount ?? 0,
                    totalTeamCount: logData?.totalCount ?? 0,
                    notSubmittedTeamNames: journals
                        .filter((journal) => !journal.submitted)
                        .map(
                            (journal) =>
                                `${gradeLabels[journal.grade] ?? ""} ${
                                    journal.teamName
                                }`
                        ),
                });
            } else {
                nextSectionErrors.journal = "일지 제출 현황을 불러오지 못했습니다.";
            }

            if (roomsResult.status === "fulfilled") {
                const rooms = Array.isArray(roomsResult.value)
                    ? roomsResult.value
                    : [];
                setRecentMessages(await fetchRecentMessages(rooms));
            } else {
                nextSectionErrors.chat = "채팅 미리보기를 불러오지 못했습니다.";
            }

            if (noticesResult.status === "fulfilled") {
                setNotices(
                    Array.isArray(noticesResult.value)
                        ? noticesResult.value.slice(0, 3)
                        : []
                );
            } else {
                nextSectionErrors.notices = "공지를 불러오지 못했습니다.";
            }

            setSectionErrors(nextSectionErrors);
        };

        getSectionData();
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

    const nextGradeSurvey =
        nextGrade === "GRADE_3"
            ? surveyProgress.grade3
            : surveyProgress.grade2;
    const nextGradeRespondedCount = nextGradeSurvey.responded;
    const nextGradeTotalCount = nextGradeSurvey.total;
    const nextGradeSurveyPercent = nextGradeTotalCount
        ? Math.round((nextGradeRespondedCount / nextGradeTotalCount) * 100)
        : 0;

    const grade2NotResponded =
        surveyProgress.grade2.total - surveyProgress.grade2.responded;
    const grade3NotResponded =
        surveyProgress.grade3.total - surveyProgress.grade3.responded;

    const journalRatioPercent = journalStatus.totalTeamCount
        ? (journalStatus.submittedTeamCount / journalStatus.totalTeamCount) *
          100
        : 0;

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
                                            <em>{dashboard.totalTeamCount}팀</em>{" "}
                                            생성이 완료됐어요
                                        </h1>
                                        <p className={styles.heroSub}>
                                            2학년 {dashboard.grade2TeamCount}
                                            팀, 3학년 {dashboard.grade3TeamCount}
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
                                {sectionErrors.students ? (
                                    <p className={styles.tileDisabledMsg}>
                                        {sectionErrors.students}
                                    </p>
                                ) : (
                                    <>
                                        <p className={styles.tileMeta}>
                                            전체{" "}
                                            <b>
                                                {dashboard.totalStudentCount}명
                                            </b>{" "}
                                            등록
                                        </p>
                                        <div className={styles.miniBars}>
                                            <div className={styles.miniBarRow}>
                                                <span
                                                    className={
                                                        styles.miniBarLabel
                                                    }
                                                >
                                                    2학년
                                                </span>
                                                <div
                                                    className={
                                                        styles.miniBarTrack
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            styles.miniBarFill
                                                        }
                                                        style={{
                                                            width: `${
                                                                surveyProgress
                                                                    .grade2
                                                                    .total
                                                                    ? (surveyProgress
                                                                          .grade2
                                                                          .responded /
                                                                          surveyProgress
                                                                              .grade2
                                                                              .total) *
                                                                      100
                                                                    : 0
                                                            }%`,
                                                        }}
                                                    />
                                                </div>
                                                <span
                                                    className={
                                                        styles.miniBarValue
                                                    }
                                                >
                                                    {surveyProgress.grade2.responded}
                                                    /{surveyProgress.grade2.total}
                                                </span>
                                            </div>
                                            <div className={styles.miniBarRow}>
                                                <span
                                                    className={
                                                        styles.miniBarLabel
                                                    }
                                                >
                                                    3학년
                                                </span>
                                                <div
                                                    className={
                                                        styles.miniBarTrack
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            styles.miniBarFill
                                                        }
                                                        style={{
                                                            width: `${
                                                                surveyProgress
                                                                    .grade3
                                                                    .total
                                                                    ? (surveyProgress
                                                                          .grade3
                                                                          .responded /
                                                                          surveyProgress
                                                                              .grade3
                                                                              .total) *
                                                                      100
                                                                    : 0
                                                            }%`,
                                                        }}
                                                    />
                                                </div>
                                                <span
                                                    className={
                                                        styles.miniBarValue
                                                    }
                                                >
                                                    {surveyProgress.grade3.responded}
                                                    /{surveyProgress.grade3.total}
                                                </span>
                                            </div>
                                        </div>
                                        <p className={styles.plainRowMeta}>
                                            설문 미제출 2학년{" "}
                                            {grade2NotResponded}명 · 3학년{" "}
                                            {grade3NotResponded}명
                                        </p>
                                    </>
                                )}
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
                                {sectionErrors.journal ? (
                                    <p className={styles.tileDisabledMsg}>
                                        {sectionErrors.journal}
                                    </p>
                                ) : isCapstoneLogTime(currentTime) ? (
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
                                                        width: `${journalRatioPercent}%`,
                                                    }}
                                                />
                                            </div>
                                            <div
                                                className={styles.ratioLabel}
                                            >
                                                {journalStatus.submittedTeamCount}
                                                <span>
                                                    {" "}
                                                    /{" "}
                                                    {journalStatus.totalTeamCount}
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
                                            {journalStatus.notSubmittedTeamNames.map(
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
                                    <b>{dashboard.activeChatRoomCount}개</b> ·
                                    읽지 않은 메시지 {unreadChatCount}개
                                </p>
                                {sectionErrors.chat ? (
                                    <p className={styles.tileDisabledMsg}>
                                        {sectionErrors.chat}
                                    </p>
                                ) : (
                                    <div className={styles.sectionList}>
                                        {recentMessages.length === 0 ? (
                                            <p className={styles.tileMeta}>
                                                아직 대화가 없습니다.
                                            </p>
                                        ) : (
                                            recentMessages.map((message) => (
                                                <div
                                                    key={
                                                        message.teamName +
                                                        message.createdAt
                                                    }
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
                                                            {message.teamName}
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
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
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

                            {sectionErrors.notices ? (
                                <p className={styles.tileMeta}>
                                    {sectionErrors.notices}
                                </p>
                            ) : featuredNotice ? (
                                <div className={styles.noticeLayout}>
                                    <Link
                                        to={`/admin/notice/${featuredNotice.id}`}
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
                                                key={notice.id}
                                                to={`/admin/notice/${notice.id}`}
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
