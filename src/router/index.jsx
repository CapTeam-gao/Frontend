import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import TeamCreatedRoute from "./TeamCreatedRoute";
import authStore from "../store/authStore";

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

const Router = () => {
    const user = authStore((state) => state.user);

    const adminRoute = (
        page,
        { requiresTeam = false, allowPartialAccess = false } = {}
    ) => (
        <ProtectedRoute requiredRole="ADMIN">
            {requiresTeam ? (
                <TeamCreatedRoute
                    role="ADMIN"
                    fallbackPath="/admin/dashboard"
                    allowPartialAccess={allowPartialAccess}
                >
                    {page}
                </TeamCreatedRoute>
            ) : (
                page
            )}
        </ProtectedRoute>
    );

    const userRoute = (
        page,
        { requiresTeam = false, surveyAccess = "completed" } = {}
    ) => (
        <ProtectedRoute requiredRole="STUDENT">
            {surveyAccess === "completed" &&
            user?.surveyCompleted === false ? (
                <Navigate to="/user/survey/intro" replace />
            ) : surveyAccess === "incomplete" &&
              user?.surveyCompleted === true ? (
                <Navigate to="/user/dashboard" replace />
            ) : requiresTeam ? (
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

            {/*
             * 팀 편집 화면은 아직 실제 팀이 생성되기 전 사용하는
             * 화면이므로 팀 생성 가드를 적용하면 안 됩니다.
             */}
            <Route
                path="/admin/team-edit"
                element={adminRoute(<AdminTeamEdit />)}
            />

            {/*
             * 평소에는 두 학년 팀이 모두 생성되어야 접근 가능합니다.
             * 단, 팀 승인 직후 전달받은 임시 접근권한은 허용합니다.
             */}
            <Route
                path="/admin/team-manage"
                element={adminRoute(<AdminTeamManage />, {
                    requiresTeam: true,
                    allowPartialAccess: true,
                })}
            />

            <Route
                path="/admin/log"
                element={adminRoute(<AdminLogList />, {
                    requiresTeam: true,
                })}
            />

            <Route
                path="/admin/log/:id"
                element={adminRoute(<AdminLogDetail />, {
                    requiresTeam: true,
                })}
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
                element={adminRoute(<AdminChatManage />, {
                    requiresTeam: true,
                })}
            />

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
                element={userRoute(<UserLogWrite />, {
                    requiresTeam: true,
                })}
            />

            <Route
                path="/user/log/result"
                element={userRoute(<UserLogResult />, {
                    requiresTeam: true,
                })}
            />

            <Route
                path="/user/project"
                element={userRoute(<UserProject />, {
                    requiresTeam: true,
                })}
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
                element={userRoute(<UserSurveyIntro />, {
                    surveyAccess: "incomplete",
                })}
            />

            <Route
                path="/user/survey"
                element={userRoute(<UserSurvey />, {
                    surveyAccess: "incomplete",
                })}
            />

            <Route
                path="/user/chat"
                element={userRoute(<UserTeamChat />, {
                    requiresTeam: true,
                })}
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default Router;
