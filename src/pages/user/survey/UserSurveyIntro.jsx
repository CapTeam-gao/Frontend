// Design/survey-intro-v3.html 반영. 설문 흐름에는 서비스 헤더를 두지 않는다.
import { Link, useNavigate } from "react-router-dom";
import { requestLogout } from "../../../api/authApi";
import authStore from "../../../store/authStore";
import useInView from "../../../hooks/useInView";
import styles from "./UserSurveyIntro.module.css";

import brandImage from "../../../assets/images/surveyBrandV3.webp";
import heroIcon from "../../../assets/images/surveyIntroHeroIcon.webp";
import technicalIcon from "../../../assets/images/surveyTechnicalIcon.webp";
import collaborationIcon from "../../../assets/images/surveyCollaborationIcon.webp";
import executionIcon from "../../../assets/images/surveyExecutionIcon.webp";

const SURVEY_STEPS = [
    {
        number: "STEP 1 · 4항목",
        title: "기술 정보",
        description: <>희망 직군, 기술 스택, 구현 경험으로<br />팀 안에서 맡을 수 있는 역할을 확인해요.</>,
        icon: technicalIcon,
    },
    {
        number: "STEP 2 · 15문항",
        title: "협업 성향",
        description: <>아이디어 정리, 소통, 역할 유연성,<br />일정 압박 대응, 집중 유지를 확인해요.</>,
        icon: collaborationIcon,
    },
    {
        number: "STEP 3 · 15문항",
        title: "실행 성향",
        description: <>개발 실행력, 문제 해결, 완성도,<br />발표, 리더십 성향을 확인해요.</>,
        icon: executionIcon,
    },
];

const UserSurveyIntro = () => {
    const navigate = useNavigate();
    const logout = authStore((state) => state.logout);
    const contentRef = useInView();

    const handleLogout = async () => {
        try {
            await requestLogout();
        } finally {
            logout();
            navigate("/login", { replace: true });
        }
    };

    return (
        <div className={styles.page} ref={contentRef}>
            <header className={styles.topBar}>
                <div className={styles.topBarInner}>
                    <Link to="/user/survey/intro" aria-label="CapTeam 설문 안내">
                        <img className={styles.logo} src={brandImage} alt="CapTeam" />
                    </Link>
                    <button type="button" className={styles.logoutButton} onClick={handleLogout}>로그아웃</button>
                </div>
            </header>

            <main className={styles.main}>
                <section className={styles.hero}>
                    <div className={styles.heroCopy}>
                        <p data-reveal className={styles.eyebrow}>캡스톤 팀 매칭 설문</p>
                        <h1 data-reveal className={styles.headline}>팀을 만들기 전에<br />몇 가지만 알려주세요</h1>
                        <p data-reveal className={styles.subline}>입력한 기술 정보와 협업 성향을 함께 분석해,<br />역할과 실행력이 한쪽으로 몰리지 않도록<br className={styles.mobileBreak} /> 팀을 추천해요.</p>
                        <Link data-reveal className={styles.primaryButton} to="/user/survey" replace state={{ fromSurveyIntro: true }}>설문 시작하기</Link>
                    </div>
                    <div data-reveal className={styles.heroArt}>
                        <img className={styles.heroIcon} src={heroIcon} alt="설문 항목을 확인하는 체크리스트" />
                        <div className={styles.facts}>
                            <div><small>예상 소요 시간</small><strong>약 5<span>분</span></strong></div>
                            <div><small>전체 문항</small><strong>34<span>문항</span></strong></div>
                        </div>
                    </div>
                </section>

                <section className={styles.stepsSection} aria-labelledby="steps-title">
                    <div className={styles.stepsHeading}>
                        <h2 id="steps-title">이렇게 진행돼요</h2>
                        <p>세 단계로 나눠서 물어볼게요</p>
                    </div>
                    <ol className={styles.steps}>
                        {SURVEY_STEPS.map((step) => (
                            <li className={styles.step} key={step.number}>
                                <img src={step.icon} alt="" />
                                <div><span>{step.number}</span><h3>{step.title}</h3><p>{step.description}</p></div>
                            </li>
                        ))}
                    </ol>
                </section>

                <section className={styles.startSection}>
                    <div><h2>설문은 한 번만 제출할 수 있어요</h2><p>성향 점수는 절대 기준이 아니라 참고 자료예요.<br />역할·기술 스택·발표 가능성까지<br className={styles.mobileBreak} /> 함께 고려해 팀을 구성해요.</p></div>
                    <Link className={styles.ghostButton} to="/user/survey" replace state={{ fromSurveyIntro: true }}>설문 시작하기</Link>
                </section>
            </main>
        </div>
    );
};

export default UserSurveyIntro;
