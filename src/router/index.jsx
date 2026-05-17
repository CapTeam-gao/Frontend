import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import Login from "../pages/Login";

import AdminDashboard from "../pages/admin/Dashboard";
import TeamCreate from "../pages/admin/TeamCreate";
import TeamCreateLoading from "../pages/admin/TeamCreateLoading";
import TeamEdit from "../pages/admin/TeamEdit";
import TeamManage from "../pages/admin/TeamManage";
import LogList from "../pages/admin/LogList";
import LogDetail from "../pages/admin/LogDetail";
import StudentManage from "../pages/admin/StudentManage";
import NoticeList from "../pages/admin/NoticeList";
import NoticeDetail from "../pages/admin/NoticeDetail";
import NoticeCreate from "../pages/admin/NoticeCreate";
import AdminProfile from "../pages/admin/Profile";

import UserDashboard from "../pages/user/Dashboard";
import LogWrite from "../pages/user/LogWrite";
import LogResult from "../pages/user/LogResult";
import Project from "../pages/user/Project";
import UserNoticeList from "../pages/user/NoticeList";
import UserNoticeDetail from "../pages/user/NoticeDetail";
import UserProfile from "../pages/user/Profile";

// router 설정하는 파일
const Router = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            {/* / 경로로 들어가면 로그인 페이지 반환 */}
            <Route paht="/" element={<Navigate to="/login" replace />} />
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
                        <TeamCreate />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/team-create/loading"
                element={
                    <ProtectedRoute requiredRole="admin">
                        <TeamCreateLoading />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/team-edit"
                element={
                    <ProtectedRoute requiredRole="admin">
                        <TeamEdit />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/team-manage"
                element={
                    <ProtectedRoute requiredRole="admin">
                        <TeamManage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/log"
                element={
                    <ProtectedRoute requiredRole="admin">
                        <LogList />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/log/:id"
                element={
                    <ProtectedRoute requiredRole="admin">
                        <LogDetail />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/student"
                element={
                    <ProtectedRoute requiredRole="admin">
                        <StudentManage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/notice"
                element={
                    <ProtectedRoute requiredRole="admin">
                        <NoticeList />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/notice/create"
                element={
                    <ProtectedRoute requiredRole="admin">
                        <NoticeCreate />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/notice/:id"
                element={
                    <ProtectedRoute requiredRole="admin">
                        <NoticeDetail />
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
                        <ChatManage />
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
                        <LogWrite />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/user/log/result"
                element={
                    <ProtectedRoute requiredRole="user">
                        <LogResult />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/user/project"
                element={
                    <ProtectedRoute requiredRole="user">
                        <Project />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/user/notice"
                element={
                    <ProtectedRoute requiredRole="user">
                        <UserNoticeList />
                    </ProtectedRoute>
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
                        <TeamChat />
                    </ProtectedRoute>
                }
            />
            {/* 없는 주소 접근 시 로그인으로 */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default Router;
