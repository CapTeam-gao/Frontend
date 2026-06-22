import { useCallback, useEffect, useRef, useState } from "react";
import {
    requestChatMessages,
    requestDeleteChatMessage,
    requestMarkChatAsRead,
    requestUpdateChatMessage,
} from "../api/chatApi";

const useChatMessages = ({ selectedChannel, clearChannelUnreadCount, setError }) => {
    const isLoadingOlderMessagesRef = useRef(false);
    const messageListRef = useRef(null);

    const [messages, setMessages] = useState([]);
    const [isMessageLoading, setIsMessageLoading] = useState(false);
    const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useState(false);
    const [messagePage, setMessagePage] = useState(0);
    const [hasMoreMessages, setHasMoreMessages] = useState(false);
    const selectedChannelId = selectedChannel?.id;

    useEffect(() => {
        if (!selectedChannelId) return;

        const getMessages = async () => {
            try {
                setIsMessageLoading(true);
                const data = await requestChatMessages(selectedChannelId);
                const messageList = data.content ?? [];

                setMessages([...messageList].reverse());
                setMessagePage(0);
                setHasMoreMessages(data.last === false);
                await requestMarkChatAsRead(selectedChannelId);
                clearChannelUnreadCount(selectedChannelId);
            } catch {
                setError("메시지를 불러오지 못했습니다.");
            } finally {
                setIsMessageLoading(false);
            }
        };

        getMessages();
    }, [selectedChannelId, clearChannelUnreadCount, setError]);

    const scrollToBottom = useCallback(({ isPageLoading }) => {
        if (isLoadingOlderMessagesRef.current) return;
        if (isPageLoading || isMessageLoading || messages.length === 0) return;

        const messageList = messageListRef.current;

        if (!messageList) return;

        const frameId = requestAnimationFrame(() => {
            messageList.scrollTop = messageList.scrollHeight;
        });

        return () => {
            cancelAnimationFrame(frameId);
        };
    }, [isMessageLoading, messages.length]);

    const handleEditMessage = async (messageId, nextMessage) => {
        const trimmedMessage = nextMessage.trim();

        if (!messageId || !trimmedMessage) return;

        try {
            const updatedMessage = await requestUpdateChatMessage(
                messageId,
                trimmedMessage
            );

            setMessages((prevMessages) =>
                prevMessages.map((message) =>
                    message.id === messageId
                        ? {
                              ...message,
                              ...updatedMessage,
                              message:
                                  updatedMessage?.message ?? trimmedMessage,
                          }
                        : message
                )
            );
        } catch {
            setError("메시지 수정에 실패했습니다.");
            throw new Error("메시지 수정 실패");
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (!messageId) return;

        try {
            await requestDeleteChatMessage(messageId);

            setMessages((prevMessages) =>
                prevMessages.filter((message) => message.id !== messageId)
            );
        } catch {
            setError("메시지 삭제에 실패했습니다.");
            throw new Error("메시지 삭제 실패");
        }
    };

    const handleMessageEvent = useCallback((event) => {
        if (!event?.type) return;

        if (event.type === "MESSAGE_UPDATED" && event.message) {
            setMessages((prevMessages) =>
                prevMessages.map((message) =>
                    String(message.id) === String(event.message.id)
                        ? {
                              ...message,
                              ...event.message,
                          }
                        : message
                )
            );
        }

        if (event.type === "MESSAGE_DELETED" && event.messageId) {
            setMessages((prevMessages) =>
                prevMessages.filter(
                    (message) => String(message.id) !== String(event.messageId)
                )
            );
        }
    }, []);

    const handleMessageScroll = async (event) => {
        const messageList = event.currentTarget;

        if (
            messageList.scrollTop > 40 ||
            isLoadingMoreMessages ||
            !hasMoreMessages ||
            !selectedChannel?.id
        ) {
            return;
        }

        const previousScrollHeight = messageList.scrollHeight;
        const nextPage = messagePage + 1;

        try {
            setIsLoadingMoreMessages(true);
            isLoadingOlderMessagesRef.current = true;

            const data = await requestChatMessages(selectedChannel.id, {
                page: nextPage,
                size: 30,
            });
            const olderMessages = [...(data.content ?? [])].reverse();

            setMessages((prevMessages) => {
                const prevMessageIds = new Set(
                    prevMessages.map((message) => message.id)
                );
                const nextMessages = olderMessages.filter(
                    (message) => !prevMessageIds.has(message.id)
                );

                return [...nextMessages, ...prevMessages];
            });
            setMessagePage(nextPage);
            setHasMoreMessages(data.last === false);

            requestAnimationFrame(() => {
                messageList.scrollTop =
                    messageList.scrollHeight - previousScrollHeight;
                isLoadingOlderMessagesRef.current = false;
            });
        } catch {
            isLoadingOlderMessagesRef.current = false;
            setError("이전 메시지를 불러오지 못했습니다.");
        } finally {
            setIsLoadingMoreMessages(false);
        }
    };

    return {
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
    };
};

export default useChatMessages;
