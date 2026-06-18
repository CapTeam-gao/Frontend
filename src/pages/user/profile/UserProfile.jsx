import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/common/header/Header";
import authStore from "../../../store/authStore";
import CharacterImage from "../../../assets/images/adminMypage.png";
import PasswordIcon from "../../../assets/icons/password.svg";
import styles from "./UserProfile.module.css";
import { requestChangePassword, requestLogout } from "../../../api/authApi";

const UserProfile = () => {
    const navigate = useNavigate();
    const user = authStore((state) => state.user);
    const logout = authStore((state) => state.logout);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
    const [error, setError] = useState("");
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const profile = {
        name: user?.name || "이름 불러오는 중",
        userId: user?.userId || "",
    };

    const canSubmitPassword = Boolean(
        currentPassword &&
            newPassword &&
            confirmPassword &&
            !isSubmittingPassword
    );

    const studentNumber = profile.userId.startsWith("stu")
        ? profile.userId.replace("stu", "")
        : profile.userId;

    const handleLogout = async () => {
        try {
            await requestLogout();
        } finally {
            logout();
            navigate("/login");
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (!currentPassword) {
            setError("기존 비밀번호를 입력해주세요.");
            return;
        }

        if (!newPassword) {
            setError("새 비밀번호를 입력해주세요.");
            return;
        }
        if (currentPassword === newPassword) {
            setError("기존 비밀번호와 새 비밀번호가 같습니다.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("새 비밀번호가 일치하지 않습니다.");
            return;
        }
        setError("");

        try {
            setIsSubmittingPassword(true);

            const data = await requestChangePassword({
                password: currentPassword,
                newPassword,
                checkPassword: confirmPassword,
            });
            setSuccessMessage(
                data.message || "비밀번호 변경이 완료되었습니다."
            );
            setIsEditingPassword(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (e) {
            setError(
                e.response?.data?.message ||
                    e.response?.data?.error ||
                    "비밀번호 변경에 실패했습니다."
            );
        } finally {
            setIsSubmittingPassword(false);
        }
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
                                    disabled={!canSubmitPassword}
                                >
                                    {isSubmittingPassword ? "저장 중..." : "저장"}
                                </button>
                            </div>

                            <div className={styles.passwordForm}>
                                <label>
                                    기존 비밀번호
                                    <input
                                        type="password"
                                        placeholder="기존 비밀번호를 입력해주세요"
                                        onChange={(e) => {
                                            setCurrentPassword(e.target.value);
                                        }}
                                        value={currentPassword}
                                    />
                                </label>

                                <label>
                                    새 비밀번호
                                    <input
                                        type="password"
                                        placeholder="새 비밀번호를 입력해주세요"
                                        onChange={(e) => {
                                            setNewPassword(e.target.value);
                                        }}
                                        value={newPassword}
                                    />
                                </label>

                                <label>
                                    비밀번호 확인
                                    <input
                                        type="password"
                                        placeholder="새 비밀번호를 다시 입력해주세요"
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                        }}
                                        value={confirmPassword}
                                    />
                                </label>
                            </div>
                            {error && (
                                <p className={styles.errorText}>{error}</p>
                            )}
                        </form>
                    ) : (
                        <div className={styles.infoPanel}>
                            <div className={styles.panelTitle}>
                                <h2>비밀번호 변경</h2>
                                <button
                                    type="button"
                                    className={styles.textButton}
                                    onClick={() => {
                                        setError("");
                                        setSuccessMessage("");
                                        setIsEditingPassword(true);
                                    }}
                                >
                                    수정
                                </button>
                            </div>

                            <div className={styles.passwordPreview}>
                                <img
                                    className={styles.lockIcon}
                                    src={PasswordIcon}
                                    alt=""
                                />
                                <div>
                                    <p>비밀번호</p>
                                    <strong>••••••••</strong>
                                </div>
                            </div>
                            {successMessage && (
                                <p className={styles.successText}>
                                    {successMessage}
                                </p>
                            )}
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
