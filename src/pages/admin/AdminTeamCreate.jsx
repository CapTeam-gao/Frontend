import { Link } from "react-router-dom";
import Header from "../../components/common/Header";
import TeamCreateIcon from "../../assets/icons/teamCreate.svg";
import styles from "./AdminTeamCreate.module.css";

const AdminTeamCreate = () => {
    return (
        <div className={styles.page}>
            <Header />

            <section className={styles.panel}>
                <main className={styles.content}>
                    <div className={styles.iconBox}>
                        <img src={TeamCreateIcon} alt="" />
                    </div>

                    <h1 className={styles.title}>캡스톤 팀 자동 생성</h1>

                    <div className={styles.gradeTabs} aria-label="학년 선택">
                        <label className={styles.gradeOption}>
                            <input
                                type="radio"
                                name="grade"
                                value="2"
                                defaultChecked
                            />
                            <span>2학년 (59명)</span>
                        </label>

                        <label className={styles.gradeOption}>
                            <input type="radio" name="grade" value="3" />
                            <span>3학년 (76명)</span>
                        </label>
                    </div>

                    <section className={styles.criteriaBox}>
                        <h2 className={styles.criteriaTitle}>생성 기준</h2>
                        <ul className={styles.criteriaList}>
                            <li>
                                학생 희망 직무와 기술 스택을 기준으로 역할을
                                분배합니다.
                            </li>
                            <li>
                                프론트엔드, 백엔드, 디자인, 기획 인원이 한 팀에
                                고르게 배치되도록 구성합니다.
                            </li>
                            <li>
                                사전 설문 데이터를 기반으로 팀별 역량 차이가
                                과하게 벌어지지 않도록 조정합니다.
                            </li>
                        </ul>
                    </section>

                    <Link
                        to="/admin/team-create/loading"
                        className={styles.createButton}
                    >
                        생성
                    </Link>
                </main>
            </section>
        </div>
    );
};

export default AdminTeamCreate;
