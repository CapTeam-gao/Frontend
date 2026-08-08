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
            <div className={styles.content}>
                <span className={styles.label}>{label}</span>
                <h2 id="team-required-modal-title">{title}</h2>
                <p>{message}</p>
            </div>

            <button type="button" onClick={handleAction}>
                {actionText}
            </button>
        </ModalOverlay>
    );
};

export default TeamRequiredModal;
