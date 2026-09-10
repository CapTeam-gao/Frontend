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

    // 채널이 정해지면 먼저 한 번 불러온다(소켓 연결 전에도 접속 상태를 빠르게 보여주기 위함).
    useEffect(() => {
        refreshPresence();
    }, [refreshPresence]);

    // 소켓이 붙으면, 구독(effect below)이 이후 변화를 받기 직전의 현재 상태로 한 번 더 맞춘다.
    // 이전엔 여기에 700ms 뒤 재조회가 하나 더 있었는데, 구독이 곧바로 활성화되고
    // 그 사이 변화는 다음 presence 이벤트가 정정하므로 중복이라 제거했다.
    useEffect(() => {
        if (!selectedChannelId || !socketConnected) return undefined;

        refreshPresence();
        return undefined;
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
