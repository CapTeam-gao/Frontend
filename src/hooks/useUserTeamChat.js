import { useEffect, useState } from "react";
import useChatMessages from "./useChatMessages";
import useChatPresence from "./useChatPresence";
import useChatRoom from "./useChatRoom";
import useChatSocket from "./useChatSocket";

const useUserTeamChat = () => {
    const [error, setError] = useState("");
    const {
        room,
        selectedChannel,
        isLoading,
        isChannelModalOpen,
        channelModalMode,
        targetChannel,
        newChannelName,
        channelCreateError,
        isCreatingChannel,
        updateSelectedChannel,
        getChannelUnreadCount,
        clearChannelUnreadCount,
        increaseChannelUnreadCount,
        handleSubmitChannelModal,
        changeNewChannelName,
        openCreateChannelModal,
        openEditChannelModal,
        openDeleteChannelModal,
        handleChannelEvent,
        closeChannelModal,
    } = useChatRoom({ setError });

    const {
        messages,
        setMessages,
        isMessageLoading,
        isLoadingMoreMessages,
        messageListRef,
        scrollToBottom,
        handleEditMessage,
        handleDeleteMessage,
        handleMessageEvent,
        handleMessageScroll,
    } = useChatMessages({
        selectedChannel,
        clearChannelUnreadCount,
        setError,
    });

    const {
        chatClientRef,
        socketConnected,
        isSending,
        isFileSending,
        handleSendMessage,
        handleSendFile,
    } = useChatSocket({
        roomId: room?.id,
        selectedChannel,
        channels: room?.channels ?? [],
        setMessages,
        onMessageEvent: handleMessageEvent,
        onChannelEvent: handleChannelEvent,
        clearChannelUnreadCount,
        increaseChannelUnreadCount,
        setError,
    });

    const {
        members,
        onlineMembers,
        offlineMembers,
        hasPresenceLoaded,
    } = useChatPresence({
        selectedChannel,
        socketConnected,
        chatClientRef,
        setError,
    });

    useEffect(() => {
        return scrollToBottom({
            isPageLoading: isLoading,
        });
    }, [
        isLoading,
        isMessageLoading,
        messages,
        selectedChannel?.id,
        scrollToBottom,
    ]);

    return {
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
    };
};

export default useUserTeamChat;
