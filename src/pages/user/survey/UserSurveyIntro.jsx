import { Link } from "react-router-dom";
import Logo from "../../../assets/images/logo.png";
import styles from "./UserSurveyIntro.module.css";

const surveySections = [
    {
        step: "STEP 1",
        title: "팀 매칭 기준 수집",
        description:
            "이 설문은 캡스톤 팀을 구성하기 위한 기본 자료로 사용됩니다. 희망 직군, 기술 스택, 구현 경험을 바탕으로 팀 안에서 맡을 수 있는 역할을 확인합니다.",
    },
    {
        step: "STEP 2",
        title: "협업 성향 설계",
        description:
            "Big Five 성격 요인 연구와 팀 프로젝트 협업 기준을 참고해 구성했습니다. 소통, 책임감, 협업 방식처럼 함께 일할 때 중요한 요소를 확인합니다.",
    },
    {
        step: "STEP 3",
        title: "팀 매칭 반영 방식",
        description:
            "입력한 성향 점수는 팀 배정의 절대 기준이 아니라 기술 정보와 함께 참고됩니다. 역할, 기술 스택, 협업 성향을 함께 고려해 균형 있는 팀 구성을 돕습니다.",
    },
];

const UserSurveyIntro = () => {
    return (
        <main className={styles.page}>
            <section className={styles.intro}>
                <img className={styles.logo} src={Logo} alt="CapTeam 로고" />

                <h1 className={styles.title}>팀 매칭 설문 안내</h1>

                <p className={styles.description}>
                    <span>설문 결과는 캡스톤 팀을 구성하는 데 사용됩니다.</span>
                    <span>
                        입력한 기술 정보와 협업 성향을 함께 분석해 역할과 성향이
                        한쪽으로 몰리지 않도록 팀을 추천합니다.
                    </span>
                </p>

                <div className={styles.infoGrid}>
                    {surveySections.map((section) => (
                        <article
                            key={section.title}
                            className={styles.infoCard}
                        >
                            <span>{section.step}</span>
                            <h2>{section.title}</h2>
                            <p>{section.description}</p>
                        </article>
                    ))}
                </div>

                <div className={styles.noticeBox}>
                    <div className={styles.timeInfo}>
                        <strong>예상 소요 시간</strong>
                        <span>약 5분</span>
                    </div>
                    <div className={styles.noticeDivider} />
                    <p>
                        설문은 한 번만 제출할 수 있습니다. 가능한 실제 경험과
                        성향에 가깝게 답변해주세요.
                    </p>
                </div>

                <Link
                    className={styles.startButton}
                    to="/user/survey"
                    replace
                    state={{ fromSurveyIntro: true }}
                >
                    설문 시작하기
                </Link>
            </section>
        </main>
    );
};

export default UserSurveyIntro;
