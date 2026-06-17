import styles from "./AdminTeamDetailModal.module.css";

const AdminTeamProjectPanel = ({ projectWritten, team, mainFeatures }) => {
    return (
        <section className={styles.projectPanel}>
            <div className={styles.sectionHeader}>
                <span>프로젝트 정보</span>
                <strong>{projectWritten ? "작성 완료" : "작성 전"}</strong>
            </div>

            <article className={styles.projectHero}>
                <span>서비스명</span>
                <h3>
                    {projectWritten
                        ? team.serviceName
                        : "프로젝트 기획서가 아직 작성되지 않았습니다."}
                </h3>
            </article>

            <article className={styles.infoCard}>
                <h4>서비스 소개</h4>
                <p>
                    {projectWritten
                        ? team.serviceIntro
                        : "학생이 프로젝트 기획서를 저장하면 이곳에서 서비스 소개를 확인할 수 있습니다."}
                </p>
            </article>

            <article className={styles.infoCard}>
                <h4>주요 기능</h4>
                {mainFeatures.length > 0 ? (
                    <ul className={styles.featureList}>
                        {mainFeatures.map((feature, index) => (
                            <li key={`${feature}-${index}`}>{feature}</li>
                        ))}
                    </ul>
                ) : (
                    <p>작성된 주요 기능이 아직 없습니다.</p>
                )}
            </article>
        </section>
    );
};

export default AdminTeamProjectPanel;
