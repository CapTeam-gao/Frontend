import styles from "./Header.module.css";
import Logo from "../../../assets/images/logo.png";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import authStore from "../../../store/authStore";
import useUnreadChatCount from "../../../hooks/useUnreadChatCount";
import TeamRequiredModal from "../modal/TeamRequiredModal";
import { requestUserDashboard } from "../../../api/dashboardApi";
import {
    ADMIN_TEAM_CREATED_CHANGE_EVENT,
    getStoredAdminTeamCreated,
} from "../../../utils/adminTeamStatusStorage";

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const user = authStore((state) => state.user);

    const hasUser = Boolean(user);
    const isAdmin = user?.accountRole === "ADMIN";
    const isAdminPage = location.pathname.startsWith("/admin");

    const [storedTeamCreated, setStoredTeamCreated] = useState(
        getStoredAdminTeamCreated
    );
    const [studentTeamCreated, setStudentTeamCreated] = useState(null);
    const [teamRequiredModal, setTeamRequiredModal] = useState(null);
    const [showPasswordNotice, setShowPasswordNotice] = useState(false);

    const { hasUnreadChat } = useUnreadChatCount({
        enabled: hasUser,
    });

    useEffect(() => {
        if (!isAdmin) return undefined;

        const updateStoredTeamStatus = () => {
            setStoredTeamCreated(getStoredAdminTeamCreated());
        };

        const updateChangedTeamStatus = (event) => {
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
        if (!hasUser || isAdmin) return undefined;

        let ignore = false;

        const loadStudentTeamStatus = async () => {
            try {
                const dashboard = await requestUserDashboard();

                if (!ignore) {
                    setStudentTeamCreated(Boolean(dashboard.teamCreated));
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
    }, [hasUser, isAdmin]);

    useEffect(() => {
        if (!hasUser) return;

        const shouldShowNotice =
            sessionStorage.getItem("capteam-show-password-change-notice") ===
            "true";

        if (shouldShowNotice) {
            sessionStorage.removeItem("capteam-show-password-change-notice");
            window.setTimeout(() => {
                setShowPasswordNotice(true);
            }, 0);
        }
    }, [hasUser]);

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

    const teamCreated = isAdmin ? storedTeamCreated : studentTeamCreated;

    const adminTeamPath = teamCreated
        ? "/admin/team-manage"
        : "/admin/team-create";

    const adminTeamLabel = teamCreated ? "팀 관리" : "팀 생성";

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
