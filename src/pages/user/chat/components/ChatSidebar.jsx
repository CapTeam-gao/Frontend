import ChatChannel from "../../../../components/common/chat/ChatChannel";
import styles from "../UserTeamChat.module.css";

const ChatSidebar = ({
    teamName,
    channels = [],
    selectedChannelId,
    getChannelUnreadCount,
    onSelectChannel,
    onOpenChannelModal,
    onEditChannel,
    onDeleteChannel,
}) => {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
                <h1>{teamName ?? "\u00A0"}</h1>
                <p>프로젝트 대화 공간</p>
            </div>

            <div className={styles.channelArea}>
                <div className={styles.sectionTitle}>
                    <span>채널</span>
                    <button
                        type="button"
                        className={styles.addChannelButton}
                        aria-label="채널 추가"
                        onClick={onOpenChannelModal}
                    >
                        +
                    </button>
                </div>

                <div className={styles.channelList}>
                    {channels.map((channel) => (
                        <ChatChannel
                            key={channel.id}
                            channel={channel}
                            unreadCount={getChannelUnreadCount(channel.id)}
                            selected={selectedChannelId === channel.id}
                            onClick={() => onSelectChannel(channel)}
                            onEdit={() => onEditChannel(channel)}
                            onDelete={() => onDeleteChannel(channel)}
                        />
                    ))}
                </div>
            </div>
        </aside>
    );
};

export default ChatSidebar;
