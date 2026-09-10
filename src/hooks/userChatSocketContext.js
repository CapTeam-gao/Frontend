import { createContext, useContext } from "react";

/**
 * 로그인한 학생용 STOMP 연결을 앱 전체에서 하나만 쓰기 위한 컨텍스트.
 * 안 읽은 채팅 수(/user/queue/chat/unread)와 새 메시지 토스트
 * (/user/queue/chat/notifications)가 각각 연결을 열면 사용자마다
 * WebSocket이 두 개씩 붙는다. 여기서 만든 client 하나에 둘 다 구독한다.
 */
export const UserChatSocketContext = createContext({
    chatClientRef: { current: null },
    socketConnected: false,
});

export const useUserChatSocket = () => useContext(UserChatSocketContext);
