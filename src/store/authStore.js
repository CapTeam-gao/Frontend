import { create } from "zustand";
import { getStoredAccessToken, isValidAccessToken } from "../utils/authToken";

export const ACCESS_TOKEN_KEY = "accessToken";

const savedToken = getStoredAccessToken();

const authStore = create((set) => ({
    isLogin: savedToken ? null : false,
    user: null,
    accessToken: savedToken,

    setAccessToken: (accessToken) => {
        if (!isValidAccessToken(accessToken)) {
            localStorage.removeItem(ACCESS_TOKEN_KEY);
            set({
                accessToken: null,
                isLogin: false,
            });
            return;
        }

        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken.trim());

        set((state) => ({
            accessToken: accessToken.trim(),
            isLogin: state.user ? true : state.isLogin,
        }));
    },

    saveLogin: (user, accessToken) => {
        if (!isValidAccessToken(accessToken)) {
            localStorage.removeItem(ACCESS_TOKEN_KEY);
            set({
                user: null,
                accessToken: null,
                isLogin: false,
            });
            return;
        }

        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken.trim());

        set({
            user,
            accessToken: accessToken.trim(),
            isLogin: true,
        });
    },

    logout: () => {
        localStorage.removeItem(ACCESS_TOKEN_KEY);

        set({
            user: null,
            accessToken: null,
            isLogin: false,
        });
    },
}));

export default authStore;
