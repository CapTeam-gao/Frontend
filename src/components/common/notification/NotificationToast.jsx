import useToastAutoDismiss from "../../../hooks/useToastAutoDismiss";
import styles from "./NotificationToast.module.css";

const TOAST_DURATION = 5000;

const NOTIFICATION_TYPE_LABELS = {
    JOURNAL_DEADLINE: "일지 마감 임박",
    CHAT_MESSAGE: "새 채팅 메시지",
    NOTICE_CREATED: "새 공지",
};

const NotificationToast = ({ toasts, onDismiss, onSelect }) => {
    useToastAutoDismiss(toasts, onDismiss, TOAST_DURATION);

    if (!toasts.length) return null;

    return (
        <div className={styles.toastContainer}>
            {toasts.map((toast) => (
                <button
                    type="button"
                    key={toast.id}
                    className={styles.toast}
                    onClick={() => {
                        onSelect(toast);
                        onDismiss(toast.id);
                    }}
                >
                    <div className={styles.toastLabel}>
                        {NOTIFICATION_TYPE_LABELS[toast.type] || "알림"}
                    </div>
                    <div className={styles.toastTitle}>
                        {toast.title || NOTIFICATION_TYPE_LABELS[toast.type]}
                    </div>
                    {toast.body && (
                        <div className={styles.toastBody}>{toast.body}</div>
                    )}
                </button>
            ))}
        </div>
    );
};

export default NotificationToast;
