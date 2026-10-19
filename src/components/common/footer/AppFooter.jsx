import { Link } from "react-router-dom";
import Logo from "../../../assets/images/logo.png";
import styles from "./AppFooter.module.css";

const FOOTER_LINKS = {
    admin: [
        { title: "팀 관리", links: [["팀 생성", "/admin/team-create"], ["학생 관리", "/admin/student"]] },
        { title: "서비스 운영", links: [["채팅 관리", "/admin/chat"], ["캡스톤 일지", "/admin/log"], ["공지", "/admin/notice"]] },
        { title: "내 계정", links: [["내 프로필", "/admin/profile"]] },
    ],
    student: [
        { title: "캡스톤 일지", links: [["일지 작성", "/user/log"], ["지난 일지", "/user/log/result"]] },
        { title: "프로젝트", links: [["프로젝트 기획서", "/user/project"]] },
        { title: "팀", links: [["팀 채팅", "/user/chat"]] },
        { title: "공지", links: [["공지 목록", "/user/notice"]] },
        { title: "내 계정", links: [["내 프로필", "/user/profile"]] },
    ],
};

const AppFooter = ({ role = "student" }) => (
    <footer className={styles.footer}>
        <div className={styles.inner}>
            <div className={styles.main}>
                <div className={styles.brand}>
                    <Link to={role === "admin" ? "/admin/dashboard" : "/user/dashboard"}>
                        <img src={Logo} alt="" aria-hidden="true" />
                        <span>CapTeam</span>
                    </Link>
                    <p>AI가 캡스톤 팀을 만들고,<br />팀이 끝까지 함께 갈 수 있도록 돕는 서비스</p>
                </div>
                <nav className={styles.columns} aria-label="푸터 메뉴">
                    {FOOTER_LINKS[role].map((group) => (
                        <div key={group.title}>
                            <h2>{group.title}</h2>
                            {group.links.map(([label, to]) => <Link key={to} to={to}>{label}</Link>)}
                        </div>
                    ))}
                </nav>
            </div>
            <div className={styles.bottom}>
                <span>© 2026 CapTeam. All rights reserved.</span>
                <a href="#top" onClick={(event) => { event.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>맨 위로 ↑</a>
            </div>
        </div>
    </footer>
);

export default AppFooter;
