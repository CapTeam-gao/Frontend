import { Routes, Route, Navigate } from "react-router-dom";
// 테스트 중에는 각 페이지를 바로 확인하기 위해 ProtectedRoute를 잠시 비활성화함
// import ProtectedRoute from "./ProtectedRoute";

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
import AdminNoticeEdit from "../pages/admin/AdminNoticeEdit";
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
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/team-create" element={<AdminTeamCreate />} />
            <Route
                path="/admin/team-create/loading"
                element={<AdminTeamCreateLoading />}
            />
            <Route path="/admin/team-edit" element={<AdminTeamEdit />} />
            <Route path="/admin/team-manage" element={<AdminTeamManage />} />
            <Route path="/admin/log" element={<AdminLogList />} />
            <Route path="/admin/log/:id" element={<AdminLogDetail />} />
            <Route path="/admin/student" element={<AdminStudentManage />} />
            <Route path="/admin/notice" element={<AdminNoticeList />} />
            <Route
                path="/admin/notice/create"
                element={<AdminNoticeCreate />}
            />
            <Route path="/admin/notice/:id/edit" element={<AdminNoticeEdit />} />
            <Route path="/admin/notice/:id" element={<AdminNoticeDetail />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/admin/chat" element={<AdminChatManage />} />
            {/* 유저 페이지들 - user만 접근 가능 */}
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/log" element={<UserLogWrite />} />
            <Route path="/user/log/result" element={<UserLogResult />} />
            <Route path="/user/project" element={<UserProject />} />
            <Route path="/user/notice" element={<UserNoticeList />} />
            <Route path="/user/notice/:id" element={<UserNoticeDetail />} />
            <Route path="/user/profile" element={<UserProfile />} />

            <Route path="/user/chat" element={<UserTeamChat />} />
            {/* 없는 주소 접근 시 로그인으로 */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default Router;
