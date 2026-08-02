import { useEffect } from "react";
import styles from "./ChatToast.module.css";

const TOAST_DURATION = 4000;

const ChatToast = ({ toasts, onDismiss, onSelect }) => {
    useEffect(() => {
        const timers = toasts.map((toast) =>
            setTimeout(() => onDismiss(toast.id), TOAST_DURATION)
        );

        return () => timers.forEach((timer) => clearTimeout(timer));
    }, [toasts, onDismiss]);

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
                    <div className={styles.toastTop}>
                        <span className={styles.toastChannel}>
                            {toast.channelName}
                        </span>
                    </div>
                    <div className={styles.toastSender}>
                        {toast.senderName}
                    </div>
                    <div className={styles.toastPreview}>{toast.preview}</div>
                </button>
            ))}
        </div>
    );
};

export default ChatToast;
