import styles from "./Header.module.css";
import Logo from "../../assets/images/logo.png";
import { Link } from "react-router-dom";
import authStore from "../../store/authStore";

const Header = () => {
    const user = authStore((state) => state.user);
    const role = authStore((state) => state.role);

    return (
        <div className={styles.header}>
            <Link
                to={role === "admin" ? "/admin/dashboard" : "/user/dashboard"}
            >
                <img className={styles.logo} src={Logo} alt="로고" />
            </Link>

            <nav className={styles.nav}>
                {role === "admin" ? (
                    <>
                        <Link to="/admin/team-create">팀 생성</Link>
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

            <Link to={role === "admin" ? "/admin/profile" : "/user/profile"}>
                <p className={styles.user}>2313 허재원</p>

                {/* <span className={styles.user}>{user?.name}</span> */}
            </Link>
        </div>
    );
};

export default Header;
