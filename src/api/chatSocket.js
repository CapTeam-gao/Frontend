import { Client } from "@stomp/stompjs";
import { requestReissue } from "./authApi";
import authStore from "../store/authStore";
import {
    getStoredAccessToken,
    isAccessTokenExpiringSoon,
} from "../utils/authToken";
import { getSocketBaseUrl } from "./baseUrl";

const getSocketUrl = () => {
    const baseUrl = getSocketBaseUrl();
    const url = new URL("/ws", baseUrl);

    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";

    return url.toString();
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
        webSocketFactory: () => new WebSocket(getSocketUrl()),

        reconnectDelay: 15000,

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

export const subscribeChatChannelEvents = (client, channelId, onEvent) => {
    return client.subscribe(`/sub/chat/${channelId}/events`, (message) => {
        const receivedEvent = JSON.parse(message.body);

        onEvent?.(receivedEvent);
    });
};

export const subscribeChatRoomChannelEvents = (client, roomId, onEvent) => {
    return client.subscribe(`/sub/chat/rooms/${roomId}/channels`, (message) => {
        const receivedEvent = JSON.parse(message.body);

        onEvent?.(receivedEvent);
    });
};

export const sendChatSocketMessage = (client, channelId, messagePayload) => {
    const payload =
        typeof messagePayload === "string"
            ? {
                  message: messagePayload,
              }
            : messagePayload;

    client.publish({
        destination: `/pub/chat/${channelId}/send`,
        body: JSON.stringify(payload),
    });
};

export const subscribeTeamPresence = (client, teamId, onPresenceChange) => {
    if (!client?.connected || !teamId) return null;

    return client.subscribe(`/sub/presence/teams/${teamId}`, (message) => {
        const presenceEvent = JSON.parse(message.body);

        onPresenceChange(presenceEvent);
    });
};

export const subscribeUserChatUnreadEvents = (client, onEvent) => {
    return client.subscribe("/user/queue/chat/unread", (message) => {
        const event = JSON.parse(message.body);
        onEvent?.(event);
    });
};

// api.md 8번 섹션: 다른 채널/다른 화면에서 온 채팅 메시지를 전역 토스트로 보여주기 위한 구독.
// 기존 /user/queue/chat/unread와 같은 Spring user-destination 방식(경로에 userId 안 넣음).
export const subscribeUserChatNotifications = (client, onEvent) => {
    return client.subscribe("/user/queue/chat/notifications", (message) => {
        const event = JSON.parse(message.body);
        onEvent?.(event);
    });
};

const waitForUnsubscribeReceipt = (client, subscription) => {
    if (!client?.connected || !subscription) {
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        const receiptId = `unsubscribe-${Date.now()}-${Math.random()}`;
        const timeoutId = window.setTimeout(resolve, 300);

        client.watchForReceipt(receiptId, () => {
            window.clearTimeout(timeoutId);
            resolve();
        });

        subscription.unsubscribe({
            receipt: receiptId,
        });
    });
};

export const disconnectChatClient = async (client, subscriptions = []) => {
    if (!client) return;

    client.reconnectDelay = 0;

    await Promise.all(
        subscriptions.map((subscription) =>
            waitForUnsubscribeReceipt(client, subscription)
        )
    );

    await client.deactivate();
};
export const subscribeAdminChatUnreadEvents = (client, onEvent) => {
    return client.subscribe("/sub/admin/chat/unread", (message) => {
        const event = JSON.parse(message.body);
        onEvent(event);
    });
};
