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

export const requestMyChannelSummaries = async () => {
    const response = await api.get("/api/chat/rooms/my/channel-summaries");

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

export const requestUpdateChatChannel = async (channelId, channelName) => {
    const response = await api.patch(`/api/chat/channels/${channelId}`, {
        channelName,
    });

    return getResponseData(response);
};

export const requestDeleteChatChannel = async (channelId) => {
    const response = await api.delete(`/api/chat/channels/${channelId}`);

    return getResponseData(response);
};

export const requestUploadChatFile = async (channelId, file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(
        `/api/chat/channels/${channelId}/files`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return getResponseData(response);
};

export const requestChatPresence = async (channelId) => {
    const response = await api.get(`/api/chat/channels/${channelId}/presence`);

    return getResponseData(response);
};

export const requestUpdateChatMessage = async (messageId, message) => {
    const response = await api.patch(`/api/chat/messages/${messageId}`, {
        message,
    });

    return getResponseData(response);
};

export const requestDeleteChatMessage = async (messageId) => {
    const response = await api.delete(`/api/chat/messages/${messageId}`);

    return getResponseData(response);
};
