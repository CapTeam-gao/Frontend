import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getStoredAccessToken } from "../utils/authToken";

const getSocketUrl = () => {
    const baseUrl = import.meta.env.VITE_BASE_URL;

    return `${baseUrl}/ws`;
};

export const createChatClient = ({ onConnect, onError } = {}) => {
    const accessToken = getStoredAccessToken();

    const client = new Client({
        webSocketFactory: () => new SockJS(getSocketUrl()),

        connectHeaders: {
            Authorization: `Bearer ${accessToken}`,
        },

        reconnectDelay: 3000,

        onConnect: () => {
            onConnect?.(client);
        },

        onStompError: (frame) => {
            console.error("STOMP 오류:", frame);
            onError?.(frame);
        },

        onWebSocketError: (error) => {
            console.error("WebSocket 오류:", error);
            onError?.(error);
        },
    });

    return client;
};

export const subscribeChatChannel = (client, channelId, onMessage) => {
    return client.subscribe(`/sub/chat/${channelId}`, (message) => {
        const receivedMessage = JSON.parse(message.body);

        onMessage(receivedMessage);
    });
};

export const sendChatSocketMessage = (client, channelId, message) => {
    client.publish({
        destination: `/pub/chat/${channelId}/send`,
        body: JSON.stringify({
            message,
        }),
    });
};
