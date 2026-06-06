import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import authStore from "../../store/authStore";
import CharacterImage from "../../assets/images/adminMypage.png";
import styles from "./UserProfile.module.css";

const UserProfile = () => {
    const navigate = useNavigate();
    const user = authStore((state) => state.user);
    const logout = authStore((state) => state.logout);
    const [isEditingPassword, setIsEditingPassword] = useState(false);

    const profile = {
        name: user?.name || "허재원",
        loginId: user?.userId || "stu2313",
        roleText: "학생",
    };

    const studentNumber = profile.loginId.startsWith("stu")
        ? profile.loginId.replace("stu", "")
        : profile.loginId;

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        setIsEditingPassword(false);
    };

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.body}>
                <section className={styles.profileCard}>
                    <div className={styles.profileHeader}>
                        <div className={styles.avatar} aria-hidden="true">
                            <span />
                        </div>

                        <div className={styles.profileText}>
                            <h1>{profile.name}</h1>
                            <p>
                                {studentNumber} {profile.name}
                            </p>
                        </div>
                    </div>

                    {isEditingPassword ? (
                        <form
                            className={styles.infoPanel}
                            onSubmit={handlePasswordSubmit}
                        >
                            <div className={styles.panelTitle}>
                                <h2>비밀번호 변경</h2>
                                <button
                                    type="submit"
                                    className={styles.textButton}
                                >
                                    저장
                                </button>
                            </div>

                            <div className={styles.passwordForm}>
                                <label>
                                    기존 비밀번호
                                    <input
                                        type="password"
                                        placeholder="기존 비밀번호를 입력해주세요"
                                    />
                                </label>

                                <label>
                                    새 비밀번호
                                    <input
                                        type="password"
                                        placeholder="새 비밀번호를 입력해주세요"
                                    />
                                </label>

                                <label>
                                    비밀번호 확인
                                    <input
                                        type="password"
                                        placeholder="새 비밀번호를 다시 입력해주세요"
                                    />
                                </label>
                            </div>
                        </form>
                    ) : (
                        <div className={styles.infoPanel}>
                            <div className={styles.panelTitle}>
                                <h2>비밀번호 변경</h2>
                                <button
                                    type="button"
                                    className={styles.textButton}
                                    onClick={() => setIsEditingPassword(true)}
                                >
                                    수정
                                </button>
                            </div>

                            <div className={styles.passwordPreview}>
                                <span className={styles.lockIcon}>●</span>
                                <div>
                                    <p>비밀번호</p>
                                    <strong>••••••••</strong>
                                </div>
                            </div>
                        </div>
                    )}

                    <img
                        className={styles.characterImage}
                        src={CharacterImage}
                        alt=""
                    />

                    <button
                        type="button"
                        className={styles.logoutButton}
                        onClick={handleLogout}
                    >
                        로그아웃
                    </button>
                </section>
            </main>
        </div>
    );
};

export default UserProfile;
