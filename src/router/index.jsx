import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import TeamCreatedRoute from "./TeamCreatedRoute";
import authStore from "../store/authStore";

import { isSurveyCompleted } from "../utils/survey";

const Login = lazy(() => import("../pages/auth/Login"));

const AdminDashboard = lazy(() => import("../pages/admin/dashboard/AdminDashboard"));
const AdminTeamCreate = lazy(() => import("../pages/admin/team/AdminTeamCreate"));
const AdminTeamCreateLoading = lazy(() => import("../pages/admin/team/AdminTeamCreateLoading"));
const AdminTeamEdit = lazy(() => import("../pages/admin/team/AdminTeamEdit"));
const AdminTeamManage = lazy(() => import("../pages/admin/team/AdminTeamManage"));
const AdminTeamManualCreate = lazy(() => import("../pages/admin/team/AdminTeamManualCreate"));
const AdminLogList = lazy(() => import("../pages/admin/log/AdminLogList"));
const AdminLogDetail = lazy(() => import("../pages/admin/log/AdminLogDetail"));
const AdminStudentManage = lazy(() => import("../pages/admin/student/AdminStudentManage"));
const AdminNoticeList = lazy(() => import("../pages/admin/notice/AdminNoticeList"));
const AdminNoticeDetail = lazy(() => import("../pages/admin/notice/AdminNoticeDetail"));
const AdminNoticeCreate = lazy(() => import("../pages/admin/notice/AdminNoticeCreate"));
const AdminNoticeEdit = lazy(() => import("../pages/admin/notice/AdminNoticeEdit"));
const AdminProfile = lazy(() => import("../pages/admin/profile/AdminProfile"));
const AdminChatManage = lazy(() => import("../pages/admin/chat/AdminChatManage"));
const AdminChatList = lazy(() => import("../pages/admin/chat/AdminChatList"));

const UserDashboard = lazy(() => import("../pages/user/dashboard/UserDashboard"));
const UserLogWrite = lazy(() => import("../pages/user/log/UserLogWrite"));
const UserLogResult = lazy(() => import("../pages/user/log/UserLogResult"));
const UserProject = lazy(() => import("../pages/user/project/UserProject"));
const UserNoticeList = lazy(() => import("../pages/user/notice/UserNoticeList"));
const UserNoticeDetail = lazy(() => import("../pages/user/notice/UserNoticeDetail"));
const UserProfile = lazy(() => import("../pages/user/profile/UserProfile"));
const UserTeamChat = lazy(() => import("../pages/user/chat/UserTeamChat"));
const UserSurvey = lazy(() => import("../pages/user/survey/UserSurvey"));
const UserSurveyIntro = lazy(() => import("../pages/user/survey/UserSurveyIntro"));
const UserLogCountdown = lazy(() => import("../pages/user/log/UserLogCountdown"));

const RouteLoading = () => (
    <main className="routeLoading" aria-live="polite">
        화면을 불러오는 중입니다.
    </main>
);

const Router = () => {
    const user = authStore((state) => state.user);
    const surveyCompleted = isSurveyCompleted(user?.surveyCompleted);

    const adminRoute = (page, { requiresTeam = false } = {}) => (
        <ProtectedRoute requiredRole="ADMIN">
            {requiresTeam ? (
                <TeamCreatedRoute
                    role="ADMIN"
                    fallbackPath="/admin/dashboard"
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
            {surveyAccess === "completed" && !surveyCompleted ? (
                <Navigate to="/user/survey/intro" replace />
            ) : surveyAccess === "incomplete" && surveyCompleted ? (
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
        <Suspense fallback={<RouteLoading />}>
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

            {/* 직접 팀 구성 화면도 팀 생성 전 사용하는 화면이라 가드 없음. */}
            <Route
                path="/admin/team-manual-create"
                element={adminRoute(<AdminTeamManualCreate />)}
            />

            {/* 두 학년 팀이 모두 생성되어야 접근 가능합니다. */}
            <Route
                path="/admin/team-manage"
                element={adminRoute(<AdminTeamManage />, {
                    requiresTeam: true,
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
                element={adminRoute(<AdminChatList />, {
                    requiresTeam: true,
                })}
            />

            <Route
                path="/admin/chat/:roomId"
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
        </Suspense>
    );
};

export default Router;
