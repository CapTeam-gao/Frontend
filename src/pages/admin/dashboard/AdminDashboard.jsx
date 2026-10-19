// Design/admin-home-v3.html, admin-home-v3-before-team.html 반영.
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../components/common/header/Header";
import Skeleton from "../../../components/common/skeleton/Skeleton";
import { requestAdminDashboard } from "../../../api/dashboardApi";
import { requestAdminStudentList } from "../../../api/studentApi";
import { requestAdminLogList } from "../../../api/logApi";
import { requestNoticeList } from "../../../api/noticeApi";
import authStore from "../../../store/authStore";
import {
    formatCapstoneLogDateTime,
    formatCountdownTime,
    getCapstoneLogRemainingMs,
    getNextCapstoneLogWindow,
    isCapstoneLogTime,
} from "../../../utils/capstoneLogTime";
import { formatCreatedAt, stripMarkdown, truncateText } from "../../../utils/format";
import { gradeLabels } from "../../../constants/team";
import { getAdminTeamCreationStatus } from "../../../utils/teamStatus";
import { setStoredAdminTeamCreated } from "../../../utils/adminTeamStatusStorage";
import { useUnreadChatCountContext } from "../../../hooks/unreadChatCountContext";
import useDelayedLoading from "../../../hooks/useDelayedLoading";
import styles from "./AdminDashboard.module.css";

import heroImage from "../../../assets/images/adminDashboardHeroV3.webp";
import waitingHeroImage from "../../../assets/images/adminWaitingHeroV3.webp";
import teamIcon from "../../../assets/images/adminTeamIcon.webp";
import journalIcon from "../../../assets/images/adminJournalIcon.webp";
import chatIcon from "../../../assets/images/adminChatIcon.webp";
import noticeIcon from "../../../assets/images/adminNoticeIcon.webp";
import grade2Icon from "../../../assets/images/adminGrade2Icon.webp";
import grade3Icon from "../../../assets/images/adminGrade3Icon.webp";

const countProgress = (students, grade) => {
    const gradeStudents = students.filter((student) => student.grade === grade);
    return {
        responded: gradeStudents.filter((student) => student.surveyCompleted).length,
        total: gradeStudents.length,
    };
};

const dateLabel = (date) => `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;

const LoadingView = () => (
    <div className={styles.skeleton} aria-label="대시보드를 불러오는 중">
        <Skeleton height={400} className={styles.heroSkeleton} />
        <div className={styles.skeletonCards}>{[0, 1, 2].map((item) => <Skeleton key={item} height={220} />)}</div>
        <div className={styles.skeletonSection}><Skeleton width={180} height={28} />{[0, 1, 2].map((item) => <Skeleton key={item} height={86} />)}</div>
    </div>
);

const DashboardError = ({ message, onRetry }) => (
    <section className={styles.dashboardError} role="alert">
        <span>불러오기 실패</span>
        <h1>대시보드를 불러오지 못했어요</h1>
        <p>{message}</p>
        <button type="button" className={styles.primaryButton} onClick={onRetry}>다시 시도</button>
    </section>
);

const SectionError = ({ message, onRetry }) => (
    <div className={styles.sectionError} role="alert">
        <strong>{message}</strong>
        <p>다른 기능은 그대로 이용할 수 있어요.</p>
        <button type="button" className={styles.ghostButton} onClick={onRetry}>다시 시도</button>
    </div>
);

const AdminDashboard = () => {
    const user = authStore((state) => state.user);
    const { unreadChatCount } = useUnreadChatCountContext();
    const [dashboard, setDashboard] = useState(null);
    const [surveyProgress, setSurveyProgress] = useState({
        GRADE_2: { responded: 0, total: 0 },
        GRADE_3: { responded: 0, total: 0 },
    });
    const [journalStatus, setJournalStatus] = useState(null);
    const [notices, setNotices] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const showLoading = useDelayedLoading(loading);
    const teamStatus = getAdminTeamCreationStatus(dashboard ?? {});
    const allTeamsCreated = teamStatus.teamManageAccessible;
    const nextGrade = !teamStatus.grade2TeamCreated ? "GRADE_2" : !teamStatus.grade3TeamCreated ? "GRADE_3" : null;
    const showSetup = Boolean(nextGrade);

    const loadDashboard = useCallback(async () => {
        setLoading(true);
        setErrors((previous) => ({ ...previous, dashboard: "" }));
        try {
            const result = await requestAdminDashboard({ force: true });
            setDashboard(result);
            setStoredAdminTeamCreated(getAdminTeamCreationStatus(result).teamManageAccessible);
        } catch {
            setErrors((previous) => ({ ...previous, dashboard: "대시보드 정보를 불러오지 못했어요." }));
        } finally {
            setLoading(false);
        }
    }, []);

    const loadStudents = useCallback(async () => {
        setErrors((previous) => ({ ...previous, students: "" }));
        try {
            const result = await requestAdminStudentList({ force: true });
            const students = result?.students ?? [];
            setSurveyProgress({
                GRADE_2: countProgress(students, "GRADE_2"),
                GRADE_3: countProgress(students, "GRADE_3"),
            });
        } catch {
            setErrors((previous) => ({ ...previous, students: "학생 현황을 불러오지 못했어요." }));
        }
    }, []);

    const loadNotices = useCallback(async () => {
        setErrors((previous) => ({ ...previous, notices: "" }));
        try {
            const result = await requestNoticeList();
            setNotices(Array.isArray(result) ? result.slice(0, 3) : []);
        } catch {
            setErrors((previous) => ({ ...previous, notices: "공지를 불러오지 못했어요." }));
        }
    }, []);

    const loadJournals = useCallback(async () => {
        setErrors((previous) => ({ ...previous, journal: "" }));
        try {
            const result = await requestAdminLogList();
            const journals = Array.isArray(result?.journals) ? result.journals : [];
            const notSubmittedTeamNames = journals.filter((journal) => !journal.submitted).map((journal) => `${gradeLabels[journal.grade] ?? ""} ${journal.teamName}`.trim());
            setJournalStatus({
                submittedCount: result?.submittedCount ?? 0,
                totalCount: result?.totalCount ?? 0,
                notSubmittedTeamNames,
            });
        } catch {
            setErrors((previous) => ({ ...previous, journal: "일지 제출 현황을 불러오지 못했어요." }));
        }
    }, []);

    useEffect(() => { loadDashboard(); loadStudents(); loadNotices(); }, [loadDashboard, loadStudents, loadNotices]);
    useEffect(() => {
        if (allTeamsCreated) loadJournals();
        else setJournalStatus(null);
    }, [allTeamsCreated, loadJournals]);
    useEffect(() => {
        const timer = window.setInterval(() => setCurrentTime(new Date()), 1000);
        return () => window.clearInterval(timer);
    }, []);

    const isLogTime = isCapstoneLogTime(currentTime);
    const journalCount = journalStatus?.notSubmittedTeamNames.length ?? 0;
    const nextLogDate = formatCapstoneLogDateTime(getNextCapstoneLogWindow(currentTime).startAt);
    const nextGradeProgress = nextGrade ? surveyProgress[nextGrade] : null;
    const nextGradeRemaining = nextGradeProgress ? Math.max(nextGradeProgress.total - nextGradeProgress.responded, 0) : 0;
    const nextGradeReady = Boolean(nextGradeProgress?.total && nextGradeRemaining === 0);
    const nextGradeHasStudents = Boolean(nextGradeProgress?.total);
    const userName = user?.name ? `${user.name} 선생님` : "선생님";

    const noticeItems = notices.map((notice) => ({
        ...notice,
        content: truncateText(stripMarkdown(notice.content ?? ""), 100),
    }));

    return (
        <div className={styles.page}>
            <a className={styles.skipLink} href="#admin-dashboard-main">본문으로 건너뛰기</a>
            <Header />
            <main id="admin-dashboard-main" className={styles.body}>
                {showLoading ? <LoadingView /> : errors.dashboard ? <DashboardError message={errors.dashboard} onRetry={loadDashboard} /> : dashboard && <>
                    {showSetup ? (
                        <section className={styles.setupHero}>
                            <div className={styles.setupCopy}>
                                <p className={styles.eyebrow}>{userName}, 안녕하세요</p>
                                <h1>{nextGradeReady ? <>{gradeLabels[nextGrade]} 설문 응답이<br />모두 모였어요</> : nextGradeHasStudents ? <>{gradeLabels[nextGrade]} 설문 응답을<br />확인해 주세요</> : <>{gradeLabels[nextGrade]} 학생 정보를<br />등록해 주세요</>}</h1>
                                <p className={styles.heroDescription}>{nextGradeReady ? <>지금 AI 추천으로 팀을 만들 수 있어요.<br />두 학년 팀이 모두 만들어지면<br />캡스톤 일지와 채팅 관리가 열려요.</> : nextGradeHasStudents ? <>설문 응답을 모아 팀을 만들 준비를 해요.<br />두 학년 팀이 모두 만들어지면<br />캡스톤 일지와 채팅 관리가 열려요.</> : <>학생 정보를 등록하고 설문 응답을 모아 주세요.<br />두 학년 팀이 모두 만들어지면<br />캡스톤 일지와 채팅 관리가 열려요.</>}</p>
                                <div className={styles.heroActions}>
                                    <Link className={styles.primaryButton} to={nextGradeReady ? "/admin/team-create" : "/admin/student"}>{nextGradeReady ? `${gradeLabels[nextGrade]} 팀 생성하기` : nextGradeRemaining > 0 ? "미응답 학생 보기" : "학생 관리"}</Link>
                                    <Link className={styles.ghostButton} to="/admin/student">학생 관리</Link>
                                </div>
                            </div>
                            <img className={styles.setupPhoto} src={waitingHeroImage} alt="팀 구성을 준비하는 학생들" />
                        </section>
                    ) : (
                        <section className={styles.hero}>
                            <img className={styles.heroPhoto} src={heroImage} alt="학생 팀이 함께 프로젝트를 진행하는 모습" />
                            <div className={styles.heroCopy}>
                                <p className={styles.eyebrow}>{userName}, 안녕하세요</p>
                                <h1>오늘 확인해야 할<br />팀 활동을 모아봤어요</h1>
                                <p className={styles.heroDescription}>일지 마감 전에 미제출 팀을 확인하고,<br />안 읽은 팀 채팅에 답해 주세요.</p>
                                <div className={styles.heroActions}>
                                    {isLogTime && <Link className={styles.primaryButton} to="/admin/log">일지 제출 현황 보기</Link>}
                                    <Link className={styles.ghostButton} to="/admin/chat">채팅 관리</Link>
                                </div>
                            </div>
                            <aside className={styles.notch}>
                                <span>{isLogTime && !errors.journal ? "오늘 일지 제출" : isLogTime ? "마감까지" : "다음 작성일"}</span>
                                <strong>{isLogTime && !errors.journal ? journalStatus ? `${journalStatus.submittedCount} / ${journalStatus.totalCount}팀` : "현황 불러오는 중" : isLogTime ? formatCountdownTime(getCapstoneLogRemainingMs(currentTime)) : nextLogDate}</strong>
                                {isLogTime && !errors.journal && <small>마감까지 {formatCountdownTime(getCapstoneLogRemainingMs(currentTime))}</small>}
                            </aside>
                        </section>
                    )}

                    {showSetup ? <section className={styles.setupSection}>
                        <div className={styles.sectionHeading}><div><h2>학년별 팀 생성 준비</h2><p>설문이 모두 모인 학년부터 팀을 만들 수 있어요</p></div></div>
                        {errors.students ? <SectionError message={errors.students} onRetry={loadStudents} /> : <div className={styles.gradeCards}>
                            {["GRADE_2", "GRADE_3"].map((grade, index) => {
                                const progress = surveyProgress[grade];
                                const created = grade === "GRADE_2" ? teamStatus.grade2TeamCreated : teamStatus.grade3TeamCreated;
                                const ready = progress.total > 0 && progress.responded === progress.total;
                                const remaining = Math.max(progress.total - progress.responded, 0);
                                return <article key={grade} className={`${styles.gradeCard} ${ready && !created ? styles.gradeReady : ""}`}>
                                    <img src={index === 0 ? grade2Icon : grade3Icon} alt="" />
                                    <span className={created ? styles.gradeCompleteTag : ready ? styles.gradeReadyTag : styles.gradeCollectingTag}>{created ? "팀 생성 완료" : ready ? "팀 생성 가능" : "설문 수집 중"}</span>
                                    <h3>{gradeLabels[grade]}</h3>
                                    <p>{progress.responded} / {progress.total}명 응답{remaining > 0 && ` · ${remaining}명 미응답`}</p>
                                    <div className={styles.progressTrack} role="progressbar" aria-label={`${gradeLabels[grade]} 설문 응답`} aria-valuemin="0" aria-valuemax={progress.total} aria-valuenow={progress.responded}><span style={{ width: `${progress.total ? (progress.responded / progress.total) * 100 : 0}%` }} /></div>
                                    {created ? <span className={styles.createdValue}>{dashboard[grade === "GRADE_2" ? "grade2TeamCount" : "grade3TeamCount"] ?? 0}팀 배정 완료</span> : ready ? <Link className={styles.primaryButton} to="/admin/team-create" state={{ grade }}>{gradeLabels[grade]} 팀 생성하기</Link> : remaining > 0 ? <Link className={styles.ghostButton} to="/admin/student">미응답 학생 보기</Link> : <Link className={styles.ghostButton} to="/admin/student">학생 정보 확인하기</Link>}
                                </article>;
                            })}
                        </div>}
                    </section> : <section className={styles.quickSection}>
                        <div className={styles.sectionHeading}><div><h2>운영 현황</h2><p>숫자를 누르면 바로 확인할 수 있어요</p></div></div>
                        <div className={styles.quickCards}>
                            <Link to="/admin/team-manage" className={styles.quickCard}>
                                <img src={teamIcon} alt="" /><span className={styles.arrow} aria-hidden="true">→</span>
                                <h3>팀 관리</h3><p className={styles.cardNumber}>{dashboard.totalTeamCount ?? 0}<small>팀</small></p>
                                <p className={styles.cardSub}>2학년 {dashboard.grade2TeamCount ?? 0}팀 · 3학년 {dashboard.grade3TeamCount ?? 0}팀</p>
                            </Link>
                            {errors.journal && isLogTime ? <article className={`${styles.quickCard} ${styles.quickCardMain}`}>
                                <img src={journalIcon} alt="" /><h3>오늘 일지 미제출</h3><p className={styles.cardError}>{errors.journal}</p><button type="button" className={styles.onGreenButton} onClick={loadJournals}>다시 시도</button>
                            </article> : <Link to="/admin/log" className={`${styles.quickCard} ${styles.quickCardMain}`}>
                                <img src={journalIcon} alt="" /><span className={styles.arrow} aria-hidden="true">→</span><h3>{isLogTime ? "오늘 일지 미제출" : "다음 일지 작성"}</h3>
                                <p className={styles.cardNumber}>{isLogTime ? journalStatus ? journalCount : "…" : nextLogDate}{isLogTime && <small>팀</small>}</p>
                                <p className={styles.cardSub}>{isLogTime ? journalStatus ? journalCount === 0 ? "모든 팀 제출 완료" : journalStatus.notSubmittedTeamNames.slice(0, 1).join("") + (journalCount > 1 ? ` 외 ${journalCount - 1}팀` : "") : "미제출 현황을 확인하고 있어요" : "작성 가능 시간에 맞춰 확인해 주세요"}</p>
                            </Link>}
                            <Link to="/admin/chat" className={styles.quickCard}>
                                <img src={chatIcon} alt="" /><span className={styles.arrow} aria-hidden="true">→</span>
                                <h3>안 읽은 팀 채팅</h3><p className={styles.cardNumber}>{unreadChatCount}<small>개</small></p>
                                <p className={styles.cardSub}>팀 채팅방 {dashboard.totalChatRoomCount ?? dashboard.activeChatRoomCount ?? 0}개</p>
                            </Link>
                        </div>
                    </section>}

                    <section className={styles.notices}>
                        <div className={styles.sectionHeading}><div><h2>공지</h2><p>최근에 올린 공지예요</p></div><div className={styles.noticeActions}><Link className={styles.ghostButtonSmall} to="/admin/notice">전체보기 →</Link><Link className={styles.primaryButtonSmall} to="/admin/notice/create">새 공지 작성</Link></div></div>
                        {errors.notices ? <SectionError message={errors.notices} onRetry={loadNotices} /> : noticeItems.length ? <div className={styles.noticeList}>{noticeItems.map((notice) => <Link key={notice.id} to={`/admin/notice/${notice.id}`} className={styles.noticePill}>
                            {notice.noticeType === "TEAM_RESULT" ? <img src={teamIcon} alt="" /> : notice.important === "IMPORTANT" ? <svg className={styles.noticeIcon} viewBox="0 0 24 24" aria-hidden="true"><path d="M4 14V9a1 1 0 0 1 1-1h3l8-4v14l-8-4H5a1 1 0 0 1-1-1Z" /><path d="m8 14 1.5 6h3L11 15M19 8l2-2m-2 9 2 2" /></svg> : <img src={noticeIcon} alt="" />}
                            <span className={styles.noticeContent}><strong>{notice.title}{notice.important === "IMPORTANT" && <em>중요</em>}</strong><span>{notice.content}</span></span>
                            <time>{notice.writer} · {formatCreatedAt(notice.createdAt)}</time>
                        </Link>)}</div> : <div className={styles.emptyNotice}><img src={noticeIcon} alt="" /><strong>아직 등록된 공지가 없어요</strong><p>새 공지를 작성하면 여기에 표시돼요.</p></div>}
                    </section>
                </>}
            </main>
            <footer className={styles.footer}>
                <div><Link to="/admin/dashboard" className={styles.footerBrand}>CapTeam</Link><p>AI가 캡스톤 팀을 만들고,<br />팀이 끝까지 함께 갈 수 있도록 돕는 서비스</p></div>
                <nav className={styles.footerLinks} aria-label="관리자 바로가기">
                    <div className={styles.footerGroup}><strong>팀 관리</strong><Link to="/admin/team-create">팀 생성</Link><Link to="/admin/student">학생 관리</Link></div>
                    <div className={styles.footerGroup}><strong>서비스 운영</strong><Link to="/admin/chat">채팅 관리</Link><Link to="/admin/log">캡스톤 일지</Link><Link to="/admin/notice">공지</Link></div>
                    <div className={styles.footerGroup}><strong>내 계정</strong><Link to="/admin/profile">내 프로필</Link></div>
                </nav>
                <small>© 2026 CapTeam. All rights reserved.</small>
            </footer>
        </div>
    );
};

export default AdminDashboard;
