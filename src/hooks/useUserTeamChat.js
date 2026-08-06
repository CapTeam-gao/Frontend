import { useEffect, useState } from "react";
import { requestMyTeam } from "../api/teamApi";
import useChatMessages from "./useChatMessages";
import useChatPresence from "./useChatPresence";
import useChatRoom from "./useChatRoom";
import useChatSocket from "./useChatSocket";

let toastIdSeq = 1;

const useUserTeamChat = () => {
    const [error, setError] = useState("");
    const [toasts, setToasts] = useState([]);
    const [memberRoles, setMemberRoles] = useState({});
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
        members: presenceMembers,
        onlineMembers: presenceOnlineMembers,
        offlineMembers: presenceOfflineMembers,
        hasPresenceLoaded,
    } = useChatPresence({
        selectedChannel,
        socketConnected,
        chatClientRef,
        setError,
    });

    // presence 응답엔 담당 업무(studentRole)가 없어서, 이미 확정된 팀 정보 API(/api/teams/my-team)에서
    // 한 번만 받아 userId로 합쳐준다.
    useEffect(() => {
        if (!room?.id) return;

        let isMounted = true;

        requestMyTeam()
            .then((data) => {
                if (!isMounted) return;

                const roleByUserId = {};
                (data?.members ?? []).forEach((member) => {
                    roleByUserId[member.userId] = member.studentRole;
                });
                setMemberRoles(roleByUserId);
            })
            .catch(() => {});

        return () => {
            isMounted = false;
        };
    }, [room?.id]);

    const withStudentRole = (memberList) =>
        memberList.map((member) => ({
            ...member,
            studentRole: memberRoles[member.userId],
        }));

    const members = withStudentRole(presenceMembers);
    const onlineMembers = withStudentRole(presenceOnlineMembers);
    const offlineMembers = withStudentRole(presenceOfflineMembers);

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
