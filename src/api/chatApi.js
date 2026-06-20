import api from "./api";

const getResponseData = (response) => response.data?.data ?? response.data;

export const requestMyChatRoom = async () => {
    const response = await api.get("/api/chat/rooms/my");

    return getResponseData(response);
};

export const requestChatMessages = async (
    channelId,
    { page = 0, size = 30 } = {}
) => {
    const response = await api.get(`/api/chat/channels/${channelId}/messages`, {
        params: {
            page,
            size,
        },
    });

    return getResponseData(response);
};

// export const requestSendChatMessage = async (channelId, message) => {
//     const response = await api.post(
//         `/api/chat/channels/${channelId}/messages`,
//         {
//             message,
//         }
//     );

//     return getResponseData(response);
// };

export const requestMarkChatAsRead = async (channelId) => {
    const response = await api.post(`/api/chat/channels/${channelId}/read`);

    return getResponseData(response);
};

export const requestCreateChatChannel = async (roomId, channelName) => {
    const response = await api.post(`/api/chat/rooms/${roomId}/channels`, {
        channelName,
    });

    return getResponseData(response);
};

export const requestChatPresence = async (channelId) => {
    const response = await api.get(`/api/chat/channels/${channelId}/presence`);

    return getResponseData(response);
};
