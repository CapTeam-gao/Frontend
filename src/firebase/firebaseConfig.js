// Firebase 웹 앱 설정값과 VAPID 공개키는 클라이언트에 노출되는 공개 식별값입니다.
// 서비스워커와 값이 어긋나면 Firebase Installations 단계에서 토큰 발급이 실패하므로 한 프로젝트 값으로 고정합니다.
export const firebaseConfig = {
    apiKey: "AIzaSyAvDwUmwU4g9t_REPN7ll-RuWbGagS-3lQ",
    authDomain: "capteam-c0216.firebaseapp.com",
    projectId: "capteam-c0216",
    storageBucket: "capteam-c0216.firebasestorage.app",
    messagingSenderId: "966982679733",
    appId: "1:966982679733:web:ea31cccb5775f89a1552fc",
};

export const firebaseVapidKey =
    "BH-Eegy8lj3MSLrTKxazoM-DpXXDh8qcQhUbZPasP23NkNELN4m3EbmN-p7MHuD0xAMA9ObRwykykF6wyBql1Yw";

export const isFirebaseConfigured = Boolean(
    firebaseConfig.apiKey && firebaseConfig.projectId && firebaseVapidKey
);
