import { create } from "zustand";
import { getStoredAccessToken, isValidAccessToken } from "../utils/authToken";

export const ACCESS_TOKEN_KEY = "accessToken";
const USER_STORAGE_KEY = "capteam-user";

const savedToken = getStoredAccessToken();
const getStoredUser = () => {
    if (!savedToken) return null;

    try {
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);

        return storedUser ? JSON.parse(storedUser) : null;
    } catch {
        localStorage.removeItem(USER_STORAGE_KEY);
        return null;
    }
};

const savedUser = getStoredUser();

const authStore = create((set) => ({
    isLogin: savedToken ? (savedUser ? true : null) : false,
    user: savedUser,
    accessToken: savedToken,

    setAccessToken: (accessToken) => {
        if (!isValidAccessToken(accessToken)) {
            localStorage.removeItem(ACCESS_TOKEN_KEY);
            localStorage.removeItem(USER_STORAGE_KEY);
            set({
                user: null,
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
            localStorage.removeItem(USER_STORAGE_KEY);
            set({
                user: null,
                accessToken: null,
                isLogin: false,
            });
            return;
        }

        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken.trim());
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

        set({
            user,
            accessToken: accessToken.trim(),
            isLogin: true,
        });
    },

    logout: () => {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);

        set({
            user: null,
            accessToken: null,
            isLogin: false,
        });
    },
}));

export default authStore;
