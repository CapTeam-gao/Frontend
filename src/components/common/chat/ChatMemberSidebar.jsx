import styles from "../../../pages/user/chat/UserTeamChat.module.css";

const MemberItem = ({ member, online }) => {
    return (
        <li
            className={`${styles.memberItem} ${
                online ? styles.onlineMember : styles.offlineMember
            }`}
        >
            <span className={styles.memberAvatar}>
                {member.name?.slice(0, 1)}
                <span
                    className={`${styles.statusDot} ${
                        online ? styles.online : ""
                    }`}
                />
            </span>
            <span className={styles.memberName}>{member.name}</span>
        </li>
    );
};

const ChatMemberSidebar = ({
    hasPresenceLoaded,
    members = [],
    onlineMembers = [],
    offlineMembers = [],
}) => {
    const isInitialPending = !hasPresenceLoaded && members.length === 0;

    return (
        <aside className={styles.memberSidebar}>
            <div className={styles.memberSidebarHeader}>
                <strong>팀원</strong>
                <span>{isInitialPending ? "" : `${members.length}명`}</span>
            </div>

            {isInitialPending ? (
                <div className={styles.memberPendingArea} />
            ) : (
                <>
                    <div className={styles.memberGroup}>
                        <p className={styles.memberGroupTitle}>
                            온라인 - {onlineMembers.length}
                        </p>

                        <ul className={styles.memberList}>
                            {onlineMembers.map((member) => (
                                <MemberItem
                                    key={member.userId}
                                    member={member}
                                    online
                                />
                            ))}
                        </ul>
                    </div>

                    <div className={styles.memberGroup}>
                        <p className={styles.memberGroupTitle}>
                            오프라인 - {offlineMembers.length}
                        </p>

                        {offlineMembers.length === 0 ? (
                            <p className={styles.memberEmptyText}>
                                오프라인 팀원이 없습니다.
                            </p>
                        ) : (
                            <ul className={styles.memberList}>
                                {offlineMembers.map((member) => (
                                    <MemberItem
                                        key={member.userId}
                                        member={member}
                                        online={false}
                                    />
                                ))}
                            </ul>
                        )}
                    </div>
                </>
            )}
        </aside>
    );
};

export default ChatMemberSidebar;
