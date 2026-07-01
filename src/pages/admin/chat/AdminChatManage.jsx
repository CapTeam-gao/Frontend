import Header from "../../../components/common/header/Header";
import ChatInput from "../../../components/common/chat/ChatInput";
import ChatMessageList from "../../../components/common/chat/ChatMessageList";
import ChatMemberSidebar from "../../../components/common/chat/ChatMemberSidebar";
import ChatSidebar from "../../../components/common/chat/ChatSidebar";
import authStore from "../../../store/authStore";
import useAdminChatRoom from "../../../hooks/useAdminChatRoom";
import useAdminChatMessages from "../../../hooks/useAdminChatMessages";
import useAdminChatSocket from "../../../hooks/useAdminChatSocket";
import useAdminChatPresence from "../../../hooks/useAdminChatPresence";
import styles from "./AdminChatManage.module.css";
import useDelayedLoading from "../../../hooks/useDelayedLoading";
import { useCallback, useEffect, useState } from "react";
import {
    requestAdminChannelSummaries,
    requestMarkAdminChatAsRead,
} from "../../../api/adminChatApi";
import { CHAT_UNREAD_CHANGE_EVENT } from "../../../utils/chat";

const AdminChatManage = () => {
    const user = authStore((state) => state.user);
    const currentUserId = user?.userId;

    const {
        rooms,
        selectedRoom,
        selectedChannel,
        isLoading,
        error,
        updateSelectedRoom,
        updateSelectedChannel,
        handleChannelEvent,
    } = useAdminChatRoom();

    const {
        messages,
        isMessageLoading,
        isLoadingMoreMessages,
        messageError,
        messageListRef,
        addMessage,
        clearMessages,
        handleEditMessage,
        handleDeleteMessage,
        handleMessageEvent,
        handleMessageScroll,
    } = useAdminChatMessages(selectedChannel);

    const [channelSummaries, setChannelSummaries] = useState([]);
    const selectedRoomId = selectedRoom?.id;
    const selectedChannelId = selectedChannel?.id;
    const showRoomLoading = useDelayedLoading(isLoading);
    const showMessageLoading = useDelayedLoading(isMessageLoading);

    useEffect(() => {
        let ignore = false;

        if (!selectedRoomId) {
            const timeoutId = window.setTimeout(() => {
                setChannelSummaries([]);
            }, 0);

            return () => {
                window.clearTimeout(timeoutId);
            };
        }

        const getChannelSummaries = async () => {
            try {
                const summaries = await requestAdminChannelSummaries(
                    selectedRoomId
                );

                if (!ignore) {
                    setChannelSummaries(summaries ?? []);
                }
            } catch {
                if (!ignore) {
                    setChannelSummaries([]);
                }
            }
        };

        getChannelSummaries();

        return () => {
            ignore = true;
        };
    }, [selectedRoomId]);

    const getChannelUnreadCount = useCallback(
        (channelId) => {
            const channelSummary = channelSummaries.find(
                (summary) => String(summary.channel?.id) === String(channelId)
            );

            return Number(channelSummary?.unreadCount ?? 0);
        },
        [channelSummaries]
    );

    const clearChannelUnreadCount = useCallback((channelId) => {
        setChannelSummaries((prevSummaries) =>
            prevSummaries.map((summary) =>
                String(summary.channel?.id) === String(channelId)
                    ? {
                          ...summary,
                          unreadCount: 0,
                      }
                    : summary
            )
        );
    }, []);

    const handleReceiveMessage = useCallback(
        (receivedMessage) => {
            addMessage(receivedMessage);

            if (!selectedChannelId) return;

            clearChannelUnreadCount(selectedChannelId);
            requestMarkAdminChatAsRead(selectedChannelId)
                .then(() => {
                    window.dispatchEvent(new Event(CHAT_UNREAD_CHANGE_EVENT));
                })
                .catch(() => {});
        },
        [addMessage, clearChannelUnreadCount, selectedChannelId]
    );

    const handleUnreadEvent = useCallback(
        (event) => {
            if (!event?.channelId) return;

            const isCurrentChannel =
                String(selectedChannelId) === String(event.channelId);

            if (isCurrentChannel) {
                clearChannelUnreadCount(event.channelId);
                window.dispatchEvent(new Event(CHAT_UNREAD_CHANGE_EVENT));
                return;
            }

            setChannelSummaries((prevSummaries) =>
                prevSummaries.map((summary) =>
                    String(summary.channel?.id) === String(event.channelId)
                        ? {
                              ...summary,
                              unreadCount: Number(event.unreadCount ?? 0),
                          }
                        : summary
                )
            );

            window.dispatchEvent(new Event(CHAT_UNREAD_CHANGE_EVENT));
        },
        [clearChannelUnreadCount, selectedChannelId]
    );

    const {
        chatClientRef,
        isSocketConnected,
        isSending,
        isFileSending,
        socketError,
        sendMessage,
        sendFile,
    } = useAdminChatSocket({
        roomId: selectedRoom?.id,
        selectedChannel,
        onReceiveMessage: handleReceiveMessage,
        onMessageEvent: handleMessageEvent,
        onChannelEvent: handleChannelEvent,
        onUnreadEvent: handleUnreadEvent,
    });

    const { members, onlineMembers, offlineMembers, hasPresenceLoaded } =
        useAdminChatPresence({
            chatClientRef,
            isSocketConnected,
            selectedRoom,
            selectedChannel,
        });

    const handleSelectChannel = async (channel) => {
        if (String(selectedChannel?.id) === String(channel?.id)) {
            return;
        }

        clearMessages();
        updateSelectedChannel(channel);

        try {
            await requestMarkAdminChatAsRead(channel.id);
            setChannelSummaries((prevSummaries) =>
                prevSummaries.map((summary) =>
                    String(summary.channel?.id) === String(channel.id)
                        ? {
                              ...summary,
                              unreadCount: 0,
                          }
                        : summary
                )
            );

            window.dispatchEvent(new Event(CHAT_UNREAD_CHANGE_EVENT));
        } catch {
            // 읽음 처리 실패해도 채팅 조회 자체는 막지 않음
        }
    };

    const handleSelectRoom = (room) => {
        if (String(selectedRoom?.id) === String(room?.id)) {
            return;
        }

        clearMessages();
        updateSelectedRoom(room);
    };

    const finalError = error || messageError || socketError;

    const showEmptyChannel =
        !isLoading && !isMessageLoading && !selectedChannel;

    const showEmptyMessage =
        !isLoading &&
        !isMessageLoading &&
        selectedChannel &&
        messages.length === 0;

    const showMessageList =
        !isLoading &&
        !isMessageLoading &&
        selectedChannel &&
        messages.length > 0;

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.panel}>
                <aside className={styles.roomSidebar}>
                    <div className={styles.roomHeader}>
                        <h1>채팅 관리</h1>
                        <p>팀별 채팅방 확인 및 메세지 작성</p>
                    </div>

                    <div className={styles.roomList}>
                        {rooms.map((room) => (
                            <button
                                key={room.id}
                                type="button"
                                className={`${styles.roomButton} ${
                                    selectedRoom?.id === room.id
                                        ? styles.selectedRoom
                                        : ""
                                }`}
                                onClick={() => handleSelectRoom(room)}
                            >
                                <strong>{room.teamName}</strong>
                                <span>{room.channels?.length ?? 0}개 채널</span>
                            </button>
                        ))}
                    </div>
                </aside>

                <section className={styles.chatLayout}>
                    <ChatSidebar
                        teamName={selectedRoom?.teamName}
                        channels={selectedRoom?.channels ?? []}
                        selectedChannelId={selectedChannel?.id}
                        getChannelUnreadCount={getChannelUnreadCount}
                        canManageChannel={false}
                        onSelectChannel={handleSelectChannel}
                        onOpenChannelModal={() => {}}
                        onEditChannel={() => {}}
                        onDeleteChannel={() => {}}
                    />

                    <section className={styles.chatContent}>
                        {finalError && (
                            <p className={styles.errorText}>{finalError}</p>
                        )}

                        <div className={styles.messageArea}>
                            {isLoading && showRoomLoading && (
                                <p className={styles.emptyText}>
                                    채팅방을 불러오는 중입니다.
                                </p>
                            )}

                            {!isLoading &&
                                isMessageLoading &&
                                showMessageLoading && (
                                    <p className={styles.emptyText}>
                                        메시지를 불러오는 중입니다.
                                    </p>
                                )}

                            {showEmptyChannel && (
                                <p className={styles.emptyText}>
                                    선택할 수 있는 채널이 없습니다.
                                </p>
                            )}

                            {showEmptyMessage && (
                                <p className={styles.emptyText}>
                                    아직 작성된 메시지가 없습니다.
                                </p>
                            )}

                            {showMessageList && (
                                <ChatMessageList
                                    messageListRef={messageListRef}
                                    messages={messages}
                                    currentUserId={currentUserId}
                                    isLoadingMoreMessages={
                                        isLoadingMoreMessages
                                    }
                                    onScroll={handleMessageScroll}
                                    onEditMessage={handleEditMessage}
                                    onDeleteMessage={handleDeleteMessage}
                                />
                            )}
                        </div>

                        <ChatInput
                            onSend={sendMessage}
                            onFileSend={sendFile}
                            disabled={!selectedChannel}
                            isSending={isSending}
                            isFileSending={isFileSending}
                        />
                    </section>

                    <ChatMemberSidebar
                        hasPresenceLoaded={hasPresenceLoaded}
                        members={members}
                        onlineMembers={onlineMembers}
                        offlineMembers={offlineMembers}
                    />
                </section>
            </main>
        </div>
    );
};

export default AdminChatManage;
