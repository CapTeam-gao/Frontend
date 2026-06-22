import { useCallback, useEffect, useState } from "react";
import {
    requestCreateChatChannel,
    requestDeleteChatChannel,
    requestMyChannelSummaries,
    requestMyChatRoom,
    requestUpdateChatChannel,
} from "../api/chatApi";
import { CHAT_UNREAD_CHANGE_EVENT } from "../utils/chat";

const SELECTED_CHAT_CHANNEL_STORAGE_KEY = "capteam-selected-chat-channel-id";
const CHAT_TEAM_NAME_STORAGE_KEY = "capteam-chat-team-name";

const dispatchChatUnreadChange = () => {
    window.dispatchEvent(new Event(CHAT_UNREAD_CHANGE_EVENT));
};

const getInitialRoom = () => {
    const cachedTeamName = localStorage.getItem(CHAT_TEAM_NAME_STORAGE_KEY);

    if (!cachedTeamName) return null;

    return {
        teamName: cachedTeamName,
        channels: [],
    };
};

const useChatRoom = ({ setError }) => {
    const [room, setRoom] = useState(getInitialRoom);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [channelSummaries, setChannelSummaries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
    const [channelModalMode, setChannelModalMode] = useState("create");
    const [targetChannel, setTargetChannel] = useState(null);
    const [newChannelName, setNewChannelName] = useState("");
    const [channelCreateError, setChannelCreateError] = useState("");
    const [isCreatingChannel, setIsCreatingChannel] = useState(false);

    const updateSelectedChannel = useCallback((channel) => {
        setSelectedChannel(channel);

        if (channel?.id) {
            localStorage.setItem(
                SELECTED_CHAT_CHANNEL_STORAGE_KEY,
                String(channel.id)
            );
        }
    }, []);

    const getChannelUnreadCount = useCallback(
        (channelId) => {
            const channelSummary = channelSummaries.find(
                (summary) => String(summary.channel?.id) === String(channelId)
            );

            return channelSummary?.unreadCount ?? 0;
        },
        [channelSummaries]
    );

    const clearChannelUnreadCount = useCallback((channelId) => {
        setChannelSummaries((prevSummaries) =>
            prevSummaries.map((summary) =>
                String(summary.channel?.id) === String(channelId)
                    ? {
                          ...summary,
                          unreadCount: 0,
                      }
                    : summary
            )
        );
        dispatchChatUnreadChange();
    }, []);

    const increaseChannelUnreadCount = useCallback(
        (channelId, receivedMessage) => {
            setChannelSummaries((prevSummaries) =>
                prevSummaries.map((summary) =>
                    String(summary.channel?.id) === String(channelId)
                        ? {
                              ...summary,
                              lastMessage: receivedMessage,
                              unreadCount: (summary.unreadCount ?? 0) + 1,
                          }
                        : summary
                )
            );
            dispatchChatUnreadChange();
        },
        []
    );

    const refreshChannelSummaries = useCallback(async () => {
        const summaries = await requestMyChannelSummaries();
        setChannelSummaries(summaries ?? []);
    }, []);

    const refreshChatRoom = useCallback(async () => {
        const roomData = await requestMyChatRoom();
        const channels = roomData.channels ?? [];
        const storedChannelId = localStorage.getItem(
            SELECTED_CHAT_CHANNEL_STORAGE_KEY
        );

        if (roomData.teamName) {
            localStorage.setItem(CHAT_TEAM_NAME_STORAGE_KEY, roomData.teamName);
        }

        setRoom(roomData);
        setSelectedChannel((prevSelectedChannel) => {
            const selectedChannelId =
                prevSelectedChannel?.id ?? storedChannelId;
            const nextSelectedChannel = channels.find(
                (channel) => String(channel.id) === String(selectedChannelId)
            );
            const fallbackChannel = channels[0] ?? null;
            const nextChannel = nextSelectedChannel ?? fallbackChannel;

            if (nextChannel?.id) {
                localStorage.setItem(
                    SELECTED_CHAT_CHANNEL_STORAGE_KEY,
                    String(nextChannel.id)
                );
            } else {
                localStorage.removeItem(SELECTED_CHAT_CHANNEL_STORAGE_KEY);
            }

            return nextChannel;
        });

        await refreshChannelSummaries();
    }, [refreshChannelSummaries]);

    useEffect(() => {
        const getChatRoom = async () => {
            try {
                await refreshChatRoom();
            } catch {
                setError("채팅방 정보를 불러오지 못했습니다.");
            } finally {
                setIsLoading(false);
            }
        };

        getChatRoom();
    }, [refreshChatRoom, setError]);

    const handleSubmitChannelModal = async () => {
        if (isCreatingChannel) return;

        const trimmedChannelName = newChannelName.trim();

        if (channelModalMode !== "delete" && !trimmedChannelName) {
            setChannelCreateError("채널 이름을 입력해주세요.");
            return;
        }

        if (channelModalMode === "create" && !room?.id) {
            setChannelCreateError("채팅방 정보를 찾을 수 없습니다.");
            return;
        }

        if (channelModalMode !== "delete") {
            const isDuplicatedChannel = room?.channels?.some(
                (channel) =>
                    String(channel.id) !== String(targetChannel?.id) &&
                    channel.channelName.trim().toLowerCase() ===
                        trimmedChannelName.toLowerCase()
            );

            if (isDuplicatedChannel) {
                setChannelCreateError("이미 같은 이름의 채널이 있습니다.");
                return;
            }
        }

        try {
            setIsCreatingChannel(true);
            setChannelCreateError("");

            if (channelModalMode === "create") {
                await requestCreateChatChannel(room.id, trimmedChannelName);
            }

            if (channelModalMode === "edit") {
                await requestUpdateChatChannel(
                    targetChannel.id,
                    trimmedChannelName
                );
            }

            if (channelModalMode === "delete") {
                await requestDeleteChatChannel(targetChannel.id);
            }

            await refreshChannelSummaries();
            dispatchChatUnreadChange();
            setNewChannelName("");
            setTargetChannel(null);
            setIsChannelModalOpen(false);
        } catch {
            setChannelCreateError("채널 작업에 실패했습니다.");
        } finally {
            setIsCreatingChannel(false);
        }
    };

    const changeNewChannelName = (channelName) => {
        setNewChannelName(channelName);
        setChannelCreateError("");
    };

    const closeChannelModal = () => {
        setIsChannelModalOpen(false);
        setChannelCreateError("");
        setNewChannelName("");
        setTargetChannel(null);
        setChannelModalMode("create");
    };

    const openCreateChannelModal = () => {
        setChannelModalMode("create");
        setTargetChannel(null);
        setNewChannelName("");
        setChannelCreateError("");
        setIsChannelModalOpen(true);
    };

    const openEditChannelModal = (channel) => {
        setChannelModalMode("edit");
        setTargetChannel(channel);
        setNewChannelName(channel.channelName ?? "");
        setChannelCreateError("");
        setIsChannelModalOpen(true);
    };

    const openDeleteChannelModal = (channel) => {
        setChannelModalMode("delete");
        setTargetChannel(channel);
        setNewChannelName(channel.channelName ?? "");
        setChannelCreateError("");
        setIsChannelModalOpen(true);
    };

    const handleChannelEvent = useCallback((event) => {
        if (!event?.type) return;

        if (event.type === "CHANNEL_CREATED" && event.channel) {
            setRoom((prevRoom) => {
                if (!prevRoom) return prevRoom;

                const prevChannels = prevRoom?.channels ?? [];
                const alreadyExists = prevChannels.some(
                    (channel) => String(channel.id) === String(event.channel.id)
                );

                if (alreadyExists) return prevRoom;

                return {
                    ...prevRoom,
                    channels: [...prevChannels, event.channel],
                };
            });
            setChannelSummaries((prevSummaries) => {
                const alreadyExists = prevSummaries.some(
                    (summary) =>
                        String(summary.channel?.id) === String(event.channel.id)
                );

                if (alreadyExists) return prevSummaries;

                return [
                    ...prevSummaries,
                    {
                        channel: event.channel,
                        unreadCount: 0,
                        lastMessage: null,
                    },
                ];
            });
        }

        if (event.type === "CHANNEL_UPDATED" && event.channel) {
            setRoom((prevRoom) => {
                if (!prevRoom) return prevRoom;

                return {
                    ...prevRoom,
                    channels: (prevRoom.channels ?? []).map((channel) =>
                        String(channel.id) === String(event.channel.id)
                            ? {
                                  ...channel,
                                  ...event.channel,
                              }
                            : channel
                    ),
                };
            });
            setSelectedChannel((prevSelectedChannel) =>
                String(prevSelectedChannel?.id) === String(event.channel.id)
                    ? {
                          ...prevSelectedChannel,
                          ...event.channel,
                      }
                    : prevSelectedChannel
            );
            setChannelSummaries((prevSummaries) =>
                prevSummaries.map((summary) =>
                    String(summary.channel?.id) === String(event.channel.id)
                        ? {
                              ...summary,
                              channel: {
                                  ...summary.channel,
                                  ...event.channel,
                              },
                          }
                        : summary
                )
            );
        }

        if (event.type === "CHANNEL_DELETED" && event.channelId) {
            setRoom((prevRoom) => {
                if (!prevRoom) return prevRoom;

                const nextChannels = (prevRoom?.channels ?? []).filter(
                    (channel) => String(channel.id) !== String(event.channelId)
                );

                setSelectedChannel((prevSelectedChannel) => {
                    if (
                        String(prevSelectedChannel?.id) !==
                        String(event.channelId)
                    ) {
                        return prevSelectedChannel;
                    }

                    const fallbackChannel = nextChannels[0] ?? null;

                    if (fallbackChannel?.id) {
                        localStorage.setItem(
                            SELECTED_CHAT_CHANNEL_STORAGE_KEY,
                            String(fallbackChannel.id)
                        );
                    } else {
                        localStorage.removeItem(
                            SELECTED_CHAT_CHANNEL_STORAGE_KEY
                        );
                    }

                    return fallbackChannel;
                });

                return {
                    ...prevRoom,
                    channels: nextChannels,
                };
            });
            setChannelSummaries((prevSummaries) =>
                prevSummaries.filter(
                    (summary) =>
                        String(summary.channel?.id) !== String(event.channelId)
                )
            );
        }

        dispatchChatUnreadChange();
    }, []);

    return {
        room,
        selectedChannel,
        isLoading,
        isChannelModalOpen,
        channelModalMode,
        targetChannel,
        newChannelName,
        channelCreateError,
        isCreatingChannel,
        updateSelectedChannel,
        getChannelUnreadCount,
        clearChannelUnreadCount,
        increaseChannelUnreadCount,
        handleSubmitChannelModal,
        changeNewChannelName,
        openCreateChannelModal,
        openEditChannelModal,
        openDeleteChannelModal,
        handleChannelEvent,
        closeChannelModal,
    };
};

export default useChatRoom;
