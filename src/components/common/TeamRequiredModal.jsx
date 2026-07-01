import styles from "./TeamRequiredModal.module.css";

const TeamRequiredModal = ({
    label = "이용 안내",
    title = "아직 이용할 수 없는 메뉴입니다",
    message = "팀 생성이 완료되면 이 기능을 사용할 수 있습니다.",
    actionText = "확인",
    onClose,
    onAction,
}) => {
    const handleAction = () => {
        onAction?.();
        onClose?.();
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <section
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.content}>
                    <span className={styles.label}>{label}</span>
                    <h2>{title}</h2>
                    <p>{message}</p>
                </div>

                <button type="button" onClick={handleAction}>
                    {actionText}
                </button>
            </section>
        </div>
    );
};

export default TeamRequiredModal;
