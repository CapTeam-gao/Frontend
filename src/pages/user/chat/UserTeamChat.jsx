import { useState } from "react";
import Header from "../../../components/common/header/Header";
import ChatInput from "../../../components/common/chat/ChatInput";
import authStore from "../../../store/authStore";
import ChatChannelModal from "../../../components/common/chat/ChatChannelModal";
import ChatMemberSidebar from "../../../components/common/chat/ChatMemberSidebar";
import ChatMessageList from "../../../components/common/chat/ChatMessageList";
import ChatPinnedBar from "../../../components/common/chat/ChatPinnedBar";
import ChatSidebar from "../../../components/common/chat/ChatSidebar";
import ChatToast from "../../../components/common/chat/ChatToast";
import useUserTeamChat from "../../../hooks/useUserTeamChat";
import {
    requestPinChatMessage,
    requestUnpinChatMessage,
} from "../../../api/chatApi";
import styles from "./UserTeamChat.module.css";

const FLASH_DURATION_MS = 1100;

const UserTeamChat = () => {
    const user = authStore((state) => state.user);
    const currentUserId = user?.userId;
    const [flashingMessageId, setFlashingMessageId] = useState(null);
    const [isPinUpdating, setIsPinUpdating] = useState(false);
    const [pinError, setPinError] = useState("");
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
        toasts,
        dismissToast,
        selectToastChannel,
    } = useUserTeamChat();
    const currentMember = room?.myMember;
    const pinnedMessageId = selectedChannel?.pinnedMessageId ?? null;
    const pinnedMessage = messages.find(
        (message) => message.id === pinnedMessageId
    );

    const handleTogglePin = async (messageId) => {
        if (!selectedChannel?.id || isPinUpdating) return;

        try {
            setIsPinUpdating(true);
            setPinError("");

            if (pinnedMessageId === messageId) {
                await requestUnpinChatMessage(selectedChannel.id);
            } else {
                await requestPinChatMessage(selectedChannel.id, messageId);
            }
        } catch {
            setPinError("메시지 고정에 실패했습니다.");
        } finally {
            setIsPinUpdating(false);
        }
    };

    const handleUnpin = async () => {
        if (!selectedChannel?.id || isPinUpdating) return;

        try {
            setIsPinUpdating(true);
            setPinError("");
            await requestUnpinChatMessage(selectedChannel.id);
        } catch {
            setPinError("고정 해제에 실패했습니다.");
        } finally {
            setIsPinUpdating(false);
        }
    };

    const handleJumpToPinnedMessage = () => {
        if (!pinnedMessage) return;

        const target = document.getElementById(
            `chat-message-${pinnedMessage.id}`
        );
        target?.scrollIntoView({ behavior: "smooth", block: "center" });

        setFlashingMessageId(pinnedMessage.id);
        window.setTimeout(() => {
            setFlashingMessageId((current) =>
                current === pinnedMessage.id ? null : current
            );
        }, FLASH_DURATION_MS);
    };

    const canManageChannel = currentMember?.leaderRole === "LEADER";
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
    const memberCount = members.length;
    const isChatInputDisabled = !selectedChannel || !socketConnected;
    const chatInputPlaceholder = !selectedChannel
        ? "채널을 선택하면 메시지를 보낼 수 있습니다"
        : !socketConnected
        ? "채팅 서버에 연결하는 중입니다"
        : `${selectedChannel.channelName}에 메시지 입력`;

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
                        {selectedChannel && (
                            <div className={styles.chatHeader}>
                                <div className={styles.chatHeaderTitle}>
                                    {selectedChannel.channelName}
                                </div>
                                <div className={styles.chatHeaderMeta}>
                                    {memberCount}명 참여 중
                                </div>
                            </div>
                        )}

                        <ChatPinnedBar
                            pinnedMessage={pinnedMessage}
                            onJump={handleJumpToPinnedMessage}
                            onUnpin={handleUnpin}
                        />

                        {error && <p className={styles.errorText}>{error}</p>}
                        {pinError && (
                            <p className={styles.errorText}>{pinError}</p>
                        )}

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
                                    pinnedMessageId={pinnedMessageId}
                                    flashingMessageId={flashingMessageId}
                                    onTogglePin={handleTogglePin}
                                />
                            )}
                        </div>

                        <ChatInput
                            onSend={handleSendMessage}
                            onFileSend={handleSendFile}
                            disabled={isChatInputDisabled}
                            isSending={isSending}
                            isFileSending={isFileSending}
                            placeholder={chatInputPlaceholder}
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

            <ChatToast
                toasts={toasts}
                onDismiss={dismissToast}
                onSelect={selectToastChannel}
            />
        </div>
    );
};

export default UserTeamChat;
