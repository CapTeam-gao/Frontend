import { useEffect } from "react";
import { requestMyInfo } from "../api/authApi";
import authStore from "../store/authStore";

// 새로고침해도 토큰이 있으면 로그인 상태를 다시 확인함
const useAuth = () => {
    const accessToken = authStore((state) => state.accessToken);
    const saveLogin = authStore((state) => state.saveLogin);
    const logout = authStore((state) => state.logout);

    useEffect(() => {
        const checkLogin = async () => {
            if (!accessToken) {
                logout();
                return;
            }

            try {
                const user = await requestMyInfo(accessToken);
                saveLogin(user, accessToken);
            } catch {
                logout();
            }
        };

        checkLogin();
    }, [logout, saveLogin, accessToken]);
};

export default useAuth;
