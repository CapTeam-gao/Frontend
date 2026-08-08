import { useCallback, useEffect, useState } from "react";
import { requestMyTeam, requestUpdateAssignedTask } from "../api/teamApi";
import { requestChatMessages, requestMarkChatAsRead } from "../api/chatApi";
import authStore from "../store/authStore";
import useChatMessages from "./useChatMessages";
import useChatPresence from "./useChatPresence";
import useChatRoom from "./useChatRoom";
import useChatSocket from "./useChatSocket";

let toastIdSeq = 1;

const useUserTeamChat = () => {
    const currentUserId = authStore((state) => state.user?.userId);
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
        fetchMessages: requestChatMessages,
        markAsRead: requestMarkChatAsRead,
        onReadComplete: clearChannelUnreadCount,
        onError: setError,
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
        onError: setError,
    });

    // presence 응답엔 희망 직군(studentRole)·담당 업무(assignedTask)가 없어서, 이미 확정된
    // 팀 정보 API(/api/teams/my-team)에서 받아 userId로 합쳐준다.
    const loadMemberDetails = useCallback(() => {
        if (!room?.id) return undefined;

        let isMounted = true;

        requestMyTeam()
            .then((data) => {
                if (!isMounted) return;

                const detailByUserId = {};
                (data?.members ?? []).forEach((member) => {
                    detailByUserId[member.userId] = {
                        studentRole: member.studentRole,
                        assignedTask: member.assignedTask,
                    };
                });
                setMemberRoles(detailByUserId);
            })
            .catch(() => setError("팀원 정보를 불러오지 못했습니다."));

        return () => {
            isMounted = false;
        };
    }, [room?.id]);

    useEffect(() => loadMemberDetails(), [loadMemberDetails]);

    const withMemberDetails = (memberList) =>
        memberList.map((member) => ({
            ...member,
            studentRole: memberRoles[member.userId]?.studentRole,
            assignedTask: memberRoles[member.userId]?.assignedTask,
        }));

    const members = withMemberDetails(presenceMembers);
    const onlineMembers = withMemberDetails(presenceOnlineMembers);
    const offlineMembers = withMemberDetails(presenceOfflineMembers);

    const updateMyAssignedTask = async (assignedTask) => {
        if (!currentUserId) return;

        await requestUpdateAssignedTask(currentUserId, assignedTask);
        setMemberRoles((prev) => ({
            ...prev,
            [currentUserId]: {
                ...prev[currentUserId],
                assignedTask,
            },
        }));
    };

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
        updateMyAssignedTask,
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
