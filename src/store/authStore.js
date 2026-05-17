import { create } from "zustand";

// zustand로 전역상태관리
// 모두 null로 설정해놨다가 로그인 또는 로그아웃할 때 수정
const authStore = create((set) => ({
    isLogin: null,
    user: null,
    role: null,

    // 로그인 할 때 사용됨, user 값 넣고 로그인 true로 바꿈
    setUser: (user) =>
        set({
            user,
            isLogin: true,
            role: user.role,
        }),

    // 로그아웃 할 때 사용됨, user 값 널로 바꾸고 로그인 false
    clearUser: () =>
        set({
            user: null,
            isLogin: false,
            role: null,
        }),
}));

export default authStore;
