import { Routes, Route, Navigate } from "react-router-dom";
// 개발 중에는 각 페이지를 바로 확인하기 위해 ProtectedRoute를 잠시 비활성화함
// import ProtectedRoute from "./ProtectedRoute";

import Login from "../pages/auth/Login";

import AdminDashboard from "../pages/admin/dashboard/AdminDashboard";
import AdminTeamCreate from "../pages/admin/team/AdminTeamCreate";
import AdminTeamCreateLoading from "../pages/admin/team/AdminTeamCreateLoading";
import AdminTeamEdit from "../pages/admin/team/AdminTeamEdit";
import AdminTeamManage from "../pages/admin/team/AdminTeamManage";
import AdminLogList from "../pages/admin/log/AdminLogList";
import AdminLogDetail from "../pages/admin/log/AdminLogDetail";
import AdminStudentManage from "../pages/admin/student/AdminStudentManage";
import AdminNoticeList from "../pages/admin/notice/AdminNoticeList";
import AdminNoticeDetail from "../pages/admin/notice/AdminNoticeDetail";
import AdminNoticeCreate from "../pages/admin/notice/AdminNoticeCreate";
import AdminNoticeEdit from "../pages/admin/notice/AdminNoticeEdit";
import AdminProfile from "../pages/admin/profile/AdminProfile";
import AdminChatManage from "../pages/admin/chat/AdminChatManage";

import UserDashboard from "../pages/user/dashboard/UserDashboard";
import UserLogWrite from "../pages/user/log/UserLogWrite";
import UserLogResult from "../pages/user/log/UserLogResult";
import UserProject from "../pages/user/project/UserProject";
import UserNoticeList from "../pages/user/notice/UserNoticeList";
import UserNoticeDetail from "../pages/user/notice/UserNoticeDetail";
import UserProfile from "../pages/user/profile/UserProfile";
import UserTeamChat from "../pages/user/chat/UserTeamChat";
import UserSurvey from "../pages/user/survey/UserSurvey";
import UserSurveyIntro from "../pages/user/survey/UserSurveyIntro";
import UserLogCountdown from "../pages/user/log/UserLogCountdown";

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
            <Route
                path="/admin/notice/:id/edit"
                element={<AdminNoticeEdit />}
            />
            <Route path="/admin/notice/:id" element={<AdminNoticeDetail />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/admin/chat" element={<AdminChatManage />} />
            {/* 유저 페이지들 - user만 접근 가능 */}
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/log" element={<UserLogCountdown />} />
            <Route path="/user/log/write" element={<UserLogWrite />} />
            <Route path="/user/log/result" element={<UserLogResult />} />
            <Route path="/user/project" element={<UserProject />} />
            <Route path="/user/notice" element={<UserNoticeList />} />
            <Route path="/user/notice/:id" element={<UserNoticeDetail />} />
            <Route path="/user/profile" element={<UserProfile />} />
            <Route path="/user/survey/intro" element={<UserSurveyIntro />} />
            <Route path="/user/survey" element={<UserSurvey />} />

            <Route path="/user/chat" element={<UserTeamChat />} />
            {/* 없는 주소 접근 시 로그인으로 */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default Router;
