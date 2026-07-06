import { Navigate } from "react-router-dom";
import authStore from "../store/authStore";
import { isAdminRole, normalizeAccountRole } from "../utils/accountRole";

const ProtectedRoute = ({ children, requiredRole }) => {
    const authStatus = authStore((state) => state.authStatus);
    const isLogin = authStore((state) => state.isLogin);
    const user = authStore((state) => state.user);

    if (authStatus === "checking" || isLogin === null) return null;

    if (!isLogin) {
        return <Navigate to="/login" replace />;
    }

    const accountRole = normalizeAccountRole(user?.accountRole);

    if (!accountRole) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && accountRole !== normalizeAccountRole(requiredRole)) {
        const homePath = isAdminRole(accountRole)
            ? "/admin/dashboard"
            : "/user/dashboard";

        return <Navigate to={homePath} replace />;
    }

    return children;
};

export default ProtectedRoute;
