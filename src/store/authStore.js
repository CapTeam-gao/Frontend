import { create } from "zustand";

const authStore = create((set) => ({
    token: null,

    setToken: (token) => set({ token }),

    logout: () => set({ token: null }),
}));

export default authStore;
