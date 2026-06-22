import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
    requestAdminChatMessages,
    requestMarkAdminChatAsRead,
} from "../api/adminChatApi";
import {
    requestDeleteChatMessage,
    requestUpdateChatMessage,
} from "../api/chatApi";

const getPageContent = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    return [];
};

const useAdminChatMessages = (selectedChannel) => {
    const isLoadingOlderMessagesRef = useRef(false);
    const messageListRef = useRef(null);

    const [messages, setMessages] = useState([]);
    const [isMessageLoading, setIsMessageLoading] = useState(false);
    const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useState(false);
    const [messagePage, setMessagePage] = useState(0);
    const [hasMoreMessages, setHasMoreMessages] = useState(false);
    const [messageError, setMessageError] = useState("");

    const selectedChannelId = selectedChannel?.id;

    const scrollToBottom = useCallback(() => {
        if (isLoadingOlderMessagesRef.current) return;

        const currentMessageList = messageListRef.current;

        if (currentMessageList) {
            currentMessageList.scrollTop = currentMessageList.scrollHeight;
        }

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const messageList = messageListRef.current;

                if (!messageList) return;

                messageList.scrollTo({
                    top: messageList.scrollHeight,
                });
            });
        });
    }, []);

    useEffect(() => {
        if (!selectedChannelId) return undefined;

        const getMessages = async () => {
            try {
                setIsMessageLoading(true);
                setMessageError("");

                const data = await requestAdminChatMessages(selectedChannelId);
                const messageList = getPageContent(data);

                setMessages([...messageList].reverse());
                setMessagePage(0);
                setHasMoreMessages(data.last === false);

                await requestMarkAdminChatAsRead(selectedChannelId);
            } catch {
                setMessageError("메시지를 불러오지 못했습니다.");
            } finally {
                setIsMessageLoading(false);
            }
        };

        getMessages();
    }, [selectedChannelId]);

    useLayoutEffect(() => {
        if (isMessageLoading || messages.length === 0) return;

        scrollToBottom();
    }, [isMessageLoading, messages, selectedChannelId, scrollToBottom]);

    const addMessage = useCallback(
        (message) => {
            setMessages((prevMessages) => {
                const alreadyExists = prevMessages.some(
                    (prevMessage) =>
                        String(prevMessage.id) === String(message.id)
                );

                if (alreadyExists) return prevMessages;

                return [...prevMessages, message].sort(
                    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                );
            });

            scrollToBottom();
        },
        [scrollToBottom]
    );

    const handleMessageEvent = useCallback((event) => {
        if (!event?.type) return;

        if (event.type === "MESSAGE_UPDATED" && event.message) {
            setMessages((prevMessages) =>
                prevMessages.map((message) =>
                    String(message.id) === String(event.message.id)
                        ? { ...message, ...event.message }
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
            !selectedChannelId
        ) {
            return;
        }

        const previousScrollHeight = messageList.scrollHeight;
        const nextPage = messagePage + 1;

        try {
            setIsLoadingMoreMessages(true);
            isLoadingOlderMessagesRef.current = true;

            const data = await requestAdminChatMessages(selectedChannelId, {
                page: nextPage,
                size: 30,
            });

            const olderMessages = [...getPageContent(data)].reverse();

            setMessages((prevMessages) => {
                const prevMessageIds = new Set(
                    prevMessages.map((message) => String(message.id))
                );

                const nextMessages = olderMessages.filter(
                    (message) => !prevMessageIds.has(String(message.id))
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
            setMessageError("이전 메시지를 불러오지 못했습니다.");
        } finally {
            setIsLoadingMoreMessages(false);
        }
    };

    const clearMessages = useCallback(() => {
        setMessages([]);
        setMessagePage(0);
        setHasMoreMessages(false);
    }, []);

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
                    String(message.id) === String(messageId)
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
            setMessageError("메시지 수정에 실패했습니다.");
            throw new Error("메시지 수정 실패");
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (!messageId) return;

        try {
            await requestDeleteChatMessage(messageId);

            setMessages((prevMessages) =>
                prevMessages.filter(
                    (message) => String(message.id) !== String(messageId)
                )
            );
        } catch {
            setMessageError("메시지 삭제에 실패했습니다.");
            throw new Error("메시지 삭제 실패");
        }
    };

    return {
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
    };
};

export default useAdminChatMessages;
