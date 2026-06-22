import api from "./api";

const getResponseData = (response) => response.data?.data ?? response.data;

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
