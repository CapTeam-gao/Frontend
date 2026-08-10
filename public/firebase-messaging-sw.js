/* global importScripts, firebase, clients */

// FCM 백그라운드(탭 닫힘) 알림 처리용 서비스워커.
// ponytail: public/ 정적 파일이라 Vite의 import.meta.env를 못 쓴다 — 실제 Firebase 프로젝트가 생기면
// 아래 firebaseConfig 값을 프로젝트 콘솔에서 그대로 복사해 채워 넣으면 된다(src/firebase/firebaseConfig.js와 동일한 값).
importScripts(
    "https://www.gstatic.com/firebasejs/10.13.1/firebase-app-compat.js"
);
importScripts(
    "https://www.gstatic.com/firebasejs/10.13.1/firebase-messaging-compat.js"
);

const firebaseConfig = {
    apiKey: "AIzaSyAvDwUmwU4g9t_REPN7ll-RuWbGagS-3lQ",
    authDomain: "capteam-c0216.firebaseapp.com",
    projectId: "capteam-c0216",
    storageBucket: "capteam-c0216.firebasestorage.app",
    messagingSenderId: "966982679733",
    appId: "1:966982679733:web:ea31cccb5775f89a1552fc",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// data payload 형식은 api.md 2번 섹션 참고: { type, targetId, clickUrl }
messaging.onBackgroundMessage((payload) => {
    const data = payload.data || {};
    const title = payload.notification?.title || data.title || "CapTeam 알림";
    const body = payload.notification?.body || data.body || "";

    self.registration.showNotification(title, {
        body,
        icon: "/logo.png",
        data,
    });
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const clickUrl = event.notification.data?.clickUrl || "/";

    event.waitUntil(clients.openWindow(clickUrl));
});
