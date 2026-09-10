import { createContext, useContext } from "react";

/**
 * 안 읽은 채팅 수를 앱 전체에서 하나의 소스로 공유하기 위한 컨텍스트.
 * 헤더 배지와 대시보드 숫자가 각각 useUnreadChatCount를 부르면
 * channel-summaries 조회 · 2분 폴러 · 웹소켓 연결이 화면마다 중복된다.
 */
export const UnreadChatCountContext = createContext({
    unreadChatCount: 0,
    hasUnreadChat: false,
    lastUnreadEvent: null,
});

export const useUnreadChatCountContext = () =>
    useContext(UnreadChatCountContext);
