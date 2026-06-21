import { useCallback, useEffect, useState } from "react";
import { requestChatPresence } from "../../../../api/chatApi";
import { subscribeTeamPresence } from "../../../../api/chatSocket";

const useChatPresence = ({ selectedChannel, socketConnected, chatClientRef, setError }) => {
    const [members, setMembers] = useState([]);
    const [presenceTeamId, setPresenceTeamId] = useState(null);
    const [hasPresenceLoaded, setHasPresenceLoaded] = useState(false);

    const refreshPresence = useCallback(async () => {
        if (!selectedChannel?.id) return;

        try {
            setHasPresenceLoaded((prevLoaded) =>
                members.length > 0 ? prevLoaded : false
            );

            const data = await requestChatPresence(selectedChannel.id);

            setPresenceTeamId(data.teamId);
            setMembers(data.members ?? []);
        } catch {
            setError("팀원 접속 상태를 불러오지 못했습니다.");
        } finally {
            setHasPresenceLoaded(true);
        }
    }, [members.length, selectedChannel?.id, setError]);

    useEffect(() => {
        refreshPresence();
    }, [refreshPresence]);

    useEffect(() => {
        if (!selectedChannel?.id || !socketConnected) return undefined;

        refreshPresence();

        const retryTimerId = window.setTimeout(refreshPresence, 500);
        const intervalId = window.setInterval(refreshPresence, 3000);

        return () => {
            window.clearTimeout(retryTimerId);
            window.clearInterval(intervalId);
        };
    }, [refreshPresence, selectedChannel?.id, socketConnected]);

    useEffect(() => {
        if (!presenceTeamId || !socketConnected) return;

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
            }
        );

        return () => {
            presenceSubscription?.unsubscribe();
        };
    }, [presenceTeamId, socketConnected]);

    const onlineMembers = members.filter((member) => member.online);
    const offlineMembers = members.filter((member) => !member.online);

    return {
        members,
        onlineMembers,
        offlineMembers,
        hasPresenceLoaded,
    };
};

export default useChatPresence;
