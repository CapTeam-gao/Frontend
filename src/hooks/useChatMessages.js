import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
    requestDeleteChatMessage,
    requestUpdateChatMessage,
} from "../api/chatApi";
import { parseChatDate } from "../utils/chat";

const getPageContent = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    return [];
};

const useChatMessages = ({
    selectedChannel,
    fetchMessages,
    markAsRead,
    onReadComplete,
    onError,
    autoScrollOnLoad = false,
}) => {
    const isLoadingOlderMessagesRef = useRef(false);
    const messageListRef = useRef(null);

    const [messages, setMessages] = useState([]);
    const [isMessageLoading, setIsMessageLoading] = useState(false);
    const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useState(false);
    const [messagePage, setMessagePage] = useState(0);
    const [hasMoreMessages, setHasMoreMessages] = useState(false);
    const [messageError, setMessageError] = useState("");

    const selectedChannelId = selectedChannel?.id;

    const setErrorMessage = useCallback(
        (message) => {
            setMessageError(message);
            onError?.(message);
        },
        [onError]
    );

    const scrollToBottom = useCallback(
        ({ isPageLoading } = {}) => {
            if (isLoadingOlderMessagesRef.current) return;
            if (isPageLoading || isMessageLoading || messages.length === 0) {
                return;
            }

            const messageList = messageListRef.current;

            if (!messageList) return;

            const frameId = requestAnimationFrame(() => {
                messageList.scrollTop = messageList.scrollHeight;
            });

            return () => {
                cancelAnimationFrame(frameId);
            };
        },
        [isMessageLoading, messages.length]
    );

    useEffect(() => {
        if (!selectedChannelId) return undefined;

        let ignore = false;

        const getMessages = async () => {
            try {
                setIsMessageLoading(true);
                setMessageError("");

                const data = await fetchMessages(selectedChannelId);
                const messageList = getPageContent(data);

                if (ignore) return;

                setMessages([...messageList].reverse());
                setMessagePage(0);
                setHasMoreMessages(data.last === false);

                await markAsRead(selectedChannelId);
                if (!ignore) onReadComplete?.();
            } catch {
                if (!ignore) setErrorMessage("메시지를 불러오지 못했습니다.");
            } finally {
                if (!ignore) setIsMessageLoading(false);
            }
        };

        getMessages();

        return () => {
            ignore = true;
        };
    }, [
        selectedChannelId,
        fetchMessages,
        markAsRead,
        onReadComplete,
        setErrorMessage,
    ]);

    useLayoutEffect(() => {
        if (!autoScrollOnLoad) return;
        if (isMessageLoading || messages.length === 0) return;

        scrollToBottom();
    }, [autoScrollOnLoad, isMessageLoading, messages, scrollToBottom]);

    const addMessage = useCallback(
        (message) => {
            setMessages((prevMessages) => {
                const alreadyExists = prevMessages.some(
                    (prevMessage) =>
                        String(prevMessage.id) === String(message.id)
                );

                if (alreadyExists) return prevMessages;

                return [...prevMessages, message].sort(
                    (a, b) =>
                        parseChatDate(a.createdAt) - parseChatDate(b.createdAt)
                );
            });

            if (autoScrollOnLoad) scrollToBottom();
        },
        [autoScrollOnLoad, scrollToBottom]
    );

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
            setErrorMessage("메시지 수정에 실패했습니다.");
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
            setErrorMessage("메시지 삭제에 실패했습니다.");
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
            !selectedChannelId
        ) {
            return;
        }

        const previousScrollHeight = messageList.scrollHeight;
        const nextPage = messagePage + 1;

        try {
            setIsLoadingMoreMessages(true);
            isLoadingOlderMessagesRef.current = true;

            const data = await fetchMessages(selectedChannelId, {
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
            setErrorMessage("이전 메시지를 불러오지 못했습니다.");
        } finally {
            setIsLoadingMoreMessages(false);
        }
    };

    return {
        messages,
        setMessages,
        addMessage,
        clearMessages,
        isMessageLoading,
        isLoadingMoreMessages,
        messageError,
        messageListRef,
        scrollToBottom,
        handleEditMessage,
        handleDeleteMessage,
        handleMessageEvent,
        handleMessageScroll,
    };
};

export default useChatMessages;
