import { useEffect, useRef, useState } from "react";
import { requestMarkChatAsRead, requestUploadChatFile } from "../api/chatApi";
import {
    createChatClient,
    disconnectChatClient,
    sendChatSocketMessage,
    subscribeChatChannel,
    subscribeChatChannelEvents,
    subscribeChatRoomChannelEvents,
} from "../api/chatSocket";

const useChatSocket = ({
    roomId,
    selectedChannel,
    channels = [],
    setMessages,
    onMessageEvent,
    onChannelEvent,
    clearChannelUnreadCount,
    increaseChannelUnreadCount,
    setError,
}) => {
    const chatClientRef = useRef(null);
    const subscriptionRef = useRef(null);
    const messageEventSubscriptionRef = useRef(null);
    const roomChannelEventSubscriptionRef = useRef(null);
    const notificationSubscriptionsRef = useRef([]);
    const selectedChannelRef = useRef(null);

    const [socketConnected, setSocketConnected] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isFileSending, setIsFileSending] = useState(false);

    useEffect(() => {
        selectedChannelRef.current = selectedChannel;
    }, [selectedChannel]);

    useEffect(() => {
        const client = createChatClient({
            onConnect: () => {
                setSocketConnected(true);
            },
            onError: () => {
                setSocketConnected(false);
                setError("실시간 채팅 연결에 실패했습니다.");
            },
        });

        chatClientRef.current = client;
        client.activate();

        return () => {
            const chatSubscription = subscriptionRef.current;
            const messageEventSubscription =
                messageEventSubscriptionRef.current;
            const roomChannelEventSubscription =
                roomChannelEventSubscriptionRef.current;
            const notificationSubscriptions =
                notificationSubscriptionsRef.current;

            subscriptionRef.current = null;
            messageEventSubscriptionRef.current = null;
            roomChannelEventSubscriptionRef.current = null;
            notificationSubscriptionsRef.current = [];

            disconnectChatClient(client, [
                chatSubscription,
                messageEventSubscription,
                roomChannelEventSubscription,
                ...notificationSubscriptions,
            ]).catch(() => {
                client.deactivate();
            });
            setSocketConnected(false);
        };
    }, [setError]);

    useEffect(() => {
        const client = chatClientRef.current;

        if (
            !client?.connected ||
            !roomId ||
            !socketConnected ||
            !onChannelEvent
        ) {
            return undefined;
        }

        roomChannelEventSubscriptionRef.current?.unsubscribe();

        try {
            roomChannelEventSubscriptionRef.current =
                subscribeChatRoomChannelEvents(client, roomId, onChannelEvent);
        } catch {
            roomChannelEventSubscriptionRef.current = null;
            return undefined;
        }

        return () => {
            roomChannelEventSubscriptionRef.current?.unsubscribe();
            roomChannelEventSubscriptionRef.current = null;
        };
    }, [roomId, socketConnected, onChannelEvent]);

    useEffect(() => {
        const client = chatClientRef.current;

        if (!client?.connected || !selectedChannel?.id || !socketConnected) {
            return undefined;
        }

        subscriptionRef.current?.unsubscribe();
        messageEventSubscriptionRef.current?.unsubscribe();

        try {
            subscriptionRef.current = subscribeChatChannel(
                client,
                selectedChannel.id,
                (receivedMessage) => {
                    setMessages((prevMessages) => {
                        const alreadyExists = prevMessages.some(
                            (message) => message.id === receivedMessage.id
                        );

                        if (alreadyExists) return prevMessages;

                        return [...prevMessages, receivedMessage];
                    });

                    requestMarkChatAsRead(selectedChannel.id);
                    clearChannelUnreadCount(selectedChannel.id);
                }
            );

            messageEventSubscriptionRef.current = subscribeChatChannelEvents(
                client,
                selectedChannel.id,
                onMessageEvent
            );
        } catch {
            subscriptionRef.current = null;
            messageEventSubscriptionRef.current = null;
            return undefined;
        }

        return () => {
            subscriptionRef.current?.unsubscribe();
            subscriptionRef.current = null;
            messageEventSubscriptionRef.current?.unsubscribe();
            messageEventSubscriptionRef.current = null;
        };
    }, [
        selectedChannel?.id,
        socketConnected,
        setMessages,
        clearChannelUnreadCount,
        onMessageEvent,
    ]);

    useEffect(() => {
        const client = chatClientRef.current;

        if (!client?.connected || !socketConnected || !channels.length) {
            return undefined;
        }

        notificationSubscriptionsRef.current.forEach((subscription) =>
            subscription?.unsubscribe()
        );

        let notificationSubscriptions = [];

        try {
            notificationSubscriptions = channels
                .filter(
                    (channel) =>
                        String(channel.id) !==
                        String(selectedChannelRef.current?.id)
                )
                .map((channel) =>
                    subscribeChatChannel(
                        client,
                        channel.id,
                        (receivedMessage) => {
                            const currentChannel = selectedChannelRef.current;

                            if (
                                String(currentChannel?.id) === String(channel.id)
                            ) {
                                return;
                            }

                            increaseChannelUnreadCount(
                                channel.id,
                                receivedMessage
                            );
                        }
                    )
                );
        } catch {
            notificationSubscriptionsRef.current = [];
            return undefined;
        }

        notificationSubscriptionsRef.current = notificationSubscriptions;

        return () => {
            notificationSubscriptions.forEach((subscription) =>
                subscription?.unsubscribe()
            );
            notificationSubscriptionsRef.current = [];
        };
    }, [
        socketConnected,
        channels,
        selectedChannel?.id,
        increaseChannelUnreadCount,
    ]);

    const handleSendMessage = async (message) => {
        if (!selectedChannel?.id) return;

        const client = chatClientRef.current;

        if (!client?.connected) {
            setError("채팅 서버와 연결되지 않았습니다.");
            return;
        }

        try {
            setIsSending(true);
            sendChatSocketMessage(client, selectedChannel.id, message);
        } catch {
            setError("메시지 전송에 실패했습니다.");
        } finally {
            setIsSending(false);
        }
    };

    const handleSendFile = async (file, message = "") => {
        if (!selectedChannel?.id) return;

        const client = chatClientRef.current;

        if (!client?.connected) {
            setError("채팅 서버와 연결되지 않았습니다.");
            return;
        }

        try {
            setIsFileSending(true);
            setError("");

            const uploadedFile = await requestUploadChatFile(
                selectedChannel.id,
                file
            );

            sendChatSocketMessage(client, selectedChannel.id, {
                message,
                fileUrl: uploadedFile.fileUrl,
                fileName:
                    uploadedFile.originalFileName ??
                    uploadedFile.fileName ??
                    file.name,
                fileType:
                    uploadedFile.contentType ??
                    uploadedFile.fileType ??
                    file.type,
                fileSize:
                    uploadedFile.size ?? uploadedFile.fileSize ?? file.size,
            });
        } catch {
            setError("파일 전송에 실패했습니다.");
        } finally {
            setIsFileSending(false);
        }
    };

    return {
        chatClientRef,
        socketConnected,
        isSending,
        isFileSending,
        handleSendMessage,
        handleSendFile,
    };
};

export default useChatSocket;
