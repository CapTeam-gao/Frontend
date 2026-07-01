import styles from "./TeamRequiredModal.module.css";

const TeamRequiredModal = ({
    title = "팀 생성 후 이용할 수 있어요",
    message = "팀이 생성되면 해당 기능을 사용할 수 있습니다.",
    onClose,
}) => {
    return (
        <div className={styles.overlay} onClick={onClose}>
            <section className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.content}>
                    <span className={styles.label}>이용 안내</span>
                    <h2>{title}</h2>
                    <p>{message}</p>
                </div>

                <button type="button" onClick={onClose}>
                    확인
                </button>
            </section>
        </div>
    );
};

export default TeamRequiredModal;
