import Header from "../../../components/common/header/Header";
import ChatInput from "../../../components/common/chat/ChatInput";
import authStore from "../../../store/authStore";
import ChatChannelModal from "../../../components/common/chat/ChatChannelModal";
import ChatMemberSidebar from "../../../components/common/chat/ChatMemberSidebar";
import ChatMessageList from "../../../components/common/chat/ChatMessageList";
import ChatSidebar from "../../../components/common/chat/ChatSidebar";
import useUserTeamChat from "../../../hooks/useUserTeamChat";
import styles from "./UserTeamChat.module.css";

const UserTeamChat = () => {
    const user = authStore((state) => state.user);
    const currentUserId = user?.userId;
    const {
        room,
        selectedChannel,
        messages,
        members,
        onlineMembers,
        offlineMembers,
        isLoading,
        isMessageLoading,
        isLoadingMoreMessages,
        hasPresenceLoaded,
        socketConnected,
        isSending,
        isFileSending,
        error,
        isChannelModalOpen,
        channelModalMode,
        targetChannel,
        newChannelName,
        channelCreateError,
        isCreatingChannel,
        messageListRef,
        updateSelectedChannel,
        getChannelUnreadCount,
        handleSendMessage,
        handleSendFile,
        handleEditMessage,
        handleDeleteMessage,
        handleMessageScroll,
        handleSubmitChannelModal,
        changeNewChannelName,
        openCreateChannelModal,
        openEditChannelModal,
        openDeleteChannelModal,
        closeChannelModal,
    } = useUserTeamChat();
    const roomMembers = room?.members ?? room?.teamMembers ?? [];

    const currentMember =
        room?.myMember ??
        roomMembers.find(
            (member) => String(member.userId) === String(currentUserId)
        ) ??
        members.find(
            (member) => String(member.userId) === String(currentUserId)
        );

    const canManageChannel =
        currentMember?.leaderRole === "LEADER" ||
        currentMember?.role === "LEADER" ||
        currentMember?.isLeader === true;
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
    const channelCount = room?.channels?.length ?? 0;
    const memberCount = members.length || roomMembers.length;

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.panel}>
                <section className={styles.chatLayout}>
                    <ChatSidebar
                        teamName={room?.teamName}
                        channels={room?.channels ?? []}
                        selectedChannelId={selectedChannel?.id}
                        getChannelUnreadCount={getChannelUnreadCount}
                        canManageChannel={canManageChannel}
                        onSelectChannel={updateSelectedChannel}
                        onOpenChannelModal={openCreateChannelModal}
                        onEditChannel={openEditChannelModal}
                        onDeleteChannel={openDeleteChannelModal}
                    />

                    <section className={styles.chatContent}>
                        {error && <p className={styles.errorText}>{error}</p>}

                        <header className={styles.chatHeader}>
                            <div>
                                <span className={styles.chatHeaderLabel}>
                                    현재 채널
                                </span>
                                <h2>
                                    {selectedChannel
                                        ? `# ${selectedChannel.channelName}`
                                        : "채널을 선택해주세요"}
                                </h2>
                                <p className={styles.chatHeaderMeta}>
                                    {channelCount}개 채널 · {memberCount}명 팀원
                                </p>
                            </div>

                            <span
                                className={`${styles.connectionBadge} ${
                                    socketConnected
                                        ? styles.connected
                                        : styles.disconnected
                                }`}
                            >
                                {socketConnected ? "실시간 연결" : "연결 대기"}
                            </span>
                        </header>

                        <div className={styles.messageArea}>
                            {isLoading && (
                                <p className={styles.emptyText}>
                                    팀 채팅방을 불러오는 중입니다.
                                </p>
                            )}

                            {!isLoading && isMessageLoading && (
                                <p className={styles.emptyText}>
                                    메시지를 불러오는 중입니다.
                                </p>
                            )}

                            {showEmptyChannel && (
                                <p className={styles.emptyText}>
                                    아직 생성된 채팅 채널이 없습니다.
                                </p>
                            )}

                            {showEmptyMessage && (
                                <p className={styles.emptyText}>
                                    첫 메시지를 보내 팀 대화를 시작해보세요.
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
                            onSend={handleSendMessage}
                            onFileSend={handleSendFile}
                            disabled={!selectedChannel}
                            isSending={isSending}
                            isFileSending={isFileSending}
                            placeholder={
                                selectedChannel
                                    ? `${selectedChannel.channelName}에 메시지 입력`
                                    : "채널을 선택하면 메시지를 보낼 수 있습니다"
                            }
                        />
                    </section>

                    <ChatMemberSidebar
                        hasPresenceLoaded={hasPresenceLoaded}
                        members={members}
                        onlineMembers={onlineMembers}
                        offlineMembers={offlineMembers}
                    />

                    {isChannelModalOpen && (
                        <ChatChannelModal
                            mode={channelModalMode}
                            targetChannel={targetChannel}
                            channelName={newChannelName}
                            error={channelCreateError}
                            isCreating={isCreatingChannel}
                            onChangeChannelName={changeNewChannelName}
                            onClose={closeChannelModal}
                            onSubmit={handleSubmitChannelModal}
                        />
                    )}
                </section>
            </main>
        </div>
    );
};

export default UserTeamChat;
