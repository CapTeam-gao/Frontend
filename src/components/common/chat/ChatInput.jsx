import { useRef, useState } from "react";
import styles from "./ChatInput.module.css";

const ChatInput = ({ onSend, disabled = false, isSending = false }) => {
    const [message, setMessage] = useState("");
    const inputRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const trimmedMessage = message.trim();

        if (!trimmedMessage || disabled || isSending) return;

        await onSend(trimmedMessage);
        setMessage("");
        inputRef.current?.focus();
    };

    return (
        <form className={styles.inputForm} onSubmit={handleSubmit}>
            <input
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={disabled}
                placeholder="메시지를 입력하세요"
                className={styles.messageInput}
            />

            <button
                type="submit"
                disabled={disabled || isSending || !message.trim()}
                className={styles.sendButton}
            >
                전송
            </button>
        </form>
    );
};

export default ChatInput;
