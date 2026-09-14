// 관리자 대시보드 = 운영 도구.
// "지금 처리할 일"을 가장 크게 두고, 수치는 한 줄 요약, 아래에 고밀도 목록을 둔다.
// 팀 생성 전에는 팀·일지·채팅방이 아예 없으므로 관련 수치와 섹션을 만들지 않는다.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import Header from "../../../components/common/header/Header";
import TeamRequiredModal from "../../../components/common/modal/TeamRequiredModal";
import Skeleton from "../../../components/common/skeleton/Skeleton";
import EmptyState from "../../../components/common/empty/EmptyState";
import JournalCalendar from "../../../components/common/calendar/JournalCalendar";
import authStore from "../../../store/authStore";
import { requestAdminDashboard } from "../../../api/dashboardApi";
import { requestAdminStudentList } from "../../../api/studentApi";
import {
    requestAdminLogList,
    requestAdminJournalCalendar,
} from "../../../api/logApi";
import { requestNoticeList } from "../../../api/noticeApi";
import {
    formatCountdownTime,
    getCapstoneLogRemainingMs,
    isCapstoneLogTime,
} from "../../../utils/capstoneLogTime";
import { formatCreatedAt } from "../../../utils/format";
import { gradeLabels } from "../../../constants/team";
import { getAdminTeamCreationStatus } from "../../../utils/teamStatus";
import { setStoredAdminTeamCreated } from "../../../utils/adminTeamStatusStorage";
import { useUnreadChatCountContext } from "../../../hooks/unreadChatCountContext";
import styles from "./AdminDashboard.module.css";

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

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

const countSurveyProgress = (students, grade) => {
    const gradeStudents = students.filter((student) => student.grade === grade);

    return {
        responded: gradeStudents.filter((student) => student.surveyCompleted)
            .length,
        total: gradeStudents.length,
    };
};

const toPercent = (value, total) => (total ? (value / total) * 100 : 0);

// "2026-09-08" / "2026-09" 형태로 오늘 날짜를 만든다.
const toISODate = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
        date.getDate()
    ).padStart(2, "0")}`;
const toMonthString = (date) => toISODate(date).slice(0, 7);
const formatToday = (date) =>
    `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${
        WEEKDAY_LABELS[date.getDay()]
    })`;

const ProgressRow = ({ label, value, percent }) => (
    <div>
        <div className={styles.progressHead}>
            <span className={styles.progressLabel}>{label}</span>
            <span className={styles.progressValue}>{value}</span>
        </div>
        <div className={styles.progressTrack}>
            <div
                className={styles.progressFill}
                style={{ width: `${percent}%` }}
            />
        </div>
    </div>
);

const HomeSkeleton = () => (
    <>
        <div className={styles.pageHead}>
            <Skeleton width={120} height={26} />
            <Skeleton width={160} height={18} />
        </div>
        <div className={styles.topGrid}>
            <div>
                <Skeleton width={120} height={20} />
                <Skeleton height={56} style={{ marginTop: 16 }} />
                <Skeleton height={56} style={{ marginTop: 8 }} />
            </div>
            <div>
                <Skeleton height={40} />
                <Skeleton height={280} style={{ marginTop: 16 }} />
            </div>
        </div>
        <div className={styles.metrics}>
            <Skeleton width="100%" height={24} />
        </div>
        <div className={styles.bottomGrid}>
            <div>
                <Skeleton width={140} height={20} />
                <Skeleton height={44} style={{ marginTop: 14 }} />
                <Skeleton height={44} style={{ marginTop: 8 }} />
            </div>
            <div>
                <Skeleton width={100} height={20} />
                <Skeleton height={44} style={{ marginTop: 14 }} />
                <Skeleton height={44} style={{ marginTop: 8 }} />
            </div>
        </div>
    </>
);

const AdminDashboard = () => {
    const user = authStore((state) => state.user);
    const shouldReduceMotion = useReducedMotion();
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
    const [notices, setNotices] = useState([]);
    const [calendarDays, setCalendarDays] = useState([]);
    const [sectionErrors, setSectionErrors] = useState({});
    const [isDashboardLoading, setIsDashboardLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [error, setError] = useState("");
    const [teamRequiredModal, setTeamRequiredModal] = useState(null);

    const teamStatus = getAdminTeamCreationStatus(dashboard);
    const isTeamManageAccessible = teamStatus.teamManageAccessible;
    const { unreadChatCount } = useUnreadChatCountContext();

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

    // 학생·공지 섹션은 팀 생성 전에도 대시보드에 필요해서 항상 한 번만 불러온다.
    useEffect(() => {
        let ignore = false;

        const getStudentAndNoticeData = async () => {
            const [studentsResult, noticesResult] = await Promise.allSettled([
                requestAdminStudentList(),
                requestNoticeList(),
            ]);

            if (ignore) return;

            if (studentsResult.status === "fulfilled") {
                const students = studentsResult.value?.students ?? [];
                setSurveyProgress({
                    grade2: countSurveyProgress(students, "GRADE_2"),
                    grade3: countSurveyProgress(students, "GRADE_3"),
                });
            }

            if (noticesResult.status === "fulfilled") {
                setNotices(
                    Array.isArray(noticesResult.value)
                        ? noticesResult.value.slice(0, 3)
                        : []
                );
            }

            setSectionErrors((previousErrors) => {
                const nextErrors = { ...previousErrors };

                if (studentsResult.status === "fulfilled") {
                    delete nextErrors.students;
                } else {
                    nextErrors.students = "학생 현황을 불러오지 못했습니다.";
                }

                if (noticesResult.status === "fulfilled") {
                    delete nextErrors.notices;
                } else {
                    nextErrors.notices = "공지를 불러오지 못했습니다.";
                }

                return nextErrors;
            });
        };

        getStudentAndNoticeData();

        return () => {
            ignore = true;
        };
    }, []);

    // 팀이 확정된 뒤에만 일지·캘린더를 불러온다. 팀 생성 전에는 두 호출을 건너뛴다.
    useEffect(() => {
        if (!isTeamManageAccessible) {
            setJournalStatus({
                submittedTeamCount: 0,
                totalTeamCount: 0,
                notSubmittedTeamNames: [],
            });
            setCalendarDays([]);
            return undefined;
        }

        let ignore = false;

        const getJournalData = async () => {
            const [logsResult, calendarResult] = await Promise.allSettled([
                requestAdminLogList(),
                requestAdminJournalCalendar(),
            ]);

            if (ignore) return;

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
            }

            if (calendarResult.status === "fulfilled") {
                const rawDays = Array.isArray(calendarResult.value?.days)
                    ? calendarResult.value.days
                    : [];
                setCalendarDays(
                    rawDays.map((day) => ({
                        date: day.date,
                        ratio: day.totalTeamCount
                            ? day.submittedTeamCount / day.totalTeamCount
                            : null,
                    }))
                );
            }

            setSectionErrors((previousErrors) => {
                const nextErrors = { ...previousErrors };

                if (logsResult.status === "fulfilled") {
                    delete nextErrors.journal;
                } else {
                    nextErrors.journal = "일지 제출 현황을 불러오지 못했습니다.";
                }

                if (calendarResult.status === "fulfilled") {
                    delete nextErrors.calendar;
                } else {
                    nextErrors.calendar = "캘린더를 불러오지 못했습니다.";
                }

                return nextErrors;
            });
        };

        getJournalData();

        return () => {
            ignore = true;
        };
    }, [isTeamManageAccessible]);

    useEffect(() => {
        const timerId = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timerId);
    }, []);

    const nextGrade = !teamStatus.grade2TeamCreated
        ? "GRADE_2"
        : !teamStatus.grade3TeamCreated
          ? "GRADE_3"
          : null;
    const isSetup = Boolean(nextGrade);

    const blockTeamRequired = (event, message) => {
        if (isTeamManageAccessible) return;

        event.preventDefault();
        setTeamRequiredModal({ message });
    };

    const nextGradeSurvey =
        nextGrade === "GRADE_3" ? surveyProgress.grade3 : surveyProgress.grade2;
    const nextGradeSurveyPercent = Math.round(
        toPercent(nextGradeSurvey.responded, nextGradeSurvey.total)
    );
    const nextGradeRemaining = nextGradeSurvey.total - nextGradeSurvey.responded;

    const totalSurveyResponded =
        surveyProgress.grade2.responded + surveyProgress.grade3.responded;
    const totalSurveyTarget =
        surveyProgress.grade2.total + surveyProgress.grade3.total;

    const isLogTime = isCapstoneLogTime(currentTime);
    const notSubmittedCount = journalStatus.notSubmittedTeamNames.length;
    const countdownText = formatCountdownTime(
        getCapstoneLogRemainingMs(currentTime)
    );

    // 지금 처리해야 하는 것만 실제 데이터로 만든다 — 채울 내용이 없으면 빈 상태를 보여준다.
    const tasks = [];

    if (isSetup) {
        tasks.push({
            key: "team-create",
            tone: nextGradeRemaining > 0 ? "warn" : "info",
            label: `${gradeLabels[nextGrade]} 팀 생성`,
            desc:
                nextGradeRemaining > 0
                    ? `설문 ${nextGradeSurvey.responded} / ${nextGradeSurvey.total}명 응답 · ${nextGradeRemaining}명 미응답`
                    : "설문 응답이 모두 모였어요. 지금 AI 추천으로 팀을 만들 수 있어요.",
            actionText: `${gradeLabels[nextGrade]} 팀 생성하기`,
            to: "/admin/team-create",
            primary: true,
        });
    }

    if (!isSetup && isLogTime && notSubmittedCount > 0) {
        tasks.push({
            key: "journal",
            tone: "danger",
            label: `오늘 일지 미제출 ${notSubmittedCount}팀`,
            desc: `마감까지 ${countdownText} 남았어요.`,
            actionText: "제출 현황 보기",
            to: "/admin/log",
            primary: true,
        });
    }

    if (!isSetup && unreadChatCount > 0) {
        tasks.push({
            key: "chat",
            tone: "info",
            label: `안 읽은 팀 채팅 ${unreadChatCount}개`,
            desc: "학생 질문이 남아 있을 수 있어요.",
            to: "/admin/chat",
        });
    }

    // 오른쪽 하단은 최근 활동이 아니라 공지 확인에만 집중한다.
    const activities = [
        ...notices.map((notice) => ({
            key: `notice-${notice.id}`,
            kind: notice.important === "IMPORTANT" ? "important" : "notice",
            title: notice.title,
            meta: `공지 · ${notice.writer} · ${formatCreatedAt(
                notice.createdAt
            )}`,
            to: `/admin/notice/${notice.id}`,
        })),
    ];

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
                        <motion.div
                            className={styles.pageHead}
                            variants={sectionVariants}
                        >
                            <div>
                                <p className={styles.pageEyebrow}>
                                    캡스톤 운영 현황
                                </p>
                                <h1 className={styles.pageTitle}>
                                    {user?.name
                                        ? `${user.name} 선생님, 안녕하세요`
                                        : "선생님, 안녕하세요"}
                                </h1>
                                <p className={styles.pageDescription}>
                                    오늘 확인해야 할 팀 활동을 모아봤어요.
                                </p>
                            </div>
                            <span className={styles.pageMeta}>
                                {formatToday(currentTime)}
                            </span>
                        </motion.div>

                        <motion.div
                            className={`${styles.topGrid} ${
                                isSetup ? styles.topGridSetup : ""
                            }`}
                            variants={sectionVariants}
                        >
                            <section>
                                <div className={styles.sectionHead}>
                                    <h2 className={styles.sectionTitle}>
                                        지금 처리할 일
                                    </h2>
                                    {tasks.length > 0 && (
                                        <span className={styles.sectionAction}>
                                            {tasks.length}건
                                        </span>
                                    )}
                                </div>

                                {tasks.length === 0 ? (
                                    <p className={styles.emptyLine}>
                                        지금 처리할 일이 없어요. 아래에서 팀별
                                        현황과 공지를 확인해 보세요.
                                    </p>
                                ) : (
                                    <div className={styles.taskList}>
                                        {tasks.map((task) => (
                                            task.key === "chat" ? (
                                                <MotionLink
                                                    key={task.key}
                                                    to={task.to}
                                                    className={`${styles.task} ${styles.taskLink}`}
                                                    whileHover={
                                                        shouldReduceMotion
                                                            ? undefined
                                                            : { x: 5 }
                                                    }
                                                    whileTap={
                                                        shouldReduceMotion
                                                            ? undefined
                                                            : { scale: 0.99 }
                                                    }
                                                >
                                                    <span
                                                        className={styles.taskDot}
                                                        data-tone={task.tone}
                                                        aria-hidden="true"
                                                    />
                                                    <div className={styles.taskText}>
                                                        <p className={styles.taskLabel}>
                                                            {task.label}
                                                        </p>
                                                        <p className={styles.taskDesc}>
                                                            {task.desc}
                                                        </p>
                                                    </div>
                                                    <span
                                                        className={styles.taskChevron}
                                                        aria-hidden="true"
                                                    >
                                                        ›
                                                    </span>
                                                </MotionLink>
                                            ) : (
                                                <motion.div
                                                    key={task.key}
                                                    className={styles.task}
                                                    whileHover={
                                                        shouldReduceMotion
                                                            ? undefined
                                                            : { x: 5 }
                                                    }
                                                >
                                                    <span
                                                        className={styles.taskDot}
                                                        data-tone={task.tone}
                                                        aria-hidden="true"
                                                    />
                                                    <div className={styles.taskText}>
                                                        <p className={styles.taskLabel}>
                                                            {task.label}
                                                        </p>
                                                        <p className={styles.taskDesc}>
                                                            {task.desc}
                                                        </p>
                                                    </div>
                                                    <MotionLink
                                                        to={task.to}
                                                        className={`${styles.taskAction} ${
                                                            task.primary
                                                                ? styles.primaryCta
                                                                : styles.linkCta
                                                        }`}
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
                                                        onClick={(event) => {
                                                            // 팀 생성 화면으로 가는 길은 막지 않는다
                                                            if (isSetup) return;

                                                            blockTeamRequired(
                                                                event,
                                                                "팀 생성이 완료되면 이용할 수 있습니다."
                                                            );
                                                        }}
                                                    >
                                                        {task.actionText}
                                                    </MotionLink>
                                                </motion.div>
                                            )
                                        ))}
                                    </div>
                                )}
                            </section>

                            {!isSetup && (
                                <aside className={styles.sideCol}>
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
                            )}
                            <div className={styles.metrics}>
                            <MotionLink
                                to="/admin/student"
                                className={styles.metric}
                                whileHover={
                                    shouldReduceMotion ? undefined : { y: -3 }
                                }
                                whileTap={
                                    shouldReduceMotion
                                        ? undefined
                                        : { scale: 0.99 }
                                }
                            >
                                <span className={styles.metricLabel}>
                                    전체 학생
                                </span>
                                <span className={styles.metricValue}>
                                    {dashboard.totalStudentCount}
                                </span>
                                <span className={styles.metricSub}>
                                    2학년 {surveyProgress.grade2.total} · 3학년{" "}
                                    {surveyProgress.grade3.total}
                                </span>
                            </MotionLink>

                            {isSetup ? (
                                <MotionLink
                                    to="/admin/student"
                                    className={styles.metric}
                                    whileHover={
                                        shouldReduceMotion
                                            ? undefined
                                            : { y: -3 }
                                    }
                                    whileTap={
                                        shouldReduceMotion
                                            ? undefined
                                            : { scale: 0.99 }
                                    }
                                >
                                    <span className={styles.metricLabel}>
                                        설문 완료
                                    </span>
                                    <span className={styles.metricValue}>
                                        {totalSurveyResponded}
                                    </span>
                                    <span className={styles.metricSub}>
                                        / {totalSurveyTarget}명
                                    </span>
                                </MotionLink>
                            ) : (
                                <>
                                    <MotionLink
                                        to="/admin/team-manage"
                                        className={styles.metric}
                                        whileHover={
                                            shouldReduceMotion
                                                ? undefined
                                                : { y: -3 }
                                        }
                                        whileTap={
                                            shouldReduceMotion
                                                ? undefined
                                                : { scale: 0.99 }
                                        }
                                    >
                                        <span className={styles.metricLabel}>
                                            운영 중인 팀
                                        </span>
                                        <span className={styles.metricValue}>
                                            {dashboard.totalTeamCount}
                                        </span>
                                        <span className={styles.metricSub}>
                                            2학년 {dashboard.grade2TeamCount} ·
                                            3학년 {dashboard.grade3TeamCount}
                                        </span>
                                    </MotionLink>

                                    {isLogTime && (
                                        <MotionLink
                                            to="/admin/log"
                                            className={styles.metric}
                                            whileHover={
                                                shouldReduceMotion
                                                    ? undefined
                                                    : { y: -3 }
                                            }
                                            whileTap={
                                                shouldReduceMotion
                                                    ? undefined
                                                    : { scale: 0.99 }
                                            }
                                        >
                                            <span
                                                className={styles.metricLabel}
                                            >
                                                오늘 미제출
                                            </span>
                                            <span
                                                className={`${styles.metricValue} ${
                                                    notSubmittedCount > 0
                                                        ? styles.metricDanger
                                                        : ""
                                                }`}
                                            >
                                                {notSubmittedCount}
                                            </span>
                                            <span className={styles.metricSub}>
                                                / {journalStatus.totalTeamCount}팀
                                            </span>
                                        </MotionLink>
                                    )}

                                    <MotionLink
                                        to="/admin/chat"
                                        className={styles.metric}
                                        whileHover={
                                            shouldReduceMotion
                                                ? undefined
                                                : { y: -3 }
                                        }
                                        whileTap={
                                            shouldReduceMotion
                                                ? undefined
                                                : { scale: 0.99 }
                                        }
                                    >
                                        <span className={styles.metricLabel}>
                                            안 읽은 메시지
                                        </span>
                                        <span className={styles.metricValue}>
                                            {unreadChatCount}
                                        </span>
                                    </MotionLink>
                                </>
                            )}
                            </div>
                        </motion.div>

                        <motion.div
                            className={styles.bottomGrid}
                            variants={sectionVariants}
                        >
                            <section>
                                <div className={styles.sectionHead}>
                                    <h2 className={styles.sectionTitle}>
                                        {isSetup
                                            ? "설문 응답 현황"
                                            : "오늘 팀별 일지 제출"}
                                    </h2>
                                    <Link
                                        to={
                                            isSetup
                                                ? "/admin/student"
                                                : "/admin/log"
                                        }
                                        className={styles.sectionAction}
                                        onClick={(event) =>
                                            isSetup
                                                ? undefined
                                                : blockTeamRequired(
                                                      event,
                                                      "팀 생성이 완료되면 팀별 캡스톤 일지를 확인할 수 있습니다."
                                                  )
                                        }
                                    >
                                        전체보기
                                    </Link>
                                </div>

                                {isSetup ? (
                                    sectionErrors.students ? (
                                        <p className={styles.emptyLine}>
                                            {sectionErrors.students}
                                        </p>
                                    ) : (
                                        <div className={styles.progressList}>
                                            {["grade2", "grade3"].map((key) => {
                                                const grade =
                                                    surveyProgress[key];
                                                const remaining =
                                                    grade.total -
                                                    grade.responded;

                                                return (
                                                    <ProgressRow
                                                        key={key}
                                                        label={
                                                            key === "grade2"
                                                                ? "2학년"
                                                                : "3학년"
                                                        }
                                                        value={`${grade.responded} / ${grade.total}명 · ${
                                                            remaining === 0
                                                                ? "완료"
                                                                : `${remaining}명 미응답`
                                                        }`}
                                                        percent={toPercent(
                                                            grade.responded,
                                                            grade.total
                                                        )}
                                                    />
                                                );
                                            })}
                                        </div>
                                    )
                                ) : sectionErrors.journal ? (
                                    <p className={styles.emptyLine}>
                                        {sectionErrors.journal}
                                    </p>
                                ) : !isLogTime ? (
                                    <p className={styles.emptyLine}>
                                        오늘은 일지 작성일이 아니에요. 작성일에
                                        팀별 제출 현황이 여기에 표시됩니다.
                                    </p>
                                ) : (
                                    <div className={styles.rows}>
                                        {journalStatus.notSubmittedTeamNames
                                            .length === 0 ? (
                                            <p className={styles.emptyLine}>
                                                모든 팀이 오늘 일지를
                                                제출했어요.
                                            </p>
                                        ) : (
                                            journalStatus.notSubmittedTeamNames.map(
                                                (teamName) => (
                                                    <div
                                                        key={teamName}
                                                        className={styles.row}
                                                    >
                                                        <span
                                                            className={
                                                                styles.rowName
                                                            }
                                                        >
                                                            {teamName}
                                                        </span>
                                                        <span
                                                            className={`${styles.rowStatus} ${styles.statusDanger}`}
                                                        >
                                                            미제출
                                                        </span>
                                                    </div>
                                                )
                                            )
                                        )}
                                    </div>
                                )}
                            </section>

                            <section>
                                <div className={styles.sectionHead}>
                                    <h2 className={styles.sectionTitle}>
                                        공지
                                    </h2>
                                    <Link
                                        to="/admin/notice"
                                        className={styles.sectionAction}
                                    >
                                        전체보기
                                    </Link>
                                </div>

                                {sectionErrors.notices ? (
                                    <p className={styles.emptyLine}>
                                        {sectionErrors.notices}
                                    </p>
                                ) : activities.length === 0 ? (
                                    <p className={styles.emptyLine}>
                                        아직 등록된 공지가 없어요. 공지를 올리면
                                        여기에 표시됩니다.
                                    </p>
                                ) : (
                                    <div className={styles.rows}>
                                        {activities.map((activity) => (
                                            <MotionLink
                                                key={activity.key}
                                                to={activity.to}
                                                className={styles.activity}
                                                whileHover={
                                                    shouldReduceMotion
                                                        ? undefined
                                                        : { x: 5 }
                                                }
                                            >
                                                <span
                                                    className={
                                                        styles.activityDot
                                                    }
                                                    data-kind={activity.kind}
                                                    aria-hidden="true"
                                                />
                                                <span
                                                    className={
                                                        styles.activityBody
                                                    }
                                                >
                                                    <span
                                                        className={
                                                            styles.activityTitle
                                                        }
                                                    >
                                                        {activity.title}
                                                    </span>
                                                    <span
                                                        className={
                                                            styles.activityMeta
                                                        }
                                                    >
                                                        {activity.meta}
                                                    </span>
                                                </span>
                                            </MotionLink>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </motion.div>
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

export default AdminDashboard;
