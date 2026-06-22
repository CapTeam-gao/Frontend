import { useEffect, useRef, useState } from "react";
import { requestUploadChatFile } from "../api/chatApi";
import {
    createChatClient,
    disconnectChatClient,
    sendChatSocketMessage,
    subscribeChatChannel,
    subscribeChatChannelEvents,
    subscribeChatRoomChannelEvents,
} from "../api/chatSocket";

const useAdminChatSocket = ({
    roomId,
    selectedChannel,
    onReceiveMessage,
    onMessageEvent,
    onChannelEvent,
}) => {
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isFileSending, setIsFileSending] = useState(false);
    const [socketError, setSocketError] = useState("");

    const chatClientRef = useRef(null);
    const channelSubscriptionRef = useRef(null);
    const messageEventSubscriptionRef = useRef(null);
    const roomChannelEventSubscriptionRef = useRef(null);

    const selectedChannelId = selectedChannel?.id;

    useEffect(() => {
        const client = createChatClient({
            onConnect: () => {
                chatClientRef.current = client;
                setIsSocketConnected(true);
            },
            onError: () => {
                setIsSocketConnected(false);
                setSocketError("채팅 서버 연결에 실패했습니다.");
            },
        });

        chatClientRef.current = client;
        client.activate();

        return () => {
            const channelSubscription = channelSubscriptionRef.current;
            const messageEventSubscription =
                messageEventSubscriptionRef.current;
            const roomChannelEventSubscription =
                roomChannelEventSubscriptionRef.current;

            channelSubscriptionRef.current = null;
            messageEventSubscriptionRef.current = null;
            roomChannelEventSubscriptionRef.current = null;

            disconnectChatClient(client, [
                channelSubscription,
                messageEventSubscription,
                roomChannelEventSubscription,
            ]).catch(() => {
                client.deactivate();
            });

            setIsSocketConnected(false);
        };
    }, []);

    useEffect(() => {
        const client = chatClientRef.current;

        if (
            !client?.connected ||
            !isSocketConnected ||
            !roomId ||
            !onChannelEvent
        ) {
            return undefined;
        }

        roomChannelEventSubscriptionRef.current?.unsubscribe?.();

        try {
            roomChannelEventSubscriptionRef.current =
                subscribeChatRoomChannelEvents(client, roomId, onChannelEvent);
        } catch (error) {
            console.error("관리자 채널 이벤트 구독 실패:", error);
            roomChannelEventSubscriptionRef.current = null;

            return undefined;
        }

        return () => {
            roomChannelEventSubscriptionRef.current?.unsubscribe?.();
            roomChannelEventSubscriptionRef.current = null;
        };
    }, [isSocketConnected, roomId, onChannelEvent]);

    useEffect(() => {
        const client = chatClientRef.current;

        if (
            !client ||
            !client.connected ||
            !isSocketConnected ||
            !selectedChannelId
        ) {
            return undefined;
        }

        channelSubscriptionRef.current?.unsubscribe?.();
        messageEventSubscriptionRef.current?.unsubscribe?.();

        try {
            channelSubscriptionRef.current = subscribeChatChannel(
                client,
                selectedChannelId,
                onReceiveMessage
            );

            messageEventSubscriptionRef.current = subscribeChatChannelEvents(
                client,
                selectedChannelId,
                onMessageEvent
            );
        } catch (error) {
            console.error("관리자 채팅 구독 실패:", error);
            channelSubscriptionRef.current = null;
            messageEventSubscriptionRef.current = null;

            return undefined;
        }

        return () => {
            channelSubscriptionRef.current?.unsubscribe?.();
            messageEventSubscriptionRef.current?.unsubscribe?.();

            channelSubscriptionRef.current = null;
            messageEventSubscriptionRef.current = null;
        };
    }, [
        isSocketConnected,
        selectedChannelId,
        onReceiveMessage,
        onMessageEvent,
    ]);

    const sendMessage = async (message) => {
        if (!selectedChannelId) return;

        const client = chatClientRef.current;

        if (!client?.connected) {
            setSocketError("채팅 서버와 연결되지 않았습니다.");
            return;
        }

        try {
            setIsSending(true);
            setSocketError("");

            sendChatSocketMessage(client, selectedChannelId, {
                message,
            });
        } catch {
            setSocketError("메시지 전송에 실패했습니다.");
        } finally {
            setIsSending(false);
        }
    };

    const sendFile = async (file, message = "") => {
        if (!selectedChannelId) return;

        const client = chatClientRef.current;

        if (!client?.connected) {
            setSocketError("채팅 서버와 연결되지 않았습니다.");
            return;
        }

        try {
            setIsFileSending(true);
            setSocketError("");

            const uploadedFile = await requestUploadChatFile(
                selectedChannelId,
                file
            );

            sendChatSocketMessage(client, selectedChannelId, {
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
            setSocketError("파일 전송에 실패했습니다.");
        } finally {
            setIsFileSending(false);
        }
    };

    return {
        chatClientRef,
        isSocketConnected,
        isSending,
        isFileSending,
        socketError,
        sendMessage,
        sendFile,
    };
};

export default useAdminChatSocket;
