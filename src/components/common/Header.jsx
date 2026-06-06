import styles from "./Header.module.css";
import Logo from "../../assets/images/logo.png";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import authStore from "../../store/authStore";
import { requestAdminDashboard } from "../../api/dashboardApi";

const Header = () => {
    const user = authStore((state) => state.user);
    const isAdmin = user?.accountRole === "ADMIN"; //role - > accountRole로 변경
    const [teamCreated, setTeamCreated] = useState(false);

    useEffect(() => {
        if (!isAdmin) return;

        const getTeamStatus = async () => {
            try {
                const dashboard = await requestAdminDashboard();
                setTeamCreated(
                    Boolean(
                        dashboard?.teamCreated || dashboard?.totalTeamCount > 0
                    )
                );
            } catch {
                setTeamCreated(false);
            }
        };

        getTeamStatus();
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

    return (
        <div className={styles.header}>
            <Link to={isAdmin ? "/admin/dashboard" : "/user/dashboard"}>
                <img className={styles.logo} src={Logo} alt="로고" />
            </Link>

            <nav className={styles.nav}>
                {isAdmin ? (
                    <>
                        <Link
                            to={
                                teamCreated
                                    ? "/admin/team-manage"
                                    : "/admin/team-create"
                            }
                        >
                            {teamCreated ? "팀 관리" : "팀 생성"}
                        </Link>
                        <Link to="/admin/chat">채팅 관리</Link>
                        <Link to="/admin/log">캡스톤 일지</Link>
                        <Link to="/admin/student">학생 관리</Link>
                        <Link to="/admin/notice">공지</Link>
                    </>
                ) : (
                    <>
                        <Link to="/user/chat">팀 채팅</Link>
                        <Link to="/user/log">캡스톤 일지</Link>
                        <Link to="/user/notice">공지</Link>
                    </>
                )}
            </nav>

            <Link to={isAdmin ? "/admin/profile" : "/user/profile"}>
                <p className={styles.user}>{displayName}</p>
            </Link>
        </div>
    );
};

export default Header;
