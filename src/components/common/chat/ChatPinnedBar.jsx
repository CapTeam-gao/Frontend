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
            <div className={styles.pinnedBarAccent} />
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
