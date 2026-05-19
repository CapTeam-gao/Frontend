import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import Login from "../pages/Login";

import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminTeamCreate from "../pages/admin/AdminTeamCreate";
import AdminTeamCreateLoading from "../pages/admin/AdminTeamCreateLoading";
import AdminTeamEdit from "../pages/admin/AdminTeamEdit";
import AdminTeamManage from "../pages/admin/AdminTeamManage";
import AdminLogList from "../pages/admin/AdminLogList";
import AdminLogDetail from "../pages/admin/AdminLogDetail";
import AdminStudentManage from "../pages/admin/AdminStudentManage";
import AdminNoticeList from "../pages/admin/AdminNoticeList";
import AdminNoticeDetail from "../pages/admin/AdminNoticeDetail";
import AdminNoticeCreate from "../pages/admin/AdminNoticeCreate";
import AdminProfile from "../pages/admin/AdminProfile";
import AdminChatManage from "../pages/admin/AdminChatManage";

import UserDashboard from "../pages/user/UserDashboard";
import UserLogWrite from "../pages/user/UserLogWrite";
import UserLogResult from "../pages/user/UserLogResult";
import UserProject from "../pages/user/UserProject";
import UserNoticeList from "../pages/user/UserNoticeList";
import UserNoticeDetail from "../pages/user/UserNoticeDetail";
import UserProfile from "../pages/user/UserProfile";
import UserTeamChat from "../pages/user/UserTeamChat";

// router 설정하는 파일
const Router = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            {/* / 경로로 들어가면 로그인 페이지 반환 */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route
                path="/admin/dashboard"
                element={
                    <ProtectedRoute requiredRole="admin">
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/team-create"
                element={
                    <ProtectedRoute requiredRole="admin">
                        <AdminTeamCreate />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/team-create/loading"
                element={
                    <ProtectedRoute requiredRole="admin">
                        <AdminTeamCreateLoading />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/team-edit"
                element={
                    <ProtectedRoute requiredRole="admin">
                        <AdminTeamEdit />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/team-manage"
                element={
                    <ProtectedRoute requiredRole="admin">
                        <AdminTeamManage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/log"
                element={
                    <ProtectedRoute requiredRole="admin">
                        <AdminLogList />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/log/:id"
                element={
                    <ProtectedRoute requiredRole="admin">
                        <AdminLogDetail />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/student"
                element={
                    <ProtectedRoute requiredRole="admin">
                        <AdminStudentManage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/notice"
                element={
                    <ProtectedRoute requiredRole="admin">
                        <AdminNoticeList />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/notice/create"
                element={
                    <ProtectedRoute requiredRole="admin">
                        <AdminNoticeCreate />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/notice/:id"
                element={
                    <ProtectedRoute requiredRole="admin">
                        <AdminNoticeDetail />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/profile"
                element={
                    <ProtectedRoute requiredRole="admin">
                        <AdminProfile />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/chat"
                element={
                    <ProtectedRoute requiredRole="admin">
                        <AdminChatManage />
                    </ProtectedRoute>
                }
            />
            {/* 유저 페이지들 - user만 접근 가능 */}
            <Route
                path="/user/dashboard"
                element={
                    <ProtectedRoute requiredRole="user">
                        <UserDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/user/log"
                element={
                    <ProtectedRoute requiredRole="user">
                        <UserLogWrite />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/user/log/result"
                element={
                    <ProtectedRoute requiredRole="user">
                        <UserLogResult />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/user/project"
                element={
                    <ProtectedRoute requiredRole="user">
                        <UserProject />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/user/notice"
                element={
                    // <ProtectedRoute requiredRole="user">
                    <UserNoticeList />
                    // {/* </ProtectedRoute> */}
                }
            />
            <Route
                path="/user/notice/:id"
                element={
                    <ProtectedRoute requiredRole="user">
                        <UserNoticeDetail />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/user/profile"
                element={
                    <ProtectedRoute requiredRole="user">
                        <UserProfile />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/user/chat"
                element={
                    <ProtectedRoute requiredRole="user">
                        <UserTeamChat />
                    </ProtectedRoute>
                }
            />
            {/* 없는 주소 접근 시 로그인으로 */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default Router;
