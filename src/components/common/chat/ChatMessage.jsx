import { useState } from "react";
import styles from "./ChatMessage.module.css";

const formatMessageTime = (createdAt) => {
    if (!createdAt) return "";

    return new Intl.DateTimeFormat("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(createdAt));
};

const ChatMessage = ({ message, mine, showTime }) => {
    const [actionMode, setActionMode] = useState("");

    const closeActionPanel = () => {
        setActionMode("");
    };

    return (
        <li
            className={`${styles.messageItem} ${mine ? styles.mine : ""} ${
                showTime ? styles.timeSeparated : ""
            }`}
        >
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

            <div className={styles.messageBody}>
                <div className={styles.messageBubble}>{message.message}</div>

                {mine && (
                    <div className={styles.messageActions}>
                        <button
                            type="button"
                            onClick={() => setActionMode("edit")}
                        >
                            수정
                        </button>
                        <button
                            type="button"
                            onClick={() => setActionMode("delete")}
                        >
                            삭제
                        </button>
                    </div>
                )}
            </div>

            {actionMode === "edit" && (
                <div className={styles.editPanel}>
                    <textarea
                        defaultValue={message.message}
                        aria-label="메시지 수정 내용"
                    />
                    <div className={styles.panelActions}>
                        <button type="button" onClick={closeActionPanel}>
                            취소
                        </button>
                        <button type="button" className={styles.primaryButton}>
                            수정 완료
                        </button>
                    </div>
                </div>
            )}

            {actionMode === "delete" && (
                <div className={styles.deletePanel}>
                    <div>
                        <strong>메시지를 삭제할까요?</strong>
                        <p>삭제하면 이 대화에서 메시지가 보이지 않습니다.</p>
                    </div>
                    <div className={styles.panelActions}>
                        <button type="button" onClick={closeActionPanel}>
                            취소
                        </button>
                        <button type="button" className={styles.dangerButton}>
                            삭제
                        </button>
                    </div>
                </div>
            )}
        </li>
    );
};

export default ChatMessage;
