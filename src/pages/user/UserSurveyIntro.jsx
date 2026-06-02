import { Link } from "react-router-dom";
import Logo from "../../assets/images/logo.png";
import styles from "./UserSurveyIntro.module.css";

const surveySections = [
    {
        title: "기술 정보",
        description: "희망 직군, 구현 경험, 사용 가능한 기술 스택을 입력합니다.",
    },
    {
        title: "협업 성향",
        description: "팀 프로젝트에서 의견 공유와 역할 분담 방식을 확인합니다.",
    },
    {
        title: "개발 성향",
        description: "개발 습관, 문제 해결 방식, 일정 관리 성향을 확인합니다.",
    },
];

const UserSurveyIntro = () => {
    return (
        <main className={styles.page}>
            <section className={styles.intro}>
                <img className={styles.logo} src={Logo} alt="CapTeam 로고" />

                <p className={styles.eyebrow}>필수 설문</p>
                <h1 className={styles.title}>팀 매칭 설문 안내</h1>
                <p className={styles.description}>
                    CapTeam은 학생의 기술 정보와 협업 성향을 바탕으로 캡스톤
                    팀을 구성합니다. 설문을 완료해야 서비스 이용이 가능하며,
                    입력한 내용은 팀 역할 균형과 협업 성향을 고려하는 자료로
                    사용됩니다.
                </p>

                <div className={styles.infoGrid}>
                    {surveySections.map((section, index) => (
                        <article key={section.title} className={styles.infoCard}>
                            <span>STEP {index + 1}</span>
                            <h2>{section.title}</h2>
                            <p>{section.description}</p>
                        </article>
                    ))}
                </div>

                <div className={styles.noticeBox}>
                    <strong>예상 소요 시간</strong>
                    <span>약 5분</span>
                    <p>
                        설문은 한 번만 진행하며, 제출 후 일부 정보는 마이페이지에서
                        수정할 수 있습니다.
                    </p>
                </div>

                <Link className={styles.startButton} to="/user/survey">
                    설문 시작하기
                </Link>
            </section>
        </main>
    );
};

export default UserSurveyIntro;
