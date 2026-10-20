import { Fragment } from "react";
import ChatMessage from "./ChatMessage";
import {
    formatDateDivider,
    getMessageDateKey,
    getMessageMinuteKey,
} from "../../../utils/chat";
import styles from "../../../pages/user/chat/UserTeamChat.module.css";

const ChatMessageList = ({
    messages = [],
    members = [],
    currentUserId,
    isLoadingMoreMessages,
    onEditMessage,
    onDeleteMessage,
    pinnedMessageId,
    flashingMessageId,
    onTogglePin,
}) => {
    const roleByUserId = new Map(
        members.map((member) => [member.userId, member.studentRole])
    );

    return (
        <ul
            className={styles.messageList}
        >
            {isLoadingMoreMessages && (
                <li className={styles.olderLoadingText}>
                    이전 메시지를 불러오는 중입니다.
                </li>
            )}

            {messages.map((message, index) => {
                const prevMessage = messages[index - 1];
                const currentMinuteKey = getMessageMinuteKey(message.createdAt);
                const prevMinuteKey = getMessageMinuteKey(
                    prevMessage?.createdAt
                );
                const currentDateKey = getMessageDateKey(message.createdAt);
                const prevDateKey = getMessageDateKey(prevMessage?.createdAt);
                const showTime = currentMinuteKey !== prevMinuteKey;
                const showDateDivider = currentDateKey !== prevDateKey;
                const messageKey =
                    message.id ??
                    `${message.senderId}-${message.createdAt}-${index}`;

                return (
                    <Fragment key={messageKey}>
                        {showDateDivider && (
                            <li className={styles.dateDivider}>
                                <span>
                                    {formatDateDivider(message.createdAt)}
                                </span>
                            </li>
                        )}

                        <ChatMessage
                            message={message}
                            mine={message.senderId === currentUserId}
                            senderRole={roleByUserId.get(message.senderId)}
                            showTime={showTime}
                            isPinned={message.id === pinnedMessageId}
                            isFlashing={message.id === flashingMessageId}
                            onEdit={onEditMessage}
                            onDelete={onDeleteMessage}
                            onTogglePin={() => onTogglePin(message.id)}
                        />
                    </Fragment>
                );
            })}
        </ul>
    );
};

export default ChatMessageList;
