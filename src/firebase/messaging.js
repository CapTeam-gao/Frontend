import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import {
    firebaseConfig,
    firebaseVapidKey,
    isFirebaseConfigured,
} from "./firebaseConfig";

const getMessagingInstance = () => {
    if (!isFirebaseConfigured) return null;

    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

    return getMessaging(app);
};

// 알림 권한을 요청하고 FCM 토큰을 발급받는다. Firebase 설정이 없으면 null을 반환한다.
export const requestFcmToken = async () => {
    if (!isFirebaseConfigured) return null;
    if (typeof Notification === "undefined") return null;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
    );

    const messaging = getMessagingInstance();
    if (!messaging) return null;

    return getToken(messaging, {
        vapidKey: firebaseVapidKey,
        serviceWorkerRegistration: registration,
    });
};

// 포그라운드(사이트 이용 중)로 도착한 FCM 메시지를 구독한다.
// payload.data(type/targetId/clickUrl)는 api.md 2번 섹션 공통 형식, payload.notification(title/body)은 표시용 텍스트.
export const onForegroundFcmMessage = (callback) => {
    const messaging = getMessagingInstance();
    if (!messaging) return () => {};

    return onMessage(messaging, (payload) =>
        callback({
            ...(payload.data || {}),
            title: payload.notification?.title,
            body: payload.notification?.body,
        })
    );
};
