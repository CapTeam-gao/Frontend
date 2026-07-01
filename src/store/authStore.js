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
    authStatus: "checking",
    isLogin: savedToken ? (savedUser ? true : null) : false,
    user: savedUser,
    accessToken: savedToken,
    isLoggingOut: false,

    startLogout: () => {
        set({
            isLoggingOut: true,
        });
    },

    setUnauthenticated: () => {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);

        set({
            authStatus: "unauthenticated",
            user: null,
            accessToken: null,
            isLogin: false,
            isLoggingOut: false,
        });
    },

    setAccessToken: (accessToken) => {
        if (!isValidAccessToken(accessToken)) {
            localStorage.removeItem(ACCESS_TOKEN_KEY);
            localStorage.removeItem(USER_STORAGE_KEY);
            set({
                authStatus: "unauthenticated",
                user: null,
                accessToken: null,
                isLogin: false,
                isLoggingOut: false,
            });
            return;
        }

        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken.trim());

        set((state) => ({
            accessToken: accessToken.trim(),
            authStatus: state.user ? "authenticated" : state.authStatus,
            isLogin: state.user ? true : state.isLogin,
            isLoggingOut: false,
        }));
    },

    saveLogin: (user, accessToken) => {
        if (!isValidAccessToken(accessToken)) {
            localStorage.removeItem(ACCESS_TOKEN_KEY);
            localStorage.removeItem(USER_STORAGE_KEY);
            set({
                authStatus: "unauthenticated",
                user: null,
                accessToken: null,
                isLogin: false,
                isLoggingOut: false,
            });
            return;
        }

        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken.trim());
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

        set({
            authStatus: "authenticated",
            user,
            accessToken: accessToken.trim(),
            isLogin: true,
            isLoggingOut: false,
        });
    },

    logout: () => {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);

        set({
            authStatus: "unauthenticated",
            user: null,
            accessToken: null,
            isLogin: false,
            isLoggingOut: false,
        });
    },
}));

export default authStore;
