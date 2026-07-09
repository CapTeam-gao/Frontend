import { useCallback, useEffect } from "react";
import { requestMyInfo, requestReissue } from "../api/authApi";
import { isAuthenticationExpiredError } from "../api/api";
import authStore from "../store/authStore";
import {
    getAccessTokenPayload,
    isAccessTokenExpiringSoon,
} from "../utils/authToken";

const REISSUE_BUFFER_SECONDS = 120;

// 새로고침해도 토큰이 있으면 로그인 상태를 다시 확인함
const useAuth = () => {
    const accessToken = authStore((state) => state.accessToken);
    const authStatus = authStore((state) => state.authStatus);
    const isLoggingOut = authStore((state) => state.isLoggingOut);
    const saveLogin = authStore((state) => state.saveLogin);
    const setUnauthenticated = authStore((state) => state.setUnauthenticated);

    const refreshLogin = useCallback(async () => {
        const currentAuthState = authStore.getState();

        if (
            currentAuthState.isLoggingOut ||
            currentAuthState.authStatus === "unauthenticated"
        ) {
            return null;
        }

        const reissueData = await requestReissue();
        const newAccessToken = reissueData?.accessToken;

        if (!newAccessToken) {
            throw new Error("새 accessToken이 없습니다.");
        }

        const user = await requestMyInfo(newAccessToken);

        saveLogin(user, newAccessToken);
        return newAccessToken;
    }, [saveLogin]);

    useEffect(() => {
        let ignore = false;

        const checkLogin = async () => {
            try {
                if (authStore.getState().isLoggingOut) {
                    return;
                }

                if (
                    !accessToken ||
                    isAccessTokenExpiringSoon(
                        accessToken,
                        REISSUE_BUFFER_SECONDS
                    )
                ) {
                    if (
                        !accessToken &&
                        authStore.getState().authStatus !== "checking"
                    ) {
                        return;
                    }

                    await refreshLogin();
                    if (ignore) return;

                    return;
                }

                const user = await requestMyInfo(accessToken);
                if (ignore) return;

                const latestAccessToken =
                    authStore.getState().accessToken ?? accessToken;

                saveLogin(user, latestAccessToken);
            } catch (error) {
                const shouldClearLogin =
                    !authStore.getState().accessToken ||
                    isAuthenticationExpiredError(error);

                if (
                    !ignore &&
                    !authStore.getState().isLoggingOut &&
                    shouldClearLogin
                ) {
                    setUnauthenticated();
                }
            }
        };

        checkLogin();

        return () => {
            ignore = true;
        };
    }, [
        accessToken,
        authStatus,
        isLoggingOut,
        refreshLogin,
        saveLogin,
        setUnauthenticated,
    ]);

    useEffect(() => {
        let refreshTimerId;
        let isRefreshing = false;

        const refreshSession = async () => {
            if (isRefreshing || authStore.getState().isLoggingOut) return;

            try {
                isRefreshing = true;
                await refreshLogin();
            } catch (error) {
                if (
                    !authStore.getState().isLoggingOut &&
                    isAuthenticationExpiredError(error)
                ) {
                    setUnauthenticated();
                }
            } finally {
                isRefreshing = false;
            }
        };

        const refreshWhenNeeded = () => {
            const currentAuthState = authStore.getState();

            if (
                currentAuthState.isLoggingOut ||
                currentAuthState.authStatus === "unauthenticated"
            ) {
                return;
            }

            const currentToken = authStore.getState().accessToken;

            if (
                !currentToken ||
                !isAccessTokenExpiringSoon(
                    currentToken,
                    REISSUE_BUFFER_SECONDS
                )
            ) {
                return;
            }

            refreshSession();
        };

        const scheduleRefresh = () => {
            window.clearTimeout(refreshTimerId);

            const currentAuthState = authStore.getState();

            if (
                currentAuthState.isLoggingOut ||
                currentAuthState.authStatus === "unauthenticated"
            ) {
                return;
            }

            const currentToken = authStore.getState().accessToken;
            const payload = getAccessTokenPayload(currentToken);

            if (!payload?.exp) return;

            const currentTime = Math.floor(Date.now() / 1000);
            const refreshAfterMs = Math.max(
                (payload.exp - currentTime - REISSUE_BUFFER_SECONDS) * 1000,
                0
            );

            refreshTimerId = window.setTimeout(refreshSession, refreshAfterMs);
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                refreshWhenNeeded();
            }
        };

        scheduleRefresh();
        window.addEventListener("focus", refreshWhenNeeded);
        window.addEventListener("pageshow", refreshWhenNeeded);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            window.clearTimeout(refreshTimerId);
            window.removeEventListener("focus", refreshWhenNeeded);
            window.removeEventListener("pageshow", refreshWhenNeeded);
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };
    }, [accessToken, authStatus, isLoggingOut, refreshLogin, setUnauthenticated]);
};

export default useAuth;
