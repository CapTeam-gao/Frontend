import { Navigate } from "react-router-dom";
import authStore from "../store/authStore";
import {
    getSupportedAccountRole,
    isAdminRole,
    normalizeAccountRole,
} from "../utils/accountRole";
import { getAccessTokenPayload } from "../utils/authToken";
import { isSurveyCompleted } from "../utils/survey";

const getPayloadRole = (payload) => {
    if (!payload || typeof payload !== "object") return "";

    const authority = Array.isArray(payload.authorities)
        ? payload.authorities[0]?.authority ?? payload.authorities[0]
        : "";

    const role = Array.isArray(payload.roles)
        ? payload.roles[0]
        : payload.role ?? payload.accountRole ?? payload.auth ?? authority;

    return getSupportedAccountRole(role);
};

const getHomePath = (accountRole, user) => {
    if (isAdminRole(accountRole)) return "/admin/dashboard";

    return isSurveyCompleted(user?.surveyCompleted)
        ? "/user/dashboard"
        : "/user/survey/intro";
};

const ProtectedRoute = ({ children, requiredRole }) => {
    const authStatus = authStore((state) => state.authStatus);
    const isLogin = authStore((state) => state.isLogin);
    const user = authStore((state) => state.user);
    const accessToken = authStore((state) => state.accessToken);

    if (authStatus === "checking" || isLogin === null) return null;

    if (authStatus !== "authenticated" || !isLogin) {
        return <Navigate to="/login" replace />;
    }

    const userRole = getSupportedAccountRole(user?.accountRole);
    const payloadRole = getPayloadRole(getAccessTokenPayload(accessToken));
    const accountRole = payloadRole || userRole;

    if (!accountRole) {
        return <Navigate to="/login" replace />;
    }

    if (userRole && payloadRole && userRole !== payloadRole) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && accountRole !== normalizeAccountRole(requiredRole)) {
        return <Navigate to={getHomePath(accountRole, user)} replace />;
    }

    return children;
};

export default ProtectedRoute;
