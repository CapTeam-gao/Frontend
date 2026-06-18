import { useEffect } from "react";
import { requestMyInfo, requestReissue } from "../api/authApi";
import authStore from "../store/authStore";

// 새로고침해도 토큰이 있으면 로그인 상태를 다시 확인함
const useAuth = () => {
    const accessToken = authStore((state) => state.accessToken);
    const saveLogin = authStore((state) => state.saveLogin);
    const logout = authStore((state) => state.logout);

    useEffect(() => {
        const checkLogin = async () => {
            try {
                if (!accessToken) {
                    const reissueData = await requestReissue();
                    const newAccessToken = reissueData?.accessToken;

                    if (!newAccessToken) {
                        throw new Error("새 accessToken이 없습니다.");
                    }

                    const user = await requestMyInfo(newAccessToken);
                    saveLogin(user, newAccessToken);
                    return;
                }

                const user = await requestMyInfo(accessToken);
                const latestAccessToken =
                    authStore.getState().accessToken ?? accessToken;

                saveLogin(user, latestAccessToken);
            } catch {
                logout();
            }
        };

        checkLogin();
    }, [logout, saveLogin, accessToken]);
};

export default useAuth;
