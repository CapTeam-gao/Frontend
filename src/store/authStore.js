import { create } from "zustand";

export const ACCESS_TOKEN_KEY = "accessToken";

const savedToken = localStorage.getItem(ACCESS_TOKEN_KEY);

const authStore = create((set) => ({
    isLogin: savedToken ? null : false,
    user: null,
    accessToken: savedToken,

    saveLogin: (user, accessToken) => {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

        set({
            user,
            accessToken,
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
