import { useCallback, useEffect, useState } from "react";
import { requestAdminChatRooms } from "../api/adminChatApi";

const useAdminChatRoom = () => {
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const getRooms = async () => {
            try {
                setIsLoading(true);
                setError("");

                const roomList = await requestAdminChatRooms();
                const normalizedRooms = Array.isArray(roomList) ? roomList : [];

                const firstRoom = normalizedRooms[0] ?? null;
                const firstChannel = firstRoom?.channels?.[0] ?? null;

                setRooms(normalizedRooms);
                setSelectedRoom(firstRoom);
                setSelectedChannel(firstChannel);
            } catch {
                setError("채팅방 목록을 불러오지 못했습니다.");
            } finally {
                setIsLoading(false);
            }
        };

        getRooms();
    }, []);

    const updateSelectedRoom = (room) => {
        const firstChannel = room.channels?.[0] ?? null;

        setSelectedRoom(room);
        setSelectedChannel(firstChannel);
    };

    const updateSelectedChannel = (channel) => {
        setSelectedChannel(channel);
    };
    const handleChannelEvent = useCallback((event) => {
        if (!event?.type) return;

        if (event.type === "CHANNEL_CREATED" && event.channel) {
            setRooms((prevRooms) =>
                prevRooms.map((room) => {
                    if (String(room.id) !== String(event.channel.roomId)) {
                        return room;
                    }

                    const prevChannels = room.channels ?? [];
                    const alreadyExists = prevChannels.some(
                        (channel) =>
                            String(channel.id) === String(event.channel.id)
                    );

                    if (alreadyExists) return room;

                    return {
                        ...room,
                        channels: [...prevChannels, event.channel],
                    };
                })
            );

            setSelectedRoom((prevRoom) => {
                if (
                    !prevRoom ||
                    String(prevRoom.id) !== String(event.channel.roomId)
                ) {
                    return prevRoom;
                }

                const prevChannels = prevRoom.channels ?? [];
                const alreadyExists = prevChannels.some(
                    (channel) => String(channel.id) === String(event.channel.id)
                );

                if (alreadyExists) return prevRoom;

                return {
                    ...prevRoom,
                    channels: [...prevChannels, event.channel],
                };
            });
        }

        if (event.type === "CHANNEL_UPDATED" && event.channel) {
            const updateChannels = (channels = []) =>
                channels.map((channel) =>
                    String(channel.id) === String(event.channel.id)
                        ? {
                              ...channel,
                              ...event.channel,
                          }
                        : channel
                );

            setRooms((prevRooms) =>
                prevRooms.map((room) => ({
                    ...room,
                    channels: updateChannels(room.channels),
                }))
            );

            setSelectedRoom((prevRoom) =>
                prevRoom
                    ? {
                          ...prevRoom,
                          channels: updateChannels(prevRoom.channels),
                      }
                    : prevRoom
            );

            setSelectedChannel((prevChannel) =>
                String(prevChannel?.id) === String(event.channel.id)
                    ? {
                          ...prevChannel,
                          ...event.channel,
                      }
                    : prevChannel
            );
        }

        if (event.type === "CHANNEL_DELETED" && event.channelId) {
            const removeChannel = (channels = []) =>
                channels.filter(
                    (channel) => String(channel.id) !== String(event.channelId)
                );

            setRooms((prevRooms) =>
                prevRooms.map((room) => ({
                    ...room,
                    channels: removeChannel(room.channels),
                }))
            );

            setSelectedRoom((prevRoom) => {
                if (!prevRoom) return prevRoom;

                const nextChannels = removeChannel(prevRoom.channels);

                setSelectedChannel((prevChannel) => {
                    if (String(prevChannel?.id) !== String(event.channelId)) {
                        return prevChannel;
                    }

                    return nextChannels[0] ?? null;
                });

                return {
                    ...prevRoom,
                    channels: nextChannels,
                };
            });
        }
    }, []);

    return {
        rooms,
        selectedRoom,
        selectedChannel,
        isLoading,
        error,
        updateSelectedRoom,
        updateSelectedChannel,
        handleChannelEvent,
    };
};

export default useAdminChatRoom;
