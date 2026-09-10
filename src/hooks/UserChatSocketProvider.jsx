import { useEffect, useMemo, useRef, useState } from "react";
import authStore from "../store/authStore";
import { createChatClient, disconnectChatClient } from "../api/chatSocket";
import { isAdminRole } from "../utils/accountRole";
import { UserChatSocketContext } from "./userChatSocketContext";

/**
 * 학생용 전역 STOMP 연결을 딱 하나 만든다.
 * useUnreadChatCount·useFcmNotifications가 useUserChatSocket()으로
 * 이 연결을 받아 각자 필요한 목적지만 구독한다.
 */
const UserChatSocketProvider = ({ children }) => {
    const authStatus = authStore((state) => state.authStatus);
    const user = authStore((state) => state.user);

    const chatClientRef = useRef(null);
    const [socketConnected, setSocketConnected] = useState(false);

    useEffect(() => {
        const shouldConnect =
            authStatus === "authenticated" &&
            Boolean(user) &&
            !isAdminRole(user.accountRole);

        // shouldConnect가 true→false로 바뀌는 경우(로그아웃 등)엔 이전 실행의 cleanup이
        // 이미 socketConnected를 false로 되돌리고 연결을 끊는다.
        if (!shouldConnect) return undefined;

        const client = createChatClient({
            onConnect: () => setSocketConnected(true),
            onError: () => setSocketConnected(false),
        });

        chatClientRef.current = client;
        client.activate();

        return () => {
            setSocketConnected(false);
            chatClientRef.current = null;
            disconnectChatClient(client, []).catch(() => client.deactivate());
        };
    }, [authStatus, user]);

    const value = useMemo(
        () => ({ chatClientRef, socketConnected }),
        [socketConnected]
    );

    return (
        <UserChatSocketContext.Provider value={value}>
            {children}
        </UserChatSocketContext.Provider>
    );
};

export default UserChatSocketProvider;
