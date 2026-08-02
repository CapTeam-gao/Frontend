import { useEffect, useState } from "react";
import useChatMessages from "./useChatMessages";
import useChatPresence from "./useChatPresence";
import useChatRoom from "./useChatRoom";
import useChatSocket from "./useChatSocket";

let toastIdSeq = 1;

const useUserTeamChat = () => {
    const [error, setError] = useState("");
    const [toasts, setToasts] = useState([]);
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
        onForeignMessage: (channel, receivedMessage) => {
            setToasts((prevToasts) => [
                ...prevToasts,
                {
                    id: toastIdSeq++,
                    channelId: channel.id,
                    channelName: channel.channelName,
                    senderName: receivedMessage.senderName,
                    preview: receivedMessage.message,
                },
            ]);
        },
        setError,
    });

    const dismissToast = (toastId) => {
        setToasts((prevToasts) =>
            prevToasts.filter((toast) => toast.id !== toastId)
        );
    };

    const selectToastChannel = (toast) => {
        const channel = (room?.channels ?? []).find(
            (candidate) => String(candidate.id) === String(toast.channelId)
        );

        if (channel) {
            updateSelectedChannel(channel);
        }
    };

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
        toasts,
        dismissToast,
        selectToastChannel,
    };
};

export default useUserTeamChat;
