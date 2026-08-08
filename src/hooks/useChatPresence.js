import { useCallback, useEffect, useMemo, useState } from "react";
import { requestChatPresence } from "../api/chatApi";
import { subscribeTeamPresence } from "../api/chatSocket";

const useChatPresence = ({
    selectedChannel,
    socketConnected,
    chatClientRef,
    onError,
    teamIdFallback,
    gateBySelectedChannel = false,
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

            const data = await requestChatPresence(selectedChannelId);

            setPresenceTeamId(data?.teamId ?? teamIdFallback ?? null);
            setMembers(Array.isArray(data?.members) ? data.members : []);
        } catch {
            setMembers([]);
            setPresenceTeamId(null);
            onError?.("팀원 접속 상태를 불러오지 못했습니다.");
        } finally {
            setHasPresenceLoaded(true);
        }
    }, [selectedChannelId, teamIdFallback, onError]);

    useEffect(() => {
        refreshPresence();
    }, [refreshPresence]);

    useEffect(() => {
        if (!selectedChannelId || !socketConnected) return undefined;

        refreshPresence();

        const retryTimerId = window.setTimeout(refreshPresence, 700);

        return () => {
            window.clearTimeout(retryTimerId);
        };
    }, [refreshPresence, selectedChannelId, socketConnected]);

    useEffect(() => {
        if (!chatClientRef?.current || !socketConnected || !presenceTeamId) {
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
    }, [presenceTeamId, socketConnected, chatClientRef]);

    const onlineMembers = useMemo(
        () => members.filter((member) => member.online),
        [members]
    );

    const offlineMembers = useMemo(
        () => members.filter((member) => !member.online),
        [members]
    );

    const shouldGate = gateBySelectedChannel && !selectedChannel;

    return {
        members: shouldGate ? [] : members,
        onlineMembers: shouldGate ? [] : onlineMembers,
        offlineMembers: shouldGate ? [] : offlineMembers,
        hasPresenceLoaded: shouldGate ? false : hasPresenceLoaded,
    };
};

export default useChatPresence;
