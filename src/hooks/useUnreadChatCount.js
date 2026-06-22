import { useCallback, useEffect, useState } from "react";
import { requestMyChannelSummaries } from "../api/chatApi";
import authStore from "../store/authStore";
import { CHAT_UNREAD_CHANGE_EVENT } from "../utils/chat";

const CHAT_UNREAD_REFRESH_INTERVAL = 1000 * 10;

const getTotalUnreadCount = (channelSummaries) => {
    return (channelSummaries ?? []).reduce(
        (totalCount, channelSummary) =>
            totalCount + Number(channelSummary.unreadCount ?? 0),
        0
    );
};

const useUnreadChatCount = ({ enabled = true } = {}) => {
    const accessToken = authStore((state) => state.accessToken);
    const user = authStore((state) => state.user);
    const [unreadChatCount, setUnreadChatCount] = useState(0);

    const shouldFetchUnreadCount =
        enabled && Boolean(accessToken) && user?.accountRole === "STUDENT";

    const refreshUnreadChatCount = useCallback(async () => {
        if (!shouldFetchUnreadCount) {
            setUnreadChatCount(0);
            return;
        }

        try {
            const channelSummaries = await requestMyChannelSummaries();

            setUnreadChatCount(getTotalUnreadCount(channelSummaries));
        } catch {
            setUnreadChatCount(0);
        }
    }, [shouldFetchUnreadCount]);

    useEffect(() => {
        const timeoutId = window.setTimeout(refreshUnreadChatCount, 0);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [refreshUnreadChatCount]);

    useEffect(() => {
        if (!shouldFetchUnreadCount) return undefined;

        const intervalId = window.setInterval(
            refreshUnreadChatCount,
            CHAT_UNREAD_REFRESH_INTERVAL
        );

        window.addEventListener(
            CHAT_UNREAD_CHANGE_EVENT,
            refreshUnreadChatCount
        );
        window.addEventListener("focus", refreshUnreadChatCount);

        return () => {
            window.clearInterval(intervalId);
            window.removeEventListener(
                CHAT_UNREAD_CHANGE_EVENT,
                refreshUnreadChatCount
            );
            window.removeEventListener("focus", refreshUnreadChatCount);
        };
    }, [refreshUnreadChatCount, shouldFetchUnreadCount]);

    return {
        unreadChatCount,
        hasUnreadChat: unreadChatCount > 0,
    };
};

export default useUnreadChatCount;
