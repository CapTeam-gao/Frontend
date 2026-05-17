import { useEffect } from "react";
import { getMe } from "../api/authApi";
import authStore from "../store/authStore";

// 새로고침하면 로그인 상태 날아가기에 서버에 확인 받는 코드
const useAuth = () => {
    const { setUser, clearUser, isLogin } = authStore();

    useEffect(() => {
        const checkLogin = async () => {
            try {
                const res = await getMe();
                setUser(res.data);
            } catch (e) {
                clearUser();
            }
        };
        checkLogin();
    }, []);

    return { isLogin };
};

export default useAuth;
