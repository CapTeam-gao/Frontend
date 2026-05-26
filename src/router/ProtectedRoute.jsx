import { Navigate } from "react-router-dom";
import authStore from "../store/authStore";

const ProtectedRoute = ({ children, requiredRole }) => {
    const isLogin = authStore((state) => state.isLogin);
    const user = authStore((state) => state.user);

    // null은 "로그인 확인 중"이라는 뜻
    if (isLogin === null) return null;

    if (!isLogin) {
        return <Navigate to="/login" replace />;
    }

    if (!user?.accountRole) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user.accountRole !== requiredRole) {
        const homePath =
            user.accountRole === "ADMIN"
                ? "/admin/dashboard"
                : "/user/dashboard";

        return <Navigate to={homePath} replace />;
    }

    return children;
};

export default ProtectedRoute;
