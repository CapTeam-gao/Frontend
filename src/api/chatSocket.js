import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { requestReissue } from "./authApi";
import authStore from "../store/authStore";
import {
    getStoredAccessToken,
    isAccessTokenExpiringSoon,
} from "../utils/authToken";

const getSocketUrl = () => {
    const baseUrl = import.meta.env.VITE_BASE_URL;

    return `${baseUrl}/ws`;
};

const getFreshAccessToken = async () => {
    const currentToken = getStoredAccessToken();

    if (currentToken && !isAccessTokenExpiringSoon(currentToken)) {
        return currentToken;
    }

    const reissueData = await requestReissue();
    const newAccessToken = reissueData?.accessToken;

    if (!newAccessToken) {
        throw new Error("웹소켓 연결에 사용할 accessToken이 없습니다.");
    }

    authStore.getState().setAccessToken(newAccessToken);

    return newAccessToken;
};

export const createChatClient = ({ onConnect, onError } = {}) => {
    const client = new Client({
        webSocketFactory: () => new SockJS(getSocketUrl()),

        reconnectDelay: 3000,

        beforeConnect: async () => {
            const accessToken = await getFreshAccessToken();

            client.connectHeaders = {
                Authorization: `Bearer ${accessToken}`,
            };
        },

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

export const subscribeTeamPresence = (client, teamId, onPresenceChange) => {
    if (!client?.connected || !teamId) return null;

    return client.subscribe(`/sub/presence/teams/${teamId}`, (message) => {
        const presenceEvent = JSON.parse(message.body);

        onPresenceChange(presenceEvent);
    });
};
