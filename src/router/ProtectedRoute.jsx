import { Navigate } from "react-router-dom";
import authStore from "../store/authStore";

const ProtectedRoute = ({ children, requiredRole }) => {
    const { isLogin, user } = authStore;

    if (isLogin === null) return null;

    if (!isLogin) {
        return <Navigate to="/login" replace />; //replace는 뒤로가기를 눌러도 안 이동되는 거?
    }

    if (requiredRole && user.role !== requiredRole) {
        <Navigate to="/" replace />;
    }
    return children;
};

export default ProtectedRoute;
