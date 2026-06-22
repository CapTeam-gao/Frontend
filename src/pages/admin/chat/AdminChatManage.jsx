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
        onReceiveMessage: addMessage,
        onMessageEvent: handleMessageEvent,
        onChannelEvent: handleChannelEvent,
    });

    const { members, onlineMembers, offlineMembers, hasPresenceLoaded } =
        useAdminChatPresence({
            chatClientRef,
            isSocketConnected,
            selectedRoom,
            selectedChannel,
        });

    const getChannelUnreadCount = () => 0;

    const handleSelectRoom = (room) => {
        if (String(selectedRoom?.id) === String(room?.id)) {
            return;
        }

        clearMessages();
        updateSelectedRoom(room);
    };

    const handleSelectChannel = (channel) => {
        if (String(selectedChannel?.id) === String(channel?.id)) {
            return;
        }

        clearMessages();
        updateSelectedChannel(channel);
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
                        <p>팀별 채팅방을 확인하고 메시지를 작성합니다.</p>
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
                            {isLoading && (
                                <p className={styles.emptyText}>
                                    채팅방을 불러오는 중입니다.
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
