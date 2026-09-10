import Router from "./router/index";
import "./styles/global.css";
import useAuth from "./hooks/useAuth";
import useFcmNotifications from "./hooks/useFcmNotifications";
import UserChatSocketProvider from "./hooks/UserChatSocketProvider";
import UnreadChatCountProvider from "./hooks/UnreadChatCountProvider";
import authStore from "./store/authStore";
import NotificationToast from "./components/common/notification/NotificationToast";

// 전역 STOMP 연결(UserChatSocketProvider) 안에서 실행돼야 하는 부분.
// useFcmNotifications가 그 연결을 받아 새 메시지 토스트를 구독한다.
function AppShell() {
    const { toasts, dismissToast, selectToast } = useFcmNotifications();

    return (
        <>
            <Router />
            <NotificationToast
                toasts={toasts}
                onDismiss={dismissToast}
                onSelect={selectToast}
            />
        </>
    );
}

function App() {
    const authStatus = authStore((state) => state.authStatus);

    useAuth();

    if (authStatus === "checking") {
        return (
            <main
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "100vh",
                    color: "var(--color-text-secondary)",
                    fontSize: "var(--font-size-md)",
                    fontWeight: "var(--font-weight-bold)",
                }}
            >
                로그인 상태를 확인하는 중입니다.
            </main>
        );
    }

    return (
        <UserChatSocketProvider>
            <UnreadChatCountProvider>
                <AppShell />
            </UnreadChatCountProvider>
        </UserChatSocketProvider>
    );
}

export default App;
