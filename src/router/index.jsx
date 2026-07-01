import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import TeamCreatedRoute from "./TeamCreatedRoute";

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
    const adminRoute = (page, { requiresTeam = false } = {}) => (
        <ProtectedRoute requiredRole="ADMIN">
            {requiresTeam ? (
                <TeamCreatedRoute role="ADMIN" fallbackPath="/admin/dashboard">
                    {page}
                </TeamCreatedRoute>
            ) : (
                page
            )}
        </ProtectedRoute>
    );

    const userRoute = (page, { requiresTeam = false } = {}) => (
        <ProtectedRoute requiredRole="STUDENT">
            {requiresTeam ? (
                <TeamCreatedRoute role="STUDENT" fallbackPath="/user/dashboard">
                    {page}
                </TeamCreatedRoute>
            ) : (
                page
            )}
        </ProtectedRoute>
    );

    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            {/* / 경로로 들어가면 로그인 페이지 반환 */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route
                path="/admin/dashboard"
                element={adminRoute(<AdminDashboard />)}
            />
            <Route
                path="/admin/team-create"
                element={adminRoute(<AdminTeamCreate />)}
            />
            <Route
                path="/admin/team-create/loading"
                element={adminRoute(<AdminTeamCreateLoading />)}
            />
            <Route
                path="/admin/team-edit"
                element={adminRoute(<AdminTeamEdit />)}
            />
            <Route
                path="/admin/team-manage"
                element={adminRoute(<AdminTeamManage />, {
                    requiresTeam: true,
                })}
            />
            <Route
                path="/admin/log"
                element={adminRoute(<AdminLogList />, { requiresTeam: true })}
            />
            <Route
                path="/admin/log/:id"
                element={adminRoute(<AdminLogDetail />, { requiresTeam: true })}
            />
            <Route
                path="/admin/student"
                element={adminRoute(<AdminStudentManage />)}
            />
            <Route
                path="/admin/notice"
                element={adminRoute(<AdminNoticeList />)}
            />
            <Route
                path="/admin/notice/create"
                element={adminRoute(<AdminNoticeCreate />)}
            />
            <Route
                path="/admin/notice/:id/edit"
                element={adminRoute(<AdminNoticeEdit />)}
            />
            <Route
                path="/admin/notice/:id"
                element={adminRoute(<AdminNoticeDetail />)}
            />
            <Route
                path="/admin/profile"
                element={adminRoute(<AdminProfile />)}
            />
            <Route
                path="/admin/chat"
                element={adminRoute(<AdminChatManage />, { requiresTeam: true })}
            />
            {/* 유저 페이지들 - user만 접근 가능 */}
            <Route
                path="/user/dashboard"
                element={userRoute(<UserDashboard />)}
            />
            <Route
                path="/user/log"
                element={userRoute(<UserLogCountdown />, {
                    requiresTeam: true,
                })}
            />
            <Route
                path="/user/log/write"
                element={userRoute(<UserLogWrite />, { requiresTeam: true })}
            />
            <Route
                path="/user/log/result"
                element={userRoute(<UserLogResult />, { requiresTeam: true })}
            />
            <Route
                path="/user/project"
                element={userRoute(<UserProject />, { requiresTeam: true })}
            />
            <Route
                path="/user/notice"
                element={userRoute(<UserNoticeList />)}
            />
            <Route
                path="/user/notice/:id"
                element={userRoute(<UserNoticeDetail />)}
            />
            <Route
                path="/user/profile"
                element={userRoute(<UserProfile />)}
            />
            <Route
                path="/user/survey/intro"
                element={userRoute(<UserSurveyIntro />)}
            />
            <Route path="/user/survey" element={userRoute(<UserSurvey />)} />

            <Route
                path="/user/chat"
                element={userRoute(<UserTeamChat />, { requiresTeam: true })}
            />
            {/* 없는 주소 접근 시 로그인으로 */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default Router;
