import styles from "./AdminTeamCreateLoading.module.css";

const AdminTeamCreateLoading = () => {
    return (
        <div className={styles.page}>
            <main className={styles.panel}>
                <div className={styles.loadingContent}>
                    <div className={styles.loadingIcon} aria-hidden="true" />
                    <h1 className={styles.loadingText}>
                        팀이 생성되는 중입니다
                        <span className={styles.dots} aria-hidden="true" />
                    </h1>
                </div>
            </main>
        </div>
    );
};

export default AdminTeamCreateLoading;
