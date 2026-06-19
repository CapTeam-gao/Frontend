import styles from "./ChatMessage.module.css";

const formatMessageTime = (createdAt) => {
    if (!createdAt) return "";

    return new Intl.DateTimeFormat("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(createdAt));
};

const ChatMessage = ({ message, mine, showTime }) => {
    return (
        <li className={`${styles.messageItem} ${mine ? styles.mine : ""}`}>
            {showTime && (
                <div className={styles.messageMeta}>
                    {!mine && (
                        <strong className={styles.senderName}>
                            {message.senderName}
                        </strong>
                    )}
                    <span>{formatMessageTime(message.createdAt)}</span>
                </div>
            )}

            <div className={styles.messageBubble}>{message.message}</div>
        </li>
    );
};

export default ChatMessage;
