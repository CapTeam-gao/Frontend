import ModalOverlay from "./ModalOverlay";
import styles from "./TeamRequiredModal.module.css";

const TeamRequiredModal = ({
    label = "이용 안내",
    title = "팀 생성 후 이용 가능합니다.",
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
        <ModalOverlay
            onClose={onClose}
            overlayClassName={styles.overlay}
            modalClassName={styles.modal}
            ariaLabelledby="team-required-modal-title"
        >
            <div className={styles.modalHeader}>
                <span className={styles.label}>{label}</span>
                <button
                    type="button"
                    className={styles.closeButton}
                    aria-label="닫기"
                    onClick={onClose}
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        aria-hidden="true"
                    >
                        <path d="m6 6 12 12M18 6 6 18" />
                    </svg>
                </button>
            </div>

            <div className={styles.content}>
                <h2 id="team-required-modal-title">{title}</h2>
                <p>{message}</p>
            </div>

            <div className={styles.actions}>
                <button
                    type="button"
                    className={styles.actionButton}
                    onClick={handleAction}
                >
                    {actionText}
                </button>
            </div>
        </ModalOverlay>
    );
};

export default TeamRequiredModal;
