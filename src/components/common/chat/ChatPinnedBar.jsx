import styles from "../../../pages/user/chat/UserTeamChat.module.css";

const ChatPinnedBar = ({ pinnedMessage, onJump, onUnpin }) => {
    if (!pinnedMessage) return null;

    return (
        <div
            className={styles.pinnedBar}
            role="button"
            tabIndex={0}
            onClick={onJump}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onJump();
                }
            }}
        >
            <svg
                className={styles.pinnedBarIcon}
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <path d="M12 17v5" />
                <path d="M9 3h6l-1 5 3 3v2H7v-2l3-3-1-5Z" />
            </svg>
            <div className={styles.pinnedBarBody}>
                <span className={styles.pinnedBarLabel}>고정된 메시지</span>
                <span className={styles.pinnedBarText}>
                    <strong>{pinnedMessage.senderName}</strong>
                    {pinnedMessage.message || "첨부 파일"}
                </span>
            </div>
            <button
                type="button"
                className={styles.pinnedBarUnpin}
                onClick={(event) => {
                    event.stopPropagation();
                    onUnpin();
                }}
            >
                해제
            </button>
        </div>
    );
};

export default ChatPinnedBar;
