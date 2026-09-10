import useUnreadChatCount from "./useUnreadChatCount";
import { UnreadChatCountContext } from "./unreadChatCountContext";

/**
 * useUnreadChatCount를 앱에서 딱 한 번만 실행한다.
 * 헤더·대시보드는 useUnreadChatCountContext로 이 값을 읽기만 한다.
 */
const UnreadChatCountProvider = ({ children }) => {
    const value = useUnreadChatCount();

    return (
        <UnreadChatCountContext.Provider value={value}>
            {children}
        </UnreadChatCountContext.Provider>
    );
};

export default UnreadChatCountProvider;
