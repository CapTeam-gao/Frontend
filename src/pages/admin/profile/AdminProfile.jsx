import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../../components/common/header/Header";
import AppFooter from "../../../components/common/footer/AppFooter";
import { requestChangePassword, requestLogout } from "../../../api/authApi";
import { requestAdminDashboard } from "../../../api/dashboardApi";
import authStore from "../../../store/authStore";
import { getApiErrorMessage } from "../../../utils/apiError";
import {
    formatCapstoneLogDateTime,
    getNextCapstoneLogWindow,
    isCapstoneLogTime,
} from "../../../utils/capstoneLogTime";
import useInView from "../../../hooks/useInView";
import styles from "../../user/profile/UserProfile.module.css";

const AdminProfile = () => {
    const navigate = useNavigate();
    const user = authStore((state) => state.user);
    const logout = authStore((state) => state.logout);
    const [dashboard, setDashboard] = useState(null);
    const [dashboardError, setDashboardError] = useState(false);
    const [isDashboardLoading, setIsDashboardLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
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

    const loadDashboard = useCallback(async () => {
        setIsDashboardLoading(true);
        setDashboardError(false);
        try {
            const data = await requestAdminDashboard({ force: true });
            setDashboard(data);
        } catch {
            setDashboardError(true);
        } finally {
            setIsDashboardLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    useEffect(() => {
        const timer = window.setInterval(() => setCurrentTime(new Date()), 15_000);
        return () => window.clearInterval(timer);
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
            setError(getApiErrorMessage(e, "비밀번호 변경에 실패했습니다."));
        } finally {
            setIsSubmittingPassword(false);
        }
    };

    const contentRef = useInView({ replayKey: Boolean(dashboard) });
    const isLogTime = isCapstoneLogTime(currentTime);
    const nextLogTime = formatCapstoneLogDateTime(
        getNextCapstoneLogWindow(currentTime).startAt
    );
    const statusItems = dashboard
        ? [
              {
                  label: "등록 학생",
                  value: `${dashboard.totalStudentCount ?? 0}명`,
                  to: "/admin/student",
                  linkText: "학생 관리",
              },
              {
                  label: "확정 팀",
                  value: `${dashboard.totalTeamCount ?? 0}팀`,
                  to: "/admin/team-manage",
                  linkText: "팀 관리",
              },
              {
                  label: "캡스톤 일지 미제출",
                  value: isLogTime
                      ? `${dashboard.journalNotSubmittedTeamCount ?? 0}팀`
                      : "—",
                  note: isLogTime
                      ? "오늘 15:40~18:10 기준"
                      : `다음 작성일 ${nextLogTime}`,
                  warn:
                      isLogTime &&
                      (dashboard.journalNotSubmittedTeamCount ?? 0) > 0,
                  to: "/admin/log",
                  linkText: "일지 관리",
              },
              {
                  label: "활성 채팅방",
                  value: `${dashboard.activeChatRoomCount ?? 0}개`,
                  to: "/admin/chat",
                  linkText: "채팅 관리",
              },
          ]
        : [];

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.body} ref={contentRef}>
                <div className={styles.inner}>
                    <section className={styles.accountHead}>
                        <div className={styles.accountMain}>
                            <div>
                                <p data-reveal className={styles.accountRole}>
                                    관리자 계정
                                </p>
                                <h1 data-reveal className={styles.accountName}>
                                    {profile.name}
                                </h1>
                                <p data-reveal className={styles.accountMeta}>
                                    {profile.userId}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            data-reveal
                            className={styles.logoutButton}
                            onClick={handleLogout}
                        >
                            로그아웃
                        </button>
                    </section>

                    <div className={styles.columns}>
                        <div className={styles.infoColumn}>
                            <section>
                                <h2 data-reveal className={styles.sectionTitle}>
                                    관리 현황
                                </h2>
                                {dashboardError ? (
                                    <div
                                        className={styles.statusError}
                                        role="alert"
                                    >
                                        <p>관리 현황을 불러오지 못했어요.</p>
                                        <button
                                            type="button"
                                            className={styles.statusRetry}
                                            onClick={loadDashboard}
                                        >
                                            다시 시도
                                        </button>
                                    </div>
                                ) : isDashboardLoading ? (
                                    <p
                                        className={styles.statusLoading}
                                        aria-live="polite"
                                    >
                                        관리 현황을 불러오고 있어요.
                                    </p>
                                ) : (
                                    <div className={styles.infoRows}>
                                        {statusItems.map((item) => (
                                            <Link
                                                key={item.label}
                                                to={item.to}
                                                data-reveal
                                                className={styles.statusRow}
                                            >
                                                <span
                                                    className={styles.statusLabel}
                                                >
                                                    {item.label}
                                                    {item.note && (
                                                        <small
                                                            className={
                                                                styles.statusNote
                                                            }
                                                        >
                                                            {item.note}
                                                        </small>
                                                    )}
                                                </span>
                                                <span
                                                    className={styles.statusRight}
                                                >
                                                    <strong
                                                        className={
                                                            item.warn
                                                                ? styles.statusValueWarn
                                                                : styles.statusValue
                                                        }
                                                    >
                                                        {item.value}
                                                    </strong>
                                                    <span
                                                        className={
                                                            styles.statusLink
                                                        }
                                                    >
                                                        {item.linkText} →
                                                    </span>
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </div>

                        <aside className={styles.passwordColumn}>
                            <div className={styles.passwordCard}>
                                <div className={styles.passwordHead}>
                                    <h2 className={styles.passwordTitle}>
                                        비밀번호 변경
                                    </h2>
                                    {!isEditingPassword && (
                                        <button
                                            type="button"
                                            className={styles.textButton}
                                            onClick={() => {
                                                setError("");
                                                setSuccessMessage("");
                                                setIsEditingPassword(true);
                                            }}
                                        >
                                            변경하기
                                        </button>
                                    )}
                                </div>

                                {isEditingPassword ? (
                                    <form
                                        className={styles.passwordForm}
                                        onSubmit={handlePasswordSubmit}
                                    >
                                        <label className={styles.passwordField}>
                                            <span>기존 비밀번호</span>
                                            <input
                                                type="password"
                                                placeholder="기존 비밀번호를 입력해주세요"
                                                value={currentPassword}
                                                onChange={(event) =>
                                                    setCurrentPassword(
                                                        event.target.value
                                                    )
                                                }
                                            />
                                        </label>

                                        <label className={styles.passwordField}>
                                            <span>새 비밀번호</span>
                                            <input
                                                type="password"
                                                placeholder="새 비밀번호를 입력해주세요"
                                                value={newPassword}
                                                onChange={(event) =>
                                                    setNewPassword(
                                                        event.target.value
                                                    )
                                                }
                                            />
                                        </label>

                                        <label className={styles.passwordField}>
                                            <span>새 비밀번호 확인</span>
                                            <input
                                                type="password"
                                                placeholder="새 비밀번호를 다시 입력해주세요"
                                                value={confirmPassword}
                                                onChange={(event) =>
                                                    setConfirmPassword(
                                                        event.target.value
                                                    )
                                                }
                                            />
                                        </label>

                                        {error && (
                                            <p className={styles.errorText}>
                                                {error}
                                            </p>
                                        )}

                                        <div
                                            className={styles.passwordActions}
                                        >
                                            <button
                                                type="submit"
                                                className={
                                                    styles.primaryButton
                                                }
                                                disabled={!canSubmitPassword}
                                            >
                                                {isSubmittingPassword
                                                    ? "저장 중..."
                                                    : "변경하기"}
                                            </button>
                                            <button
                                                type="button"
                                                className={styles.ghostButton}
                                                onClick={() => {
                                                    setError("");
                                                    setIsEditingPassword(
                                                        false
                                                    );
                                                }}
                                            >
                                                취소
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className={styles.passwordPreview}>
                                        <p className={styles.passwordLabel}>
                                            비밀번호
                                        </p>
                                        <p className={styles.passwordDots}>
                                            ••••••••
                                        </p>
                                        {successMessage && (
                                            <p
                                                className={styles.successText}
                                            >
                                                {successMessage}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </aside>
                    </div>
                </div>
            </main>
            <AppFooter role="admin" />
        </div>
    );
};

export default AdminProfile;
