import styles from "./Header.module.css";
import Logo from "../../../assets/images/logo.png";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import authStore from "../../../store/authStore";
import useUnreadChatCount from "../../../hooks/useUnreadChatCount";
import TeamRequiredModal from "../modal/TeamRequiredModal";
import {
    requestAdminDashboard,
    requestUserDashboard,
} from "../../../api/dashboardApi";
import {
    ADMIN_TEAM_CREATED_CHANGE_EVENT,
    getStoredAdminTeamCreated,
    setStoredAdminTeamCreated,
} from "../../../utils/adminTeamStatusStorage";
import { isAdminRole } from "../../../utils/accountRole";
import { getAdminTeamCreationStatus } from "../../../utils/teamStatus";

const PASSWORD_CHANGE_NOTICE_KEY = "capteam-show-password-change-notice";
const PASSWORD_CHANGE_NOTICE_SEEN_KEY = "capteam-show-password-change-notice-seen";
const TEAM_STATUS_CACHE_TTL = 1000 * 60 * 5;
const teamStatusCache = new Map();

const getPasswordNoticeShownKey = (userId) =>
    `capteam-password-change-notice-shown:${userId}`;

const getTeamStatusCacheKey = (role, userId) => `${role}:${userId || ""}`;

const getCachedTeamStatus = (cacheKey) => {
    const cachedTeamStatus = teamStatusCache.get(cacheKey);

    if (!cachedTeamStatus) return null;

    const isExpired = Date.now() - cachedTeamStatus.savedAt > TEAM_STATUS_CACHE_TTL;

    if (isExpired) {
        teamStatusCache.delete(cacheKey);
        return null;
    }

    return cachedTeamStatus.value;
};

const setCachedTeamStatus = (cacheKey, value) => {
    teamStatusCache.set(cacheKey, {
        value,
        savedAt: Date.now(),
    });
};

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const user = authStore((state) => state.user);

    const hasUser = Boolean(user);
    const isAdmin = isAdminRole(user?.accountRole);
    const isAdminPage = location.pathname.startsWith("/admin");
    const teamStatusCacheKey = getTeamStatusCacheKey(
        isAdmin ? "ADMIN" : "STUDENT",
        user?.userId
    );

    const [storedTeamCreated, setStoredTeamCreated] = useState(
        getStoredAdminTeamCreated
    );
    const [adminAllTeamCreated, setAdminAllTeamCreated] = useState(null);
    const [studentTeamCreated, setStudentTeamCreated] = useState(null);
    const [teamRequiredModal, setTeamRequiredModal] = useState(null);
    const [showPasswordNotice, setShowPasswordNotice] = useState(false);

    const { hasUnreadChat } = useUnreadChatCount({
        enabled: hasUser,
    });

    useEffect(() => {
        if (!isAdmin) return undefined;

        const updateStoredTeamStatus = () => {
            teamStatusCache.clear();
            setStoredTeamCreated(getStoredAdminTeamCreated());
        };

        const updateChangedTeamStatus = (event) => {
            teamStatusCache.clear();
            setStoredTeamCreated(event.detail);
        };

        window.addEventListener("storage", updateStoredTeamStatus);
        window.addEventListener(
            ADMIN_TEAM_CREATED_CHANGE_EVENT,
            updateChangedTeamStatus
        );

        return () => {
            window.removeEventListener("storage", updateStoredTeamStatus);
            window.removeEventListener(
                ADMIN_TEAM_CREATED_CHANGE_EVENT,
                updateChangedTeamStatus
            );
        };
    }, [isAdmin]);

    useEffect(() => {
        if (!hasUser || !isAdmin) return undefined;

        let ignore = false;
        const cachedTeamStatus = getCachedTeamStatus(teamStatusCacheKey);

        if (cachedTeamStatus) {
            const cacheTimerId = window.setTimeout(() => {
                setStoredAdminTeamCreated(cachedTeamStatus.teamManageAccessible);
                setAdminAllTeamCreated(cachedTeamStatus.allTeamCreated);
            }, 0);

            return () => {
                window.clearTimeout(cacheTimerId);
            };
        }

        const loadAdminTeamStatus = async () => {
            try {
                const dashboard = await requestAdminDashboard();
                const teamStatus = getAdminTeamCreationStatus(dashboard);

                if (!ignore) {
                    setStoredAdminTeamCreated(teamStatus.teamManageAccessible);
                    setAdminAllTeamCreated(teamStatus.allTeamCreated);
                    setCachedTeamStatus(teamStatusCacheKey, {
                        teamManageAccessible: teamStatus.teamManageAccessible,
                        allTeamCreated: teamStatus.allTeamCreated,
                    });
                }
            } catch {
                if (!ignore) {
                    setAdminAllTeamCreated(false);
                }
            }
        };

        loadAdminTeamStatus();

        return () => {
            ignore = true;
        };
    }, [hasUser, isAdmin, teamStatusCacheKey]);

    useEffect(() => {
        if (!hasUser || isAdmin) return undefined;

        let ignore = false;
        const cachedTeamStatus = getCachedTeamStatus(teamStatusCacheKey);

        if (cachedTeamStatus) {
            const cacheTimerId = window.setTimeout(() => {
                setStudentTeamCreated(cachedTeamStatus.teamCreated);
            }, 0);

            return () => {
                window.clearTimeout(cacheTimerId);
            };
        }

        const loadStudentTeamStatus = async () => {
            try {
                const dashboard = await requestUserDashboard();

                if (!ignore) {
                    setStudentTeamCreated(Boolean(dashboard.teamCreated));
                    setCachedTeamStatus(teamStatusCacheKey, {
                        teamCreated: Boolean(dashboard.teamCreated),
                    });
                }
            } catch {
                if (!ignore) {
                    setStudentTeamCreated(false);
                }
            }
        };

        loadStudentTeamStatus();

        return () => {
            ignore = true;
        };
    }, [hasUser, isAdmin, teamStatusCacheKey]);

    useEffect(() => {
        if (!hasUser) return;

        const pendingNoticeId = sessionStorage.getItem(
            PASSWORD_CHANGE_NOTICE_KEY
        );
        const shownNoticeId = sessionStorage.getItem(
            PASSWORD_CHANGE_NOTICE_SEEN_KEY
        );
        const shouldShowNotice =
            Boolean(pendingNoticeId) && pendingNoticeId !== shownNoticeId;

        if (shouldShowNotice) {
            sessionStorage.setItem(
                PASSWORD_CHANGE_NOTICE_SEEN_KEY,
                pendingNoticeId
            );
            sessionStorage.removeItem(PASSWORD_CHANGE_NOTICE_KEY);
            if (user?.userId) {
                localStorage.setItem(
                    getPasswordNoticeShownKey(user.userId),
                    "true"
                );
            }
            window.setTimeout(() => {
                setShowPasswordNotice(true);
            }, 0);
        }
    }, [hasUser, user?.userId]);

    const makeHeaderName = (user) => {
        if (!user) return "";

        if (user.userId.startsWith("stu")) {
            return `${user.userId.replace("stu", "")} ${user.name}`;
        }

        if (user.userId.startsWith("tea")) {
            return `${user.name} 선생님`;
        }

        return user.name;
    };

    const displayName = makeHeaderName(user);

    const logoPath =
        isAdmin || (!hasUser && isAdminPage)
            ? "/admin/dashboard"
            : "/user/dashboard";

    const adminTeamManageAccessible = storedTeamCreated;
    const teamCreated = isAdmin ? adminAllTeamCreated : studentTeamCreated;

    const adminTeamPath = adminTeamManageAccessible
        ? "/admin/team-manage"
        : "/admin/team-create";

    const adminTeamLabel = adminTeamManageAccessible ? "팀 관리" : "팀 생성";

    const showTeamRequiredModal = (event, message) => {
        event.preventDefault();
        setTeamRequiredModal({
            message,
        });
    };

    return (
        <div className={styles.header}>
            <Link to={logoPath}>
                <img className={styles.logo} src={Logo} alt="로고" />
            </Link>

            <nav className={styles.nav}>
                {hasUser && isAdmin ? (
                    <>
                        <Link to={adminTeamPath} className={styles.teamNavLink}>
                            {adminTeamLabel}
                        </Link>
                        <Link
                            to="/admin/chat"
                            className={styles.navLinkWithBadge}
                            onClick={(event) => {
                                if (teamCreated === false) {
                                    showTeamRequiredModal(
                                        event,
                                        "팀 생성이 완료되면 팀별 채팅방을 확인할 수 있습니다."
                                    );
                                }
                            }}
                        >
                            채팅 관리
                            {hasUnreadChat && (
                                <span
                                    className={styles.chatUnreadDot}
                                    aria-label="읽지 않은 채팅"
                                />
                            )}
                        </Link>{" "}
                        <Link
                            to="/admin/log"
                            onClick={(event) => {
                                if (teamCreated === false) {
                                    showTeamRequiredModal(
                                        event,
                                        "팀 생성이 완료되면 팀별 캡스톤 일지를 확인할 수 있습니다."
                                    );
                                }
                            }}
                        >
                            캡스톤 일지
                        </Link>
                        <Link to="/admin/student">학생 관리</Link>
                        <Link to="/admin/notice">공지</Link>
                    </>
                ) : hasUser ? (
                    <>
                        <Link
                            to="/user/project"
                            onClick={(event) => {
                                if (teamCreated === false) {
                                    showTeamRequiredModal(
                                        event,
                                        "팀 생성이 완료되면 프로젝트 정보를 작성할 수 있습니다."
                                    );
                                }
                            }}
                        >
                            프로젝트
                        </Link>
                        <Link
                            to="/user/chat"
                            className={styles.navLinkWithBadge}
                            onClick={(event) => {
                                if (teamCreated === false) {
                                    showTeamRequiredModal(
                                        event,
                                        "팀 생성이 완료되면 팀 채팅을 사용할 수 있습니다."
                                    );
                                }
                            }}
                        >
                            팀 채팅
                            {hasUnreadChat && (
                                <span
                                    className={styles.chatUnreadDot}
                                    aria-label="읽지 않은 채팅"
                                />
                            )}
                        </Link>
                        <Link
                            to="/user/log"
                            onClick={(event) => {
                                if (teamCreated === false) {
                                    showTeamRequiredModal(
                                        event,
                                        "팀 생성이 완료되면 캡스톤 일지를 작성할 수 있습니다."
                                    );
                                }
                            }}
                        >
                            캡스톤 일지
                        </Link>
                        <Link to="/user/notice">공지</Link>
                    </>
                ) : null}
            </nav>

            <div className={styles.userSlot}>
                {hasUser && (
                    <Link to={isAdmin ? "/admin/profile" : "/user/profile"}>
                        <p className={styles.user}>{displayName}</p>
                    </Link>
                )}
            </div>

            {teamRequiredModal && (
                <TeamRequiredModal
                    title="팀 생성 후 이용 가능합니다"
                    message={teamRequiredModal.message}
                    onClose={() => setTeamRequiredModal(null)}
                />
            )}

            {showPasswordNotice && (
                <TeamRequiredModal
                    label="보안 안내"
                    title="비밀번호를 변경해주세요"
                    message="처음 발급받은 비밀번호를 계속 사용 중이라면 내 정보에서 새 비밀번호로 변경해주세요."
                    actionText="변경하러 가기"
                    onAction={() =>
                        navigate(isAdmin ? "/admin/profile" : "/user/profile")
                    }
                    onClose={() => setShowPasswordNotice(false)}
                />
            )}
        </div>
    );
};

export default Header;
