import { useEffect, useState } from "react";
import { getMe } from "../api/authApi";

const useAuth = () => {
    const [isLogin, setIsLogin] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const checkLogin = async () => {
            try {
                const res = await getMe();
                setIsLogin(true);
                setUser(res.data);
            } catch (e) {
                setIsLogin(false);
                setUser(null);
            }
        };
        checkLogin();
    }, []);

    return { isLogin, user };
};

export default useAuth;
