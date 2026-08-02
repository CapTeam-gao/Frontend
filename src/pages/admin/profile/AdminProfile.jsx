import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../../components/common/header/Header";
import { requestChangePassword, requestLogout } from "../../../api/authApi";
import { requestAdminDashboard } from "../../../api/dashboardApi";
import authStore from "../../../store/authStore";
import styles from "./AdminProfile.module.css";

const AdminProfile = () => {
    const navigate = useNavigate();
    const user = authStore((state) => state.user);
    const logout = authStore((state) => state.logout);
    const [dashboard, setDashboard] = useState(null);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const profile = {
        name: user?.name || "",
        userId: user?.userId || "",
    };

    const canSubmitPassword = Boolean(
        currentPassword && newPassword && confirmPassword && !isSubmittingPassword
    );

    useEffect(() => {
        const getDashboard = async () => {
            try {
                const data = await requestAdminDashboard();
                setDashboard(data);
            } catch {
                // 관리 현황은 프로필 화면의 부가 정보라 실패해도 전체 에러로 띄우지 않는다.
            }
        };

        getDashboard();
    }, []);

    const handleLogout = async () => {
        try {
            await requestLogout();
        } finally {
            logout();
            navigate("/login", { replace: true });
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

            await requestChangePassword({
                password: currentPassword,
                newPassword,
                checkPassword: confirmPassword,
            });

            setSuccessMessage("비밀번호 변경이 완료되었습니다.");
            setIsEditingPassword(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (e) {
            setError(
                e.response?.data?.error || "비밀번호 변경에 실패했습니다."
            );
        } finally {
            setIsSubmittingPassword(false);
        }
    };

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.body}>
                <div className={styles.pageHead}>
                    <div className={styles.roleEyebrow}>관리자 계정</div>
                    <h1 className={styles.pageTitle}>{profile.name}</h1>
                    <p className={styles.pageSub}>{profile.userId}</p>
                </div>

                {dashboard && (
                    <div className={styles.statusSection}>
                        <div className={styles.statusTitle}>관리 현황</div>
                        <div className={styles.statusRow}>
                            <div className={styles.statusItem}>
                                <div className={styles.statusLabel}>
                                    등록 학생
                                </div>
                                <div className={styles.statusValue}>
                                    {dashboard.totalStudentCount}명
                                </div>
                                <Link
                                    to="/admin/student"
                                    className={styles.statusLink}
                                >
                                    학생 관리 →
                                </Link>
                            </div>
                            <div className={styles.statusItem}>
                                <div className={styles.statusLabel}>
                                    확정 팀
                                </div>
                                <div className={styles.statusValue}>
                                    {dashboard.totalTeamCount}팀
                                </div>
                                <Link
                                    to="/admin/team-manage"
                                    className={styles.statusLink}
                                >
                                    팀 관리 →
                                </Link>
                            </div>
                            <div className={styles.statusItem}>
                                <div className={styles.statusLabel}>
                                    캡스톤 일지 미제출
                                </div>
                                <div
                                    className={`${styles.statusValue} ${
                                        dashboard.journalNotSubmittedTeamCount >
                                        0
                                            ? styles.statusValueWarn
                                            : ""
                                    }`}
                                >
                                    {dashboard.journalNotSubmittedTeamCount}팀
                                </div>
                                <Link
                                    to="/admin/log"
                                    className={styles.statusLink}
                                >
                                    일지 관리 →
                                </Link>
                            </div>
                            <div className={styles.statusItem}>
                                <div className={styles.statusLabel}>
                                    활성 채팅방
                                </div>
                                <div className={styles.statusValue}>
                                    {dashboard.activeChatRoomCount}개
                                </div>
                                <Link
                                    to="/admin/chat"
                                    className={styles.statusLink}
                                >
                                    채팅 관리 →
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {isEditingPassword ? (
                    <form
                        className={styles.passwordSection}
                        onSubmit={handlePasswordSubmit}
                    >
                        <div className={styles.passwordHead}>
                            <div className={styles.passwordTitle}>
                                비밀번호 변경
                            </div>
                            <button
                                type="submit"
                                className={styles.textBtn}
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
                                    value={currentPassword}
                                    onChange={(e) =>
                                        setCurrentPassword(e.target.value)
                                    }
                                />
                            </label>

                            <label>
                                새 비밀번호
                                <input
                                    type="password"
                                    placeholder="새 비밀번호를 입력해주세요"
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(e.target.value)
                                    }
                                />
                            </label>

                            <label>
                                비밀번호 확인
                                <input
                                    type="password"
                                    placeholder="새 비밀번호를 다시 입력해주세요"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                />
                            </label>
                        </div>
                        {error && (
                            <p className={`${styles.formMsg} ${styles.error}`}>
                                {error}
                            </p>
                        )}
                    </form>
                ) : (
                    <div className={styles.passwordSection}>
                        <div className={styles.passwordHead}>
                            <div className={styles.passwordTitle}>
                                비밀번호 변경
                            </div>
                            <button
                                type="button"
                                className={styles.textBtn}
                                onClick={() => {
                                    setError("");
                                    setSuccessMessage("");
                                    setIsEditingPassword(true);
                                }}
                            >
                                수정
                            </button>
                        </div>

                        <p className={styles.passwordPreview}>
                            비밀번호 <strong>••••••••</strong>
                        </p>

                        {successMessage && (
                            <p
                                className={`${styles.formMsg} ${styles.success}`}
                            >
                                {successMessage}
                            </p>
                        )}
                    </div>
                )}

                <div className={styles.logoutRow}>
                    <button
                        type="button"
                        className={styles.logoutBtn}
                        onClick={handleLogout}
                    >
                        로그아웃
                    </button>
                </div>
            </main>
        </div>
    );
};

export default AdminProfile;
