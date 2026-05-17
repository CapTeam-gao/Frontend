import { Navigate } from "react-router-dom";
import authStore from "../store/authStore";

// // children은
// <ProtectedRoute><MainPage /></ProtectedRoute>
// 여기서 <MainPage /> 이므로 리액트에선 자동으로 children 변수에 저장됨
const ProtectedRoute = ({ children, requiredRole }) => {
    const { isLogin, user } = authStore((state) => state);

    // 로그인 상태 확인 중 (null이면 아직 모르는 상태)
    if (isLogin === null) return null;

    // 로그인 안 했으면 로그인 페이지로
    if (!isLogin) {
        return <Navigate to="/login" replace />;
    }

    // 권한 없으면 본인 메인 페이지로
    if (requiredRole && user.role !== requiredRole) {
        return (
            <Navigate
                to={
                    user.role === "admin"
                        ? "/admin/dashboard"
                        : "/user/dashboard"
                }
                replace
            />
        );
    }

    // 다 통과했다면 들어온 페이지 그대로 반환해줌
    return children;
};

export default ProtectedRoute;
