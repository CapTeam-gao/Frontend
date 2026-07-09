import { useCallback, useEffect, useRef, useState } from "react";
import { requestMyChannelSummaries } from "../api/chatApi";
import { requestAdminChatUnreadSummary } from "../api/adminChatApi";
import authStore from "../store/authStore";
import { CHAT_UNREAD_CHANGE_EVENT } from "../utils/chat";
import {
    createChatClient,
    disconnectChatClient,
    subscribeUserChatUnreadEvents,
} from "../api/chatSocket";
import { isAdminRole } from "../utils/accountRole";

const CHAT_UNREAD_REFRESH_INTERVAL = 1000 * 60 * 2;
const CHAT_UNREAD_FOCUS_REFRESH_INTERVAL = 1000 * 30;

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
    const isRefreshingRef = useRef(false);
    const lastRefreshTimeRef = useRef(0);

    const shouldFetchUnreadCount =
        enabled && Boolean(accessToken) && Boolean(user);

    const refreshUnreadChatCount = useCallback(async ({ force = false } = {}) => {
        if (!shouldFetchUnreadCount) {
            setUnreadChatCount(0);
            return;
        }

        if (!force && document.visibilityState === "hidden") return;
        if (isRefreshingRef.current) return;

        try {
            isRefreshingRef.current = true;

            if (isAdminRole(user.accountRole)) {
                const summary = await requestAdminChatUnreadSummary();
                setUnreadChatCount(Number(summary?.totalUnreadCount ?? 0));
                lastRefreshTimeRef.current = Date.now();
                return;
            }

            const channelSummaries = await requestMyChannelSummaries();
            setUnreadChatCount(getTotalUnreadCount(channelSummaries));
            lastRefreshTimeRef.current = Date.now();
        } catch {
            setUnreadChatCount(0);
        } finally {
            isRefreshingRef.current = false;
        }
    }, [shouldFetchUnreadCount, user?.accountRole]);

    useEffect(() => {
        const timeoutId = window.setTimeout(
            () => refreshUnreadChatCount({ force: true }),
            0
        );

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [refreshUnreadChatCount]);

    useEffect(() => {
        if (!shouldFetchUnreadCount) return undefined;

        const intervalId = window.setInterval(() => {
            refreshUnreadChatCount();
        }, CHAT_UNREAD_REFRESH_INTERVAL);

        const refreshUnreadChatCountOnChange = () => {
            refreshUnreadChatCount({ force: true });
        };

        const refreshUnreadChatCountOnFocus = () => {
            const elapsedTime = Date.now() - lastRefreshTimeRef.current;

            if (elapsedTime < CHAT_UNREAD_FOCUS_REFRESH_INTERVAL) return;

            refreshUnreadChatCount({ force: true });
        };

        window.addEventListener(
            CHAT_UNREAD_CHANGE_EVENT,
            refreshUnreadChatCountOnChange
        );
        window.addEventListener("focus", refreshUnreadChatCountOnFocus);

        return () => {
            window.clearInterval(intervalId);
            window.removeEventListener(
                CHAT_UNREAD_CHANGE_EVENT,
                refreshUnreadChatCountOnChange
            );
            window.removeEventListener("focus", refreshUnreadChatCountOnFocus);
        };
    }, [refreshUnreadChatCount, shouldFetchUnreadCount]);

    useEffect(() => {
        if (!shouldFetchUnreadCount || isAdminRole(user?.accountRole)) {
            return undefined;
        }

        let unreadSubscription = null;

        const client = createChatClient({
            onConnect: (connectedClient) => {
                try {
                    unreadSubscription = subscribeUserChatUnreadEvents(
                        connectedClient,
                        (event) => {
                            setUnreadChatCount(
                                Number(event?.totalUnreadCount ?? 0)
                            );
                        }
                    );
                } catch {
                    unreadSubscription = null;
                }
            },
        });

        client.activate();

        return () => {
            disconnectChatClient(client, [unreadSubscription]).catch(() => {
                client.deactivate();
            });
        };
    }, [shouldFetchUnreadCount, user?.accountRole]);

    return {
        unreadChatCount,
        hasUnreadChat: unreadChatCount > 0,
    };
};

export default useUnreadChatCount;
