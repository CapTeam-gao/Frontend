// Design/UserDashboard.html 반영.
// (사용자 요청으로 "내 팀" 위젯은 제거 — 팀 생성 여부와 무관하게 프로젝트 기획서/팀 채팅 2개만 노출)
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../components/common/header/Header";
import TeamRequiredModal from "../../../components/common/modal/TeamRequiredModal";
import { requestUserDashboard } from "../../../api/dashboardApi";
import { requestUserProjectPlan } from "../../../api/projectApi";
import { requestMyChannelSummaries } from "../../../api/chatApi";
import { requestNoticeList } from "../../../api/noticeApi";
import { normalizeProjectPlan } from "../../../utils/projectPlan";
import {
    formatCountdownTime,
    getCapstoneLogRemainingMs,
    getCapstoneLogUnavailableText,
    isCapstoneLogTime,
} from "../../../utils/capstoneLogTime";
import { formatChatTime } from "../../../utils/chat";
import { formatCreatedAt, stripMarkdown, truncateText } from "../../../utils/format";
import useUnreadChatCount from "../../../hooks/useUnreadChatCount";
import heroVisualPending from "../../../assets/images/dashboardHeroPuzzle.png";
import heroVisualDone from "../../../assets/images/dashboardHeroPuzzleUser.png";
import styles from "./UserDashboard.module.css";

const PROJECT_PLAN_FIELDS = [
    { key: "teamName", label: "팀명" },
    { key: "serviceName", label: "서비스명" },
    { key: "serviceSummary", label: "서비스 소개" },
];

const buildProjectPlanStatus = (projectPlan) => {
    const filledFields = PROJECT_PLAN_FIELDS.filter((field) =>
        projectPlan[field.key].trim()
    );
    const hasCoreFeature = projectPlan.coreFeatures.some((feature) =>
        feature.value.trim()
    );

    const incompleteItemLabels = PROJECT_PLAN_FIELDS.filter(
        (field) => !projectPlan[field.key].trim()
    ).map((field) => field.label);
    if (!hasCoreFeature) incompleteItemLabels.push("핵심 기능");

    return {
        completedCount: filledFields.length + (hasCoreFeature ? 1 : 0),
        totalCount: PROJECT_PLAN_FIELDS.length + 1,
        incompleteItemLabels,
    };
};

const UserDashboard = () => {
    const [dashboard, setDashboard] = useState({
        teamCreated: false,
        todayJournalSubmitted: false,
    });
    const [isDashboardLoading, setIsDashboardLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [error, setError] = useState("");
    const [teamRequiredModal, setTeamRequiredModal] = useState(null);
    const [projectPlanStatus, setProjectPlanStatus] = useState(null);
    const [recentMessages, setRecentMessages] = useState([]);
    const [notices, setNotices] = useState([]);
    const [sectionErrors, setSectionErrors] = useState({});
    const { unreadChatCount, lastUnreadEvent } = useUnreadChatCount({
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
        if (!dashboard.teamCreated) return;

        const getSectionData = async () => {
            const [planResult, chatResult] = await Promise.allSettled([
                requestUserProjectPlan(),
                requestMyChannelSummaries(),
            ]);

            const nextSectionErrors = {};

            if (planResult.status === "fulfilled") {
                setProjectPlanStatus(
                    buildProjectPlanStatus(
                        normalizeProjectPlan(planResult.value)
                    )
                );
            } else {
                nextSectionErrors.plan = "프로젝트 기획서를 불러오지 못했습니다.";
            }

            if (chatResult.status === "fulfilled") {
                const summaries = Array.isArray(chatResult.value)
                    ? chatResult.value
                    : [];
                setRecentMessages(
                    summaries
                        .filter((summary) => summary.lastMessage)
                        .map((summary) => ({
                            senderName: summary.lastMessage.senderName,
                            timeText: formatChatTime(
                                summary.lastMessage.createdAt
                            ),
                            preview:
                                summary.lastMessage.message ??
                                "파일을 보냈습니다.",
                            createdAt: summary.lastMessage.createdAt,
                        }))
                        .sort(
                            (a, b) =>
                                new Date(b.createdAt) - new Date(a.createdAt)
                        )
                        .slice(0, 2)
                );
            } else {
                nextSectionErrors.chat = "채팅 미리보기를 불러오지 못했습니다.";
            }

            setSectionErrors((prev) => ({ ...prev, ...nextSectionErrors }));
        };

        getSectionData();
    }, [dashboard.teamCreated]);

    useEffect(() => {
        if (!dashboard.teamCreated || !lastUnreadEvent) return;

        let ignore = false;

        requestMyChannelSummaries()
            .then((summaries) => {
                if (ignore) return;

                setRecentMessages(
                    (Array.isArray(summaries) ? summaries : [])
                        .filter((summary) => summary.lastMessage)
                        .map((summary) => ({
                            senderName: summary.lastMessage.senderName,
                            timeText: formatChatTime(
                                summary.lastMessage.createdAt
                            ),
                            preview:
                                summary.lastMessage.message ??
                                "파일을 보냈습니다.",
                            createdAt: summary.lastMessage.createdAt,
                        }))
                        .sort(
                            (a, b) =>
                                new Date(b.createdAt) - new Date(a.createdAt)
                        )
                        .slice(0, 2)
                );
                setSectionErrors((prev) => ({ ...prev, chat: undefined }));
            })
            .catch(() => {
                if (!ignore) {
                    setSectionErrors((prev) => ({
                        ...prev,
                        chat: "채팅 미리보기를 불러오지 못했습니다.",
                    }));
                }
            });

        return () => {
            ignore = true;
        };
    }, [dashboard.teamCreated, lastUnreadEvent]);

    useEffect(() => {
        const getNoticeData = async () => {
            try {
                const noticeList = await requestNoticeList();
                setNotices(Array.isArray(noticeList) ? noticeList.slice(0, 3) : []);
            } catch {
                setSectionErrors((prev) => ({
                    ...prev,
                    notices: "공지를 불러오지 못했습니다.",
                }));
            }
        };

        getNoticeData();
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
              title: (
                  <>
                      오늘{" "}
                      <span className={styles.heroTitleHighlight}>
                          캡스톤 일지
                      </span>
                      를 작성해주세요
                  </>
              ),
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
              title: (
                  <>
                      오늘{" "}
                      <span className={styles.heroTitleHighlight}>
                          캡스톤 일지
                      </span>{" "}
                      작성을 완료했어요
                  </>
              ),
              sub: "수고하셨습니다. 지난 일지는 언제든 다시 확인할 수 있습니다.",
              ctaText: "지난 일지 보기",
              ctaTo: "/user/log/result",
          }
        : {
              title: (
                  <>
                      지금은{" "}
                      <span className={styles.heroTitleHighlight}>
                          캡스톤 일지
                      </span>{" "}
                      작성 시간이 아니에요
                  </>
              ),
              sub: getCapstoneLogUnavailableText(currentTime),
              ctaText: "지난 일지 보기",
              ctaTo: "/user/log/result",
          };

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

                                {sectionErrors.plan ? (
                                    <p className={styles.tileDisabledMsg}>
                                        {sectionErrors.plan}
                                    </p>
                                ) : dashboard.teamCreated &&
                                  projectPlanStatus ? (
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
                                                            (projectPlanStatus.completedCount /
                                                                projectPlanStatus.totalCount) *
                                                            100
                                                        }%`,
                                                    }}
                                                />
                                            </div>
                                            <div
                                                className={styles.ratioLabel}
                                            >
                                                {
                                                    projectPlanStatus.completedCount
                                                }
                                                <span>
                                                    {" "}
                                                    /{" "}
                                                    {
                                                        projectPlanStatus.totalCount
                                                    }
                                                    항목
                                                </span>
                                            </div>
                                        </div>

                                        <div className={styles.sectionList}>
                                            {projectPlanStatus.incompleteItemLabels.length ===
                                            0 ? (
                                                <p
                                                    className={
                                                        styles.plainRowMeta
                                                    }
                                                >
                                                    모든 항목이 작성됐습니다.
                                                </p>
                                            ) : (
                                                projectPlanStatus.incompleteItemLabels.map(
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

                                {sectionErrors.chat ? (
                                    <p className={styles.tileDisabledMsg}>
                                        {sectionErrors.chat}
                                    </p>
                                ) : dashboard.teamCreated ? (
                                    <>
                                        <p className={styles.tileMeta}>
                                            읽지 않은 메시지{" "}
                                            <b>{unreadChatCount}개</b>
                                        </p>
                                        <div className={styles.sectionList}>
                                            {recentMessages.length === 0 ? (
                                                <p
                                                    className={
                                                        styles.tileMeta
                                                    }
                                                >
                                                    아직 대화가 없습니다.
                                                </p>
                                            ) : (
                                                recentMessages.map(
                                                    (message) => (
                                                        <div
                                                            key={
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
                                                                    {
                                                                        message.senderName
                                                                    }
                                                                </div>
                                                                <div
                                                                    className={
                                                                        styles.plainRowMeta
                                                                    }
                                                                >
                                                                    {
                                                                        message.timeText
                                                                    }{" "}
                                                                    ·{" "}
                                                                    {
                                                                        message.preview
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
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
                                        to={`/user/notice/${featuredNotice.id}`}
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
                                                key={notice.id}
                                                to={`/user/notice/${notice.id}`}
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
