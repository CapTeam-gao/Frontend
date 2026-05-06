import { create } from "zustand";

const authStore = create((set) => ({
    isLogin: null,
    user: null,

    setUser: (user) =>
        set({
            user,
            isLogin: true,
        }),

    clearUser: () =>
        set({
            user: null,
            isLogin: false,
        }),
}));

export default authStore;
