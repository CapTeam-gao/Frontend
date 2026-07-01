import api from "./api";

const getResponseData = (response) => response.data.data;

export const requestAdminChatRooms = async () => {
    const response = await api.get("/api/admin/chat/rooms");
    return getResponseData(response);
};

export const requestAdminChatRoom = async (roomId) => {
    const response = await api.get(`/api/admin/chat/rooms/${roomId}`);
    return getResponseData(response);
};

export const requestAdminChatMessages = async (
    channelId,
    { page = 0, size = 30 } = {}
) => {
    const response = await api.get(
        `/api/admin/chat/channels/${channelId}/messages`,
        {
            params: {
                page,
                size,
            },
        }
    );

    return getResponseData(response);
};

export const requestAdminChatUnreadSummary = async () => {
    const response = await api.get("/api/admin/chat/unread-summary");

    return getResponseData(response);
};

export const requestAdminChannelSummaries = async (roomId) => {
    const response = await api.get(
        `/api/admin/chat/rooms/${roomId}/channel-summaries`
    );

    return getResponseData(response);
};

export const requestMarkAdminChatAsRead = async (channelId) => {
    const response = await api.post(
        `/api/admin/chat/channels/${channelId}/read`
    );

    return getResponseData(response);
};
