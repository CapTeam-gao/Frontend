// Design/user-home.html 반영.
// 표시하는 값은 전부 실제 API가 내려주는 데이터로 한정한다 — 화면을 채우려고 없는 값을 만들지 않는다.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import Header from "../../../components/common/header/Header";
import TeamRequiredModal from "../../../components/common/modal/TeamRequiredModal";
import Skeleton from "../../../components/common/skeleton/Skeleton";
import EmptyState from "../../../components/common/empty/EmptyState";
import JournalCalendar from "../../../components/common/calendar/JournalCalendar";
import authStore from "../../../store/authStore";
import { requestUserDashboard } from "../../../api/dashboardApi";
import { requestUserProjectPlan } from "../../../api/projectApi";
import { requestUserLogList } from "../../../api/logApi";
import { requestNoticeList } from "../../../api/noticeApi";
import { normalizeProjectPlan } from "../../../utils/projectPlan";
import {
    formatCountdownTime,
    getCapstoneLogRemainingMs,
    getCapstoneLogUnavailableText,
    isCapstoneLogTime,
} from "../../../utils/capstoneLogTime";
import { formatCreatedAt, stripMarkdown, truncateText } from "../../../utils/format";
import { useUnreadChatCountContext } from "../../../hooks/unreadChatCountContext";
import styles from "./UserDashboard.module.css";

const MotionLink = motion.create(Link);
const dashboardVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.04 },
    },
};
const sectionVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 260, damping: 28 },
    },
};

const PROJECT_PLAN_FIELDS = [
    { key: "teamName", label: "팀명" },
    { key: "serviceName", label: "서비스명" },
    { key: "serviceSummary", label: "서비스 소개" },
];

const buildProjectPlanStatus = (projectPlan) => {
    const hasCoreFeature = projectPlan.coreFeatures.some((feature) =>
        feature.value.trim()
    );

    const incompleteItemLabels = PROJECT_PLAN_FIELDS.filter(
        (field) => !projectPlan[field.key].trim()
    ).map((field) => field.label);
    if (!hasCoreFeature) incompleteItemLabels.push("핵심 기능");

    return { incompleteItemLabels };
};

// "2026-09-08" / "2026-09" 형태로 오늘 날짜를 만든다.
const toISODate = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
        date.getDate()
    ).padStart(2, "0")}`;
const toMonthString = (date) => toISODate(date).slice(0, 7);

const ChevronIcon = () => (
    <svg
        className={styles.chevron}
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="m9 18 6-6-6-6" />
    </svg>
);

const HomeSkeleton = () => (
    <>
        <div className={styles.today}>
            <Skeleton width={80} height={18} />
            <Skeleton
                width="min(420px, 90%)"
                height={30}
                style={{ marginTop: 10 }}
            />
            <Skeleton
                width="min(360px, 70%)"
                height={20}
                style={{ marginTop: 12 }}
            />
            <Skeleton width={150} height={44} style={{ marginTop: 20 }} />
        </div>
        <div className={styles.grid}>
            <div>
                <Skeleton width={90} height={20} />
                <Skeleton height={52} style={{ marginTop: 14 }} />
                <Skeleton height={52} style={{ marginTop: 8 }} />
            </div>
            <div>
                <Skeleton height={270} />
            </div>
        </div>
        <div className={styles.notices}>
            <Skeleton width={60} height={20} />
            <Skeleton height={48} style={{ marginTop: 14 }} />
            <Skeleton height={48} style={{ marginTop: 8 }} />
        </div>
    </>
);

const UserDashboard = () => {
    const user = authStore((state) => state.user);
    const shouldReduceMotion = useReducedMotion();
    const [dashboard, setDashboard] = useState({
        teamCreated: false,
        todayJournalSubmitted: false,
    });
    const [isDashboardLoading, setIsDashboardLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [error, setError] = useState("");
    const [teamRequiredModal, setTeamRequiredModal] = useState(null);
    const [projectPlanStatus, setProjectPlanStatus] = useState(null);
    const [notices, setNotices] = useState([]);
    const [calendarDays, setCalendarDays] = useState([]);
    const [sectionErrors, setSectionErrors] = useState({});
    const { unreadChatCount } = useUnreadChatCountContext();

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

        let ignore = false;

        requestUserProjectPlan()
            .then((plan) => {
                if (ignore) return;
                setProjectPlanStatus(
                    buildProjectPlanStatus(normalizeProjectPlan(plan))
                );
            })
            .catch(() => {
                if (ignore) return;
                setSectionErrors((prev) => ({
                    ...prev,
                    plan: "불러오지 못했어요",
                }));
            });

        return () => {
            ignore = true;
        };
    }, [dashboard.teamCreated]);

    useEffect(() => {
        if (!dashboard.teamCreated) return undefined;

        let ignore = false;
        const thisMonth = toMonthString(new Date());

        requestUserLogList()
            .then((journals) => {
                if (ignore) return;

                const days = (Array.isArray(journals) ? journals : [])
                    .filter((journal) => journal.date?.startsWith(thisMonth))
                    .map((journal) => ({
                        date: journal.date,
                        ratio: journal.status === "COMPLETED" ? 1 : 0,
                    }));
                setCalendarDays(days);
            })
            .catch(() => {
                if (ignore) return;
                setSectionErrors((prev) => ({
                    ...prev,
                    calendar: "캘린더를 불러오지 못했습니다.",
                }));
            });

        return () => {
            ignore = true;
        };
    }, [dashboard.teamCreated]);

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

    const blockTeamRequired = (event, message) => {
        if (dashboard.teamCreated) return;

        event.preventDefault();
        setTeamRequiredModal({ message });
    };

    const canWriteLog = isCapstoneLogTime(currentTime);
    // 제목은 한 줄로 — 화면을 밀어내지 않도록 강제 개행하지 않는다.
    const hero = !dashboard.teamCreated
        ? {
              title: "팀이 만들어지면 바로 알려드릴게요",
              sub: "설문 제출이 끝났어요. 관리자가 AI로 팀을 만들면 이 화면에서 팀원과 일정을 확인할 수 있어요.",
              ctaText: "공지 확인하기",
              ctaTo: "/user/notice",
          }
        : canWriteLog && !dashboard.todayJournalSubmitted
          ? {
                title: "오늘 캡스톤 일지를 작성할 시간이에요",
                sub: "오늘 활동 내용을 남기면 팀원 일지와 함께 자동으로 취합돼요.",
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
                  title: "오늘 일지를 제출했어요",
                  sub: "수고했어요. 지난 일지는 언제든 다시 볼 수 있어요.",
                  ctaText: "지난 일지 보기",
                  ctaTo: "/user/log/result",
              }
            : {
                  title: "오늘은 캡스톤 일지 작성일이 아니에요",
                  sub: getCapstoneLogUnavailableText(currentTime),
                  ctaText: "지난 일지 보기",
                  ctaTo: "/user/log/result",
              };

    // 이번 달 캘린더 데이터에서 바로 계산 — 추가 조회를 하지 않는다.
    const submittedThisMonth = calendarDays.filter(
        (day) => day.ratio === 1
    ).length;

    const incompleteLabels = projectPlanStatus?.incompleteItemLabels ?? [];
    const projectPlanValue = sectionErrors.plan
        ? { text: sectionErrors.plan, isWarning: true }
        : !projectPlanStatus
          ? null
          : incompleteLabels.length === 0
            ? { text: "작성 완료", isWarning: false }
            : {
                  text:
                      incompleteLabels.length === 1
                          ? `${incompleteLabels[0]} 미작성`
                          : `${incompleteLabels.length}개 항목 미작성`,
                  isWarning: true,
              };

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.body}>
                {isDashboardLoading ? (
                    <HomeSkeleton />
                ) : error ? (
                    <EmptyState
                        variant="error"
                        title="대시보드를 불러오지 못했어요"
                        description={error}
                    />
                ) : (
                    <motion.div
                        initial={shouldReduceMotion ? false : "hidden"}
                        animate="visible"
                        variants={dashboardVariants}
                    >
                        {/* 오늘 해야 할 행동 하나를 가장 먼저 */}
                        <motion.section
                            className={styles.today}
                            variants={sectionVariants}
                        >
                            <div className={styles.todayCopy}>
                                <p className={styles.greeting}>오늘의 캡스톤</p>
                                <h1 className={styles.headline}>
                                    {user?.name
                                        ? `${user.name} 님, 안녕하세요`
                                        : "안녕하세요"}
                                </h1>
                                <p className={styles.todayTitle}>{hero.title}</p>
                                <p className={styles.subline}>{hero.sub}</p>
                            </div>

                            <div className={styles.actions}>
                                <MotionLink
                                    to={hero.ctaTo}
                                    className={styles.primaryCta}
                                    whileHover={
                                        shouldReduceMotion ? undefined : { y: -2 }
                                    }
                                    whileTap={
                                        shouldReduceMotion
                                            ? undefined
                                            : { scale: 0.98 }
                                    }
                                    transition={{
                                        type: "spring",
                                        stiffness: 420,
                                        damping: 28,
                                    }}
                                    onClick={(event) =>
                                        blockTeamRequired(
                                            event,
                                            "팀 생성이 완료되면 캡스톤 일지를 작성할 수 있습니다."
                                        )
                                    }
                                >
                                    {hero.ctaText}
                                </MotionLink>
                                {hero.noteText && (
                                    <MotionLink
                                        to={hero.noteTo}
                                        className={styles.secondaryCta}
                                        whileHover={
                                            shouldReduceMotion
                                                ? undefined
                                                : { y: -2 }
                                        }
                                        whileTap={
                                            shouldReduceMotion
                                                ? undefined
                                                : { scale: 0.98 }
                                        }
                                    >
                                        {hero.noteText}
                                    </MotionLink>
                                )}
                                {hero.countdownText && (
                                    <span className={styles.deadline}>
                                        마감까지
                                        <span className={styles.deadlineValue}>
                                            {hero.countdownText}
                                        </span>
                                    </span>
                                )}
                            </div>
                        </motion.section>

                        {/* 팀 생성 전에는 기획서·채팅·일지가 아예 없으므로 만들지 않는다 */}
                        {dashboard.teamCreated && (
                            <motion.div
                                className={styles.grid}
                                variants={sectionVariants}
                            >
                                <section>
                                    <div className={styles.sectionHead}>
                                        <h2 className={styles.sectionTitle}>
                                            내 캡스톤
                                        </h2>
                                    </div>

                                    <div className={styles.rows}>
                                        <MotionLink
                                            to="/user/project"
                                            className={styles.row}
                                            whileHover={
                                                shouldReduceMotion
                                                    ? undefined
                                                    : { x: 6 }
                                            }
                                        >
                                            <span className={styles.rowLabel}>
                                                프로젝트 기획서
                                            </span>
                                            <span className={styles.rowValue}>
                                                {projectPlanValue && (
                                                    <span
                                                        className={
                                                            projectPlanValue.isWarning
                                                                ? styles.valueWarning
                                                                : styles.valueStrong
                                                        }
                                                    >
                                                        {projectPlanValue.text}
                                                    </span>
                                                )}
                                                <ChevronIcon />
                                            </span>
                                        </MotionLink>

                                        <MotionLink
                                            to="/user/chat"
                                            className={styles.row}
                                            whileHover={
                                                shouldReduceMotion
                                                    ? undefined
                                                    : { x: 6 }
                                            }
                                        >
                                            <span className={styles.rowLabel}>
                                                팀 채팅
                                            </span>
                                            <span className={styles.rowValue}>
                                                <span
                                                    className={
                                                        unreadChatCount > 0
                                                            ? styles.valueStrong
                                                            : undefined
                                                    }
                                                >
                                                    안 읽은 메시지{" "}
                                                    {unreadChatCount}
                                                </span>
                                                <ChevronIcon />
                                            </span>
                                        </MotionLink>

                                        <MotionLink
                                            to="/user/log/result"
                                            className={styles.row}
                                            whileHover={
                                                shouldReduceMotion
                                                    ? undefined
                                                    : { x: 6 }
                                            }
                                        >
                                            <span className={styles.rowLabel}>
                                                지난 일지
                                            </span>
                                            <span className={styles.rowValue}>
                                                <span
                                                    className={
                                                        styles.valueStrong
                                                    }
                                                >
                                                    이번 달 {submittedThisMonth}
                                                    회 작성
                                                </span>
                                                <ChevronIcon />
                                            </span>
                                        </MotionLink>
                                    </div>
                                </section>

                                <aside>
                                    {sectionErrors.calendar ? (
                                        <p className={styles.emptyLine}>
                                            {sectionErrors.calendar}
                                        </p>
                                    ) : (
                                        <JournalCalendar
                                            month={toMonthString(currentTime)}
                                            days={calendarDays}
                                            todayISO={toISODate(currentTime)}
                                        />
                                    )}
                                </aside>
                            </motion.div>
                        )}

                        {/* 공지는 메일함처럼 — 중요 표시는 배지가 아니라 점으로 */}
                        <motion.section
                            className={styles.notices}
                            variants={sectionVariants}
                        >
                            <div className={styles.sectionHead}>
                                <h2 className={styles.sectionTitle}>공지</h2>
                                <Link
                                    to="/user/notice"
                                    className={styles.sectionAction}
                                >
                                    전체보기
                                </Link>
                            </div>

                            {sectionErrors.notices ? (
                                <p className={styles.emptyLine}>
                                    {sectionErrors.notices}
                                </p>
                            ) : notices.length === 0 ? (
                                <p className={styles.emptyLine}>
                                    아직 등록된 공지가 없어요. 새 공지가
                                    올라오면 여기에서 바로 확인할 수 있어요.
                                </p>
                            ) : (
                                <div>
                                    {notices.map((notice) => {
                                        const isImportant =
                                            notice.important === "IMPORTANT";

                                        return (
                                            <MotionLink
                                                key={notice.id}
                                                to={`/user/notice/${notice.id}`}
                                                className={styles.noticeRow}
                                                whileHover={
                                                    shouldReduceMotion
                                                        ? undefined
                                                        : { x: 6 }
                                                }
                                            >
                                                <span
                                                    className={`${styles.noticeDot} ${
                                                        isImportant
                                                            ? styles.noticeDotImportant
                                                            : ""
                                                    }`}
                                                    aria-hidden="true"
                                                />
                                                <span
                                                    className={
                                                        styles.noticeBody
                                                    }
                                                >
                                                    <span
                                                        className={`${styles.noticeTitle} ${
                                                            isImportant
                                                                ? styles.noticeTitleImportant
                                                                : ""
                                                        }`}
                                                    >
                                                        {notice.title}
                                                    </span>
                                                    {notice.content && (
                                                            <span
                                                                className={
                                                                    styles.noticeExcerpt
                                                                }
                                                            >
                                                                {truncateText(
                                                                    stripMarkdown(
                                                                        notice.content
                                                                    ),
                                                                    80
                                                                )}
                                                            </span>
                                                        )}
                                                </span>
                                                <span
                                                    className={
                                                        styles.noticeMeta
                                                    }
                                                >
                                                    {formatCreatedAt(
                                                        notice.createdAt
                                                    )}
                                                </span>
                                            </MotionLink>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.section>
                    </motion.div>
                )}
            </main>

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
