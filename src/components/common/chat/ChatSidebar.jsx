import ChatAvatar from "./ChatAvatar";
import ChatChannel from "./ChatChannel";
import styles from "../../../pages/user/chat/UserTeamChat.module.css";

const ChatSidebar = ({
    teamName,
    members = [],
    channels = [],
    selectedChannelId,
    getChannelUnreadCount,
    canManageChannel,
    onSelectChannel,
    onOpenChannelModal,
    onEditChannel,
    onDeleteChannel,
    onCloseDrawer,
}) => {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
                <div className={styles.teamCard}>
                    <p className={styles.teamCardLabel}>팀 채팅방</p>
                    <h1>{teamName ?? "\u00A0"}</h1>
                    {members.length > 0 && (
                        <div className={styles.teamCardMembers}>
                            <span className={styles.avatarStack}>
                                {members.slice(0, 5).map((member) => (
                                    <ChatAvatar
                                        key={member.userId}
                                        name={member.name}
                                        size={34}
                                        className={styles.stackAvatar}
                                    />
                                ))}
                            </span>
                            <span>팀원 {members.length}명</span>
                        </div>
                    )}
                </div>
                <button
                    type="button"
                    className={styles.drawerClose}
                    aria-label="채널 목록 닫기"
                    onClick={onCloseDrawer}
                >
                    ×
                </button>
            </div>

            <div className={styles.channelArea}>
                <div className={styles.sectionTitle}>
                    <span>채널</span>
                    {canManageChannel && (
                        <button
                            type="button"
                            className={styles.addChannelButton}
                            onClick={onOpenChannelModal}
                        >
                            + 추가
                        </button>
                    )}
                </div>

                <div className={styles.channelList}>
                    {channels.map((channel) => (
                        <ChatChannel
                            key={channel.id}
                            channel={channel}
                            unreadCount={getChannelUnreadCount(channel.id)}
                            selected={selectedChannelId === channel.id}
                            canManageChannel={canManageChannel}
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
