import Router from "./router/index";
import "./styles/global.css";
import useAuth from "./hooks/useAuth";
import authStore from "./store/authStore";

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

    return <Router />;
}

export default App;
