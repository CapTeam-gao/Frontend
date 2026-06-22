import styles from "./ChatChannel.module.css";

const ChatChannel = ({
    channel,
    selected,
    unreadCount = 0,
    canManageChannel,
    onClick,
    onEdit,
    onDelete,
}) => {
    const showChannelActions =
        canManageChannel && channel.channelName !== "공통";

    const handleActionClick = (event, action) => {
        event.stopPropagation();
        action();
    };

    return (
        <div
            className={`${styles.channelRow} ${
                selected ? styles.selected : ""
            }`}
        >
            <button
                type="button"
                className={styles.channelButton}
                onClick={onClick}
            >
                <span className={styles.channelMark}>#</span>
                <span className={styles.channelName}>
                    {channel.channelName}
                </span>
                {unreadCount > 0 && (
                    <span className={styles.unreadBadge}>
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {showChannelActions && (
                <div className={styles.channelActions}>
                    <button
                        type="button"
                        aria-label={`${channel.channelName} 채널 이름 수정`}
                        onClick={(event) => handleActionClick(event, onEdit)}
                    >
                        수정
                    </button>
                    <button
                        type="button"
                        aria-label={`${channel.channelName} 채널 삭제`}
                        onClick={(event) => handleActionClick(event, onDelete)}
                    >
                        삭제
                    </button>
                </div>
            )}
        </div>
    );
};

export default ChatChannel;
