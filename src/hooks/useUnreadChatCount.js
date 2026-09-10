import { useCallback, useEffect, useRef, useState } from "react";
import { requestMyChannelSummaries } from "../api/chatApi";
import { requestAdminChatUnreadSummary } from "../api/adminChatApi";
import authStore from "../store/authStore";
import { CHAT_UNREAD_CHANGE_EVENT } from "../utils/chat";
import { subscribeUserChatUnreadEvents } from "../api/chatSocket";
import { useUserChatSocket } from "./userChatSocketContext";
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
    const { chatClientRef, socketConnected } = useUserChatSocket();
    const [unreadChatCount, setUnreadChatCount] = useState(0);
    const [lastUnreadEvent, setLastUnreadEvent] = useState(null);
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
            // ponytail: 배지 조회 실패 시 0으로 덮어쓰지 않음 — 마지막 확인된 값 유지
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

        // 채팅방 진입 한 번에 clearChannelUnreadCount·markAsRead 등으로
        // 이 이벤트가 연달아 여러 번 터진다. 같은 조회를 그때마다 하지 않도록 묶는다.
        let changeDebounceId = null;
        const refreshUnreadChatCountOnChange = () => {
            window.clearTimeout(changeDebounceId);
            changeDebounceId = window.setTimeout(
                () => refreshUnreadChatCount({ force: true }),
                400
            );
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
            window.clearTimeout(changeDebounceId);
            window.removeEventListener(
                CHAT_UNREAD_CHANGE_EVENT,
                refreshUnreadChatCountOnChange
            );
            window.removeEventListener("focus", refreshUnreadChatCountOnFocus);
        };
    }, [refreshUnreadChatCount, shouldFetchUnreadCount]);

    useEffect(() => {
        const client = chatClientRef.current;

        if (
            !shouldFetchUnreadCount ||
            isAdminRole(user?.accountRole) ||
            !client ||
            !socketConnected
        ) {
            return undefined;
        }

        let unreadSubscription = null;

        try {
            unreadSubscription = subscribeUserChatUnreadEvents(
                client,
                (event) => {
                    setUnreadChatCount(Number(event?.totalUnreadCount ?? 0));
                    setLastUnreadEvent({ ...event, receivedAt: Date.now() });
                }
            );
        } catch {
            unreadSubscription = null;
        }

        return () => {
            unreadSubscription?.unsubscribe?.();
        };
    }, [
        shouldFetchUnreadCount,
        user?.accountRole,
        chatClientRef,
        socketConnected,
    ]);

    return {
        unreadChatCount,
        hasUnreadChat: unreadChatCount > 0,
        lastUnreadEvent,
    };
};

export default useUnreadChatCount;
