import styles from "./AdminTeamDetailModal.module.css";

const AdminTeamInsightPanel = ({ strength, weakness }) => {
    return (
        <section className={styles.insightPanel}>
            <div className={styles.sectionHeader}>
                <span>팀 분석</span>
            </div>

            <div className={styles.insightGrid}>
                <article className={styles.insightCard}>
                    <strong>강점</strong>
                    <p>
                        {strength ||
                            "아직 팀 강점 정보를 받아오지 못했습니다."}
                    </p>
                </article>
                <article className={styles.insightCard}>
                    <strong>약점</strong>
                    <p>
                        {weakness ||
                            "아직 팀 약점 정보를 받아오지 못했습니다."}
                    </p>
                </article>
            </div>
        </section>
    );
};

export default AdminTeamInsightPanel;
