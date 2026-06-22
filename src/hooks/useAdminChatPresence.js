import { useCallback, useEffect, useMemo, useState } from "react";
import { requestChatPresence } from "../api/chatApi";
import { subscribeTeamPresence } from "../api/chatSocket";

const useAdminChatPresence = ({
    chatClientRef,
    isSocketConnected,
    selectedRoom,
    selectedChannel,
}) => {
    const [members, setMembers] = useState([]);
    const [presenceTeamId, setPresenceTeamId] = useState(null);
    const [hasPresenceLoaded, setHasPresenceLoaded] = useState(false);

    const selectedChannelId = selectedChannel?.id;

    const refreshPresence = useCallback(async () => {
        if (!selectedChannelId) {
            setMembers([]);
            setPresenceTeamId(null);
            setHasPresenceLoaded(false);
            return;
        }

        try {
            setHasPresenceLoaded(false);

            const presence = await requestChatPresence(selectedChannelId);
            const nextMembers = Array.isArray(presence?.members)
                ? presence.members
                : [];

            setPresenceTeamId(presence?.teamId ?? selectedRoom?.teamId ?? null);
            setMembers(nextMembers);
        } catch {
            setMembers([]);
            setPresenceTeamId(null);
        } finally {
            setHasPresenceLoaded(true);
        }
    }, [selectedChannelId, selectedRoom?.teamId]);

    useEffect(() => {
        refreshPresence();

        return undefined;
    }, [refreshPresence]);

    useEffect(() => {
        if (
            !chatClientRef?.current ||
            !isSocketConnected ||
            !presenceTeamId
        ) {
            return undefined;
        }

        const presenceSubscription = subscribeTeamPresence(
            chatClientRef.current,
            presenceTeamId,
            (presenceEvent) => {
                setMembers((prevMembers) => {
                    const alreadyExists = prevMembers.some(
                        (member) => member.userId === presenceEvent.userId
                    );

                    if (!alreadyExists) {
                        return [...prevMembers, presenceEvent];
                    }

                    return prevMembers.map((member) =>
                        member.userId === presenceEvent.userId
                            ? {
                                  ...member,
                                  ...presenceEvent,
                              }
                            : member
                    );
                });

                setHasPresenceLoaded(true);
            }
        );

        return () => {
            presenceSubscription?.unsubscribe?.();
        };
    }, [chatClientRef, isSocketConnected, presenceTeamId]);

    const onlineMembers = useMemo(
        () => members.filter((member) => member.online),
        [members]
    );

    const offlineMembers = useMemo(
        () => members.filter((member) => !member.online),
        [members]
    );

    return {
        members: selectedChannel ? members : [],
        onlineMembers: selectedChannel ? onlineMembers : [],
        offlineMembers: selectedChannel ? offlineMembers : [],
        hasPresenceLoaded: selectedChannel ? hasPresenceLoaded : false,
    };
};

export default useAdminChatPresence;
