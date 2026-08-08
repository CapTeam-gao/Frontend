import { useState } from "react";
import { roleLabels } from "../../../constants/student";
import styles from "../../../pages/user/chat/UserTeamChat.module.css";

const MemberItem = ({ member, online, isMe, onUpdateAssignedTask }) => {
    const roleLabel = roleLabels[member.studentRole];
    const [isEditing, setIsEditing] = useState(false);
    const [draftTask, setDraftTask] = useState(member.assignedTask ?? "");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    const startEditing = () => {
        setDraftTask(member.assignedTask ?? "");
        setError("");
        setIsEditing(true);
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            setError("");
            await onUpdateAssignedTask(draftTask.trim());
            setIsEditing(false);
        } catch {
            setError("담당 업무 저장에 실패했습니다.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <li
            className={`${styles.memberItem} ${
                online ? styles.onlineMember : styles.offlineMember
            }`}
        >
            <span
                className={`${styles.statusDot} ${
                    online ? styles.online : ""
                }`}
            />
            <div className={styles.memberInfo}>
                <span className={styles.memberName}>
                    {member.name}
                    {roleLabel ? ` · ${roleLabel}` : ""}
                </span>

                {isEditing ? (
                    <div>
                        <div className={styles.memberTaskEdit}>
                            <input
                                type="text"
                                value={draftTask}
                                onChange={(event) =>
                                    setDraftTask(event.target.value)
                                }
                                placeholder="담당 업무를 입력하세요"
                                disabled={isSaving}
                                autoFocus
                            />
                            <div className={styles.memberTaskEditActions}>
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                >
                                    {isSaving ? "저장 중" : "저장"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    disabled={isSaving}
                                >
                                    취소
                                </button>
                            </div>
                        </div>
                        {error && (
                            <p className={styles.memberTaskEditError}>
                                {error}
                            </p>
                        )}
                    </div>
                ) : (
                    <span className={styles.memberTask}>
                        담당 업무: {member.assignedTask || "미입력"}
                        {isMe && (
                            <button type="button" onClick={startEditing}>
                                수정
                            </button>
                        )}
                    </span>
                )}
            </div>
        </li>
    );
};

const ChatMemberSidebar = ({
    hasPresenceLoaded,
    members = [],
    onlineMembers = [],
    offlineMembers = [],
    currentUserId,
    onUpdateAssignedTask,
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
                                    isMe={member.userId === currentUserId}
                                    onUpdateAssignedTask={onUpdateAssignedTask}
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
                                        isMe={member.userId === currentUserId}
                                        onUpdateAssignedTask={
                                            onUpdateAssignedTask
                                        }
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
