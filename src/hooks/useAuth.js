import { useEffect } from "react";
import { getMe } from "../api/authApi";
import authStore from "../store/authStore";

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
