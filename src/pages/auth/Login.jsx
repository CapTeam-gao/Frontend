import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import Button from "../../components/common/button/Button";
import { requestLogin, requestMyInfo } from "../../api/authApi";
import authStore from "../../store/authStore";

const PASSWORD_CHANGE_NOTICE_KEY = "capteam-show-password-change-notice";
const PASSWORD_CHANGE_NOTICE_SEEN_KEY = "capteam-show-password-change-notice-seen";

const Login = () => {
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const isDisabled = !userId.trim() || !password || isLoading;
    const navigate = useNavigate();
    const saveLogin = authStore((state) => state.saveLogin);
    const user = authStore((state) => state.user);

    useEffect(() => {
        if (!user?.accountRole) return;

        if (user.accountRole === "ADMIN") {
            navigate("/admin/dashboard", { replace: true });
            return;
        }

        navigate(
            user.surveyCompleted ? "/user/dashboard" : "/user/survey/intro",
            { replace: true }
        );
    }, [navigate, user]);
    const handleLogin = async (e) => {
        e.preventDefault();

        if (isDisabled) return;

        try {
            setError("");
            setIsLoading(true);

            const trimmedUserId = userId.trim();
            const loginData = await requestLogin(trimmedUserId, password);
            const token = loginData.accessToken;

            if (!token) {
                setError("로그인 토큰을 받지 못했습니다.");
                return;
            }

            const user = await requestMyInfo(token);

            if (!user || !user.accountRole) {
                setError("사용자 권한 정보를 받지 못했습니다.");
                return;
            }

            saveLogin(user, token);
            const noticeSessionId = `${trimmedUserId}-${Date.now()}`;
            sessionStorage.setItem(
                PASSWORD_CHANGE_NOTICE_KEY,
                noticeSessionId
            );
            sessionStorage.removeItem(PASSWORD_CHANGE_NOTICE_SEEN_KEY);

            if (user.accountRole === "ADMIN") {
                navigate("/admin/dashboard", { replace: true });
                return;
            }

            navigate(
                user.surveyCompleted ? "/user/dashboard" : "/user/survey/intro",
                { replace: true }
            );
        } catch (e) {
            if (e.response) {
                setError("아이디 또는 비밀번호가 일치하지 않습니다.");
            } else {
                setError("서버 오류입니다.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className={styles.container}>
            <div className={styles.header}>
                <img
                    className={styles.logo}
                    src="/logo-login.webp"
                    alt="CapTeam 로고"
                    width="150"
                    height="150"
                    fetchPriority="high"
                />{" "}
                <p className={styles.title}>로그인</p>
                <p className={styles.subtitle}>
                    서비스를 이용하려면 로그인하세요
                </p>
            </div>
            <form className={styles.form} onSubmit={handleLogin}>
                <div className={styles.field}>
                    <label htmlFor="userId">아이디</label>
                    <input
                        type="text"
                        placeholder="아이디를 입력해주세요"
                        id="userId"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                    />
                </div>
                <div className={styles.field}>
                    <label htmlFor="password">비밀번호</label>
                    <input
                        type="password"
                        placeholder="비밀번호를 입력해주세요"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                {error && <p className={styles.error}>{error}</p>}
                <Button
                    type="submit"
                    buttonSize="large"
                    buttonColor="primary"
                    disabled={isDisabled}
                >
                    {isLoading ? "로그인 중..." : "로그인"}
                </Button>
            </form>
        </main>
    );
};

export default Login;
