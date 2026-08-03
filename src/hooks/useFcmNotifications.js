import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import authStore from "../store/authStore";
import { requestFcmToken, onForegroundFcmMessage } from "../firebase/messaging";
import {
    requestRegisterFcmToken,
    requestRemoveFcmToken,
} from "../api/notificationApi";

// 로그인 상태에 따라 FCM 토큰을 등록/해제하고, 포그라운드로 도착한 알림(일지 마감·공지)을
// 토스트로 보여준다. 채팅 알림은 웹소켓 기반 별도 토스트(ChatToast)를 그대로 사용한다(api.md 8번).
const useFcmNotifications = () => {
    const authStatus = authStore((state) => state.authStatus);
    const wasAuthenticatedRef = useRef(false);
    const [toasts, setToasts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (authStatus === "authenticated" && !wasAuthenticatedRef.current) {
            wasAuthenticatedRef.current = true;

            requestFcmToken()
                .then((token) => {
                    if (token) return requestRegisterFcmToken(token);
                    return null;
                })
                .catch(() => {
                    // ponytail: 알림 권한 거부/미지원 브라우저는 조용히 무시 — 알림 없이도 서비스는 정상 이용 가능
                });
        }

        if (authStatus === "unauthenticated" && wasAuthenticatedRef.current) {
            wasAuthenticatedRef.current = false;
            requestRemoveFcmToken().catch(() => {});
        }
    }, [authStatus]);

    useEffect(() => {
        const unsubscribe = onForegroundFcmMessage((payload) => {
            setToasts((prev) => [
                ...prev,
                { id: `${payload.type}-${Date.now()}`, ...payload },
            ]);
        });

        return unsubscribe;
    }, []);

    const dismissToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const selectToast = useCallback(
        (toast) => {
            if (toast.clickUrl) navigate(toast.clickUrl);
        },
        [navigate]
    );

    return { toasts, dismissToast, selectToast };
};

export default useFcmNotifications;
