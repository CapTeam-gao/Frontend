import styles from "./Header.module.css";
import Logo from "../../../assets/images/logo.png";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import authStore from "../../../store/authStore";
import useUnreadChatCount from "../../../hooks/useUnreadChatCount";
import {
    ADMIN_TEAM_CREATED_CHANGE_EVENT,
    getStoredAdminTeamCreated,
} from "../../../utils/adminTeamStatusStorage";

const Header = () => {
    const location = useLocation();
    const user = authStore((state) => state.user);

    const hasUser = Boolean(user);
    const isAdmin = user?.accountRole === "ADMIN";
    const isAdminPage = location.pathname.startsWith("/admin");

    const [storedTeamCreated, setStoredTeamCreated] = useState(
        getStoredAdminTeamCreated
    );

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

    const teamCreated = isAdmin ? storedTeamCreated : null;

    const adminTeamPath = teamCreated
        ? "/admin/team-manage"
        : "/admin/team-create";

    const adminTeamLabel = teamCreated ? "팀 관리" : "팀 생성";

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
                        >
                            채팅 관리
                            {hasUnreadChat && (
                                <span
                                    className={styles.chatUnreadDot}
                                    aria-label="읽지 않은 채팅"
                                />
                            )}
                        </Link>{" "}
                        <Link to="/admin/log">캡스톤 일지</Link>
                        <Link to="/admin/student">학생 관리</Link>
                        <Link to="/admin/notice">공지</Link>
                    </>
                ) : hasUser ? (
                    <>
                        <Link to="/user/project">프로젝트</Link>
                        <Link
                            to="/user/chat"
                            className={styles.navLinkWithBadge}
                        >
                            팀 채팅
                            {hasUnreadChat && (
                                <span
                                    className={styles.chatUnreadDot}
                                    aria-label="읽지 않은 채팅"
                                />
                            )}
                        </Link>
                        <Link to="/user/log">캡스톤 일지</Link>
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
        </div>
    );
};

export default Header;
