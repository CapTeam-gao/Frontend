// ponytail: 실제 Firebase 프로젝트 값이 아직 없어서 .env의 플레이스홀더를 그대로 읽음.
// 팀에서 Firebase 프로젝트를 만들면 .env.development/.env.production에 아래 값들을 채워 넣으면 됨.
export const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseVapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export const isFirebaseConfigured = Boolean(
    firebaseConfig.apiKey && firebaseConfig.projectId && firebaseVapidKey
);
