// Design/user-home-v3.html, user-home-v3-before-team.html 반영.
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../components/common/header/Header";
import Skeleton from "../../../components/common/skeleton/Skeleton";
import authStore from "../../../store/authStore";
import { requestUserDashboard } from "../../../api/dashboardApi";
import { requestUserProjectPlan } from "../../../api/projectApi";
import { requestUserLogList } from "../../../api/logApi";
import { requestNoticeList } from "../../../api/noticeApi";
import { normalizeProjectPlan } from "../../../utils/projectPlan";
import {
    formatCountdownTime,
    formatCapstoneLogDateTime,
    getCapstoneLogRemainingMs,
    getCapstoneLogUnavailableText,
    getNextCapstoneLogWindow,
    isCapstoneLogTime,
} from "../../../utils/capstoneLogTime";
import { formatCreatedAt, stripMarkdown, truncateText } from "../../../utils/format";
import { useUnreadChatCountContext } from "../../../hooks/unreadChatCountContext";
import useDelayedLoading from "../../../hooks/useDelayedLoading";
import styles from "./UserDashboard.module.css";

import heroImage from "../../../assets/images/dashboardHeroV3.webp";
import waitingHeroImage from "../../../assets/images/dashboardWaitingHeroV3.webp";
import projectIcon from "../../../assets/images/dashboardProjectIcon.webp";
import chatIcon from "../../../assets/images/dashboardChatIcon.webp";
import logIcon from "../../../assets/images/dashboardLogIcon.webp";
import noticeIcon from "../../../assets/images/dashboardNoticeIcon.webp";
import surveyStepIcon from "../../../assets/images/dashboardSurveyStepIcon.webp";
import matchStepIcon from "../../../assets/images/dashboardMatchStepIcon.webp";
import activityStepIcon from "../../../assets/images/dashboardActivityStepIcon.webp";
import teamIcon from "../../../assets/icons/team.svg";

const PROJECT_PLAN_FIELDS = ["teamName", "serviceName", "serviceSummary"];

const getProjectPlanStatus = (plan) => {
    const normalizedPlan = normalizeProjectPlan(plan);
    const missing = PROJECT_PLAN_FIELDS.filter((key) => !normalizedPlan[key].trim());
    if (!normalizedPlan.coreFeatures.some((feature) => feature.value.trim())) {
        missing.push("coreFeatures");
    }
    return missing.length;
};

const dateString = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const RetryNotice = ({ title, onRetry }) => (
    <div className={styles.errorBox} role="alert">
        <strong>{title}</strong>
        <p>다른 기능은 그대로 이용할 수 있어요.</p>
        <button type="button" className={styles.ghostButton} onClick={onRetry}>
            다시 시도
        </button>
    </div>
);

const LoadingView = () => (
    <div className={styles.skeleton} aria-label="대시보드를 불러오는 중">
        <Skeleton className={styles.heroSkeleton} height={400} />
        <div className={styles.skeletonSection}>
            <Skeleton width={180} height={28} />
            <div className={styles.skeletonCards}>
                {[0, 1, 2].map((item) => <Skeleton key={item} height={220} />)}
            </div>
        </div>
        <div className={styles.skeletonSection}>
            <Skeleton width={150} height={28} />
            {[0, 1, 2].map((item) => <Skeleton key={item} height={88} />)}
        </div>
    </div>
);

const UserDashboard = () => {
    const user = authStore((state) => state.user);
    const { unreadChatCount } = useUnreadChatCountContext();
    const [dashboard, setDashboard] = useState(null);
    const [projectPlanCount, setProjectPlanCount] = useState(null);
    const [journals, setJournals] = useState([]);
    const [notices, setNotices] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const showLoading = useDelayedLoading(loading);

    const loadDashboard = useCallback(async () => {
        setLoading(true);
        setErrors((previous) => ({ ...previous, dashboard: "" }));
        try {
            const result = await requestUserDashboard({ force: true });
            setDashboard(result);
        } catch {
            setErrors((previous) => ({ ...previous, dashboard: "대시보드 정보를 불러오지 못했어요." }));
        } finally {
            setLoading(false);
        }
    }, []);

    const loadPlan = useCallback(async () => {
        setErrors((previous) => ({ ...previous, plan: "" }));
        try {
            const plan = await requestUserProjectPlan();
            setProjectPlanCount(getProjectPlanStatus(plan));
        } catch {
            setErrors((previous) => ({ ...previous, plan: "기획서 현황을 불러오지 못했어요." }));
        }
    }, []);

    const loadJournals = useCallback(async () => {
        setErrors((previous) => ({ ...previous, journals: "" }));
        try {
            const result = await requestUserLogList();
            setJournals(Array.isArray(result) ? result : []);
        } catch {
            setErrors((previous) => ({ ...previous, journals: "일지 현황을 불러오지 못했어요." }));
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

    useEffect(() => { loadDashboard(); loadNotices(); }, [loadDashboard, loadNotices]);
    useEffect(() => {
        if (!dashboard?.teamCreated) return;
        loadPlan();
        loadJournals();
    }, [dashboard?.teamCreated, loadPlan, loadJournals]);
    useEffect(() => {
        const timer = window.setInterval(() => setCurrentTime(new Date()), 1000);
        return () => window.clearInterval(timer);
    }, []);

    const teamCreated = Boolean(dashboard?.teamCreated);
    const canWriteLog = isCapstoneLogTime(currentTime);
    const isSubmitted = Boolean(dashboard?.todayJournalSubmitted);
    const submittedThisMonth = journals.filter((journal) =>
        journal.date?.startsWith(dateString(currentTime).slice(0, 7)) && journal.status === "COMPLETED"
    ).length;
    const missingPlanCount = projectPlanCount ?? 0;
    const heroTitle = !teamCreated
        ? <>팀이 만들어지면<br />바로 알려드릴게요</>
        : canWriteLog && !isSubmitted
            ? <>오늘 캡스톤 일지를<br />작성할 시간이에요</>
            : canWriteLog
                ? <>오늘 일지를<br />제출했어요</>
                : <>오늘은 캡스톤 일지<br />작성일이 아니에요</>;
    const heroDescription = !teamCreated
        ? <>설문 제출이 끝났어요.<br />관리자가 AI로 팀을 만들면<br />이 화면에서 팀원과 일정을 확인할 수 있어요.</>
        : canWriteLog && !isSubmitted
            ? <>오늘 활동 내용을 남기면<br />팀원 일지와 함께 자동으로 취합돼요.</>
            : canWriteLog
                ? <>수고했어요.<br />지난 일지는 언제든 다시 볼 수 있어요.</>
                : getCapstoneLogUnavailableText(currentTime);
    const heroAction = !teamCreated
        ? { to: "/user/notice", label: "공지 확인하기" }
        : canWriteLog && !isSubmitted
            ? { to: "/user/log", label: "일지 작성하기" }
            : { to: "/user/log/result", label: "지난 일지 보기" };
    const nextLogDate = formatCapstoneLogDateTime(
        getNextCapstoneLogWindow(currentTime).startAt
    );

    return (
        <div className={styles.page}>
            <a className={styles.skipLink} href="#dashboard-main">본문으로 건너뛰기</a>
            <Header />
            <main id="dashboard-main" className={styles.body}>
                {showLoading ? <LoadingView /> : errors.dashboard ? (
                    <section className={styles.dashboardError} role="alert">
                        <span className={styles.errorLabel}>불러오기 실패</span>
                        <h1>대시보드를 불러오지 못했어요</h1>
                        <p>{errors.dashboard}</p>
                        <button className={styles.primaryButton} type="button" onClick={loadDashboard}>다시 시도</button>
                    </section>
                ) : dashboard && <>
                    {teamCreated ? (
                        <section className={styles.hero} aria-label="오늘의 캡스톤">
                            <img className={styles.heroPhoto} src={heroImage} alt="팀원들이 함께 프로젝트를 진행하는 모습" />
                            <div className={styles.heroCopy}>
                                <p className={styles.eyebrow}>{user?.name ?? "학생"} 님, 안녕하세요</p>
                                <h1 className={styles.heroTitle}>{heroTitle}</h1>
                                <p className={styles.heroDescription}>{heroDescription}</p>
                                <div className={styles.heroActions}>
                                    <Link className={styles.primaryButton} to={heroAction.to}>{heroAction.label}</Link>
                                    {canWriteLog && !isSubmitted && <Link className={styles.ghostButton} to="/user/log/result">지난 일지 보기</Link>}
                                </div>
                            </div>
                            <aside className={styles.notch} aria-label="일지 마감 시간">
                                <span>{canWriteLog && !isSubmitted ? "오늘 일지 마감까지" : canWriteLog ? "오늘 일지 제출" : "다음 작성일"}</span>
                                <strong>{canWriteLog && !isSubmitted ? formatCountdownTime(getCapstoneLogRemainingMs(currentTime)) : canWriteLog ? "제출 완료 ✓" : nextLogDate}</strong>
                            </aside>
                        </section>
                    ) : (
                        <section className={styles.splitHero}>
                            <div className={styles.splitCopy}>
                                <p className={styles.eyebrow}>{user?.name ?? "학생"} 님, 안녕하세요</p>
                                <h1 className={styles.heroTitle}>{heroTitle}</h1>
                                <p className={styles.heroDescription}>{heroDescription}</p>
                                <Link className={styles.primaryButton} to="/user/notice">공지 확인하기</Link>
                            </div>
                            <img className={styles.splitPhoto} src={waitingHeroImage} alt="팀원들이 함께 프로젝트를 진행하는 모습" />
                        </section>
                    )}

                    {teamCreated ? <section className={styles.quickSection}>
                        <div className={styles.sectionHeading}>
                            <div><h2>내 캡스톤</h2><p>지금 확인하면 좋은 것들이에요</p></div>
                        </div>
                        <div className={styles.quickCards}>
                            <Link to="/user/project" className={styles.quickCard}>
                                <img src={projectIcon} alt="" />
                                <span className={styles.arrow} aria-hidden="true">→</span>
                                <h3>프로젝트 기획서</h3>
                                <p className={errors.plan ? styles.warning : missingPlanCount ? styles.warning : styles.success}>{errors.plan || (projectPlanCount === null ? "현황을 불러오는 중" : missingPlanCount ? `${missingPlanCount}개 항목 미작성` : "작성 완료")}</p>
                            </Link>
                            <Link to="/user/chat" className={`${styles.quickCard} ${styles.quickCardMain}`}>
                                <img src={chatIcon} alt="" />
                                <span className={styles.arrow} aria-hidden="true">→</span>
                                <h3>팀 채팅</h3>
                                <p className={styles.cardValue}>{unreadChatCount}개 안 읽은 메시지</p>
                            </Link>
                            <Link to="/user/log/result" className={styles.quickCard}>
                                <img src={logIcon} alt="" />
                                <span className={styles.arrow} aria-hidden="true">→</span>
                                <h3>지난 일지</h3>
                                <p className={errors.journals ? styles.warning : styles.success}>{errors.journals || `이번 달 ${submittedThisMonth}회 작성`}</p>
                            </Link>
                        </div>
                        {(errors.plan || errors.journals) && <div className={styles.inlineRetries}>
                            {errors.plan && <button type="button" onClick={loadPlan}>기획서 현황 다시 시도</button>}
                            {errors.journals && <button type="button" onClick={loadJournals}>일지 현황 다시 시도</button>}
                        </div>}
                    </section> : <section className={styles.waitingSection}>
                        <div className={styles.sectionHeading}><div><h2>팀 매칭 진행 상황</h2><p>팀이 만들어지기까지의 과정이에요</p></div></div>
                        <ol className={styles.timeline}>
                            <li className={styles.stepDone}><div className={styles.timelineIcon}><img src={surveyStepIcon} alt="" /></div><span>1단계 · 완료</span><h3>설문 제출</h3><p>제출을 마쳤어요</p></li>
                            <li className={styles.stepNow} aria-current="step"><div className={styles.timelineIcon}><img src={matchStepIcon} alt="" /></div><span>2단계 · 지금 단계</span><h3>AI 팀 매칭</h3><p>팀 매칭을 기다리고 있어요</p></li>
                            <li><div className={styles.timelineIcon}><img src={activityStepIcon} alt="" /></div><span>3단계 · 다음 단계</span><h3>팀 활동 시작</h3><p>프로젝트, 팀 채팅,<br />캡스톤 일지가 열려요</p></li>
                        </ol>
                    </section>}

                    <section className={styles.notices}>
                        <div className={styles.sectionHeading}>
                            <div><h2>공지</h2><p>새로 올라온 소식을 확인하세요</p></div>
                            <Link className={styles.ghostButtonSmall} to="/user/notice">전체보기 →</Link>
                        </div>
                        {errors.notices ? <RetryNotice title={errors.notices} onRetry={loadNotices} /> : notices.length ? (
                            <div className={styles.noticeList}>{notices.map((notice) => (
                                <Link key={notice.id} to={`/user/notice/${notice.id}`} className={styles.noticePill}>
                                    {notice.noticeType === "TEAM_RESULT" ? <img src={teamIcon} alt="" /> : notice.important === "IMPORTANT" ? <svg className={styles.noticeIcon} viewBox="0 0 24 24" aria-hidden="true"><path d="M4 14V9a1 1 0 0 1 1-1h3l8-4v14l-8-4H5a1 1 0 0 1-1-1Z" /><path d="m8 14 1.5 6h3L11 15M19 8l2-2m-2 9 2 2" /></svg> : <img src={noticeIcon} alt="" />}
                                    <span className={styles.noticeContent}>
                                        <strong>{notice.title}{notice.important === "IMPORTANT" && <em>중요</em>}</strong>
                                        <span>{truncateText(stripMarkdown(notice.content ?? ""), 100)}</span>
                                    </span>
                                    <time>{formatCreatedAt(notice.createdAt)}</time>
                                </Link>
                            ))}</div>
                        ) : <div className={styles.emptyNotice}><img src={noticeIcon} alt="" /><strong>아직 등록된 공지가 없어요</strong><p>새 공지가 올라오면 여기에서 바로 확인할 수 있어요.</p></div>}
                    </section>
                </>}
            </main>
            <footer className={styles.footer}>
                <div><Link className={styles.footerBrand} to="/user/dashboard">CapTeam</Link><p>AI가 캡스톤 팀을 만들고,<br />팀이 끝까지 함께 갈 수 있도록 돕는 서비스</p></div>
                <nav className={styles.footerLinks} aria-label="학생 바로가기">
                    <div className={styles.footerGroup}><strong>캡스톤 일지</strong><Link to="/user/log">일지 작성</Link><Link to="/user/log/result">지난 일지</Link></div>
                    <div className={styles.footerGroup}><strong>프로젝트</strong><Link to="/user/project">프로젝트 기획서</Link></div>
                    <div className={styles.footerGroup}><strong>팀</strong><Link to="/user/chat">팀 채팅</Link></div>
                    <div className={styles.footerGroup}><strong>공지</strong><Link to="/user/notice">공지 목록</Link></div>
                    <div className={styles.footerGroup}><strong>내 계정</strong><Link to="/user/profile">내 프로필</Link></div>
                </nav>
                <small>© 2026 CapTeam. All rights reserved.</small>
            </footer>
        </div>
    );
};

export default UserDashboard;
