import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/common/header/Header";
import authStore from "../../../store/authStore";
import CharacterImage from "../../../assets/images/adminMypage.png";
import { requestMySurvey } from "../../../api/surveyApi";
import { requestMyTeam } from "../../../api/teamApi";
import { roleLabels } from "../../../constants/student";
import styles from "./UserProfile.module.css";
import { requestChangePassword, requestLogout } from "../../../api/authApi";

const personalityFields = [
    { key: "communication", label: "소통" },
    { key: "responsibility", label: "책임감" },
    { key: "collaboration", label: "협업" },
    { key: "flexibility", label: "유연성" },
    { key: "emotionalStability", label: "안정성" },
];

const developmentFields = [
    { key: "leadership", label: "리더십" },
    { key: "problemSolving", label: "문제 해결" },
    { key: "implementation", label: "구현력" },
    { key: "learningAbility", label: "학습력" },
    { key: "planning", label: "기획력" },
];

const getSurveyScore = (survey, groupKey, fieldKey) => {
    const directScore = survey?.[fieldKey];
    const groupedScore = survey?.[groupKey]?.[fieldKey];
    const score = Number(directScore ?? groupedScore ?? 0);

    return Number.isFinite(score) ? score : 0;
};

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
    const [survey, setSurvey] = useState(null);
    const [myTeam, setMyTeam] = useState(null);
    const [profileError, setProfileError] = useState("");

    const profile = {
        name: user?.name || "",
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

    const skillList = useMemo(() => {
        if (Array.isArray(survey?.skill)) return survey.skill;
        if (Array.isArray(survey?.skills)) return survey.skills;
        return [];
    }, [survey]);

    const teamDisplayName =
        myTeam?.projectTeamName ||
        myTeam?.project?.teamName ||
        myTeam?.teamName ||
        "미배정";

    const personalityChart = personalityFields.map((field) => ({
        ...field,
        score: getSurveyScore(survey, "personalityScores", field.key),
    }));
    const developmentChart = developmentFields.map((field) => ({
        ...field,
        score: getSurveyScore(survey, "developmentScores", field.key),
    }));

    useEffect(() => {
        const getProfileSummary = async () => {
            try {
                const [surveyData, teamData] = await Promise.allSettled([
                    requestMySurvey(),
                    requestMyTeam(),
                ]);

                if (surveyData.status === "fulfilled") {
                    setSurvey(surveyData.value);
                }

                if (teamData.status === "fulfilled") {
                    setMyTeam(teamData.value);
                }

                if (
                    surveyData.status === "rejected" &&
                    teamData.status === "rejected"
                ) {
                    setProfileError(
                        "설문과 팀 정보를 불러오지 못했습니다."
                    );
                }
            } catch {
                setProfileError("프로필 요약 정보를 불러오지 못했습니다.");
            }
        };

        getProfileSummary();
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
                            <span className={styles.roleBadge}>학생 계정</span>
                            <h1>{profile.name}</h1>
                            <p>{studentNumber}</p>
                        </div>

                        <img
                            className={styles.characterImage}
                            src={CharacterImage}
                            alt=""
                        />
                    </div>

                    <section className={styles.profileSummary}>
                        <article className={styles.userInfoPanel}>
                            <div className={styles.infoRows}>
                                <div>
                                    <span>희망 직군</span>
                                    <strong>
                                        {roleLabels[survey?.studentRole] ||
                                            survey?.studentRole ||
                                            "설문 미입력"}
                                    </strong>
                                </div>

                                <div>
                                    <span>배정된 팀</span>
                                    <strong>{teamDisplayName}</strong>
                                </div>
                            </div>

                            <div className={styles.stackBlock}>
                                <div className={styles.panelTop}>
                                    <h2>기술 스택</h2>
                                    <span>{skillList.length}개</span>
                                </div>

                                <div className={styles.stackList}>
                                    {skillList.length > 0 ? (
                                        skillList.map((skill) => (
                                            <span key={skill}>{skill}</span>
                                        ))
                                    ) : (
                                        <p>입력된 기술 스택이 없습니다.</p>
                                    )}
                                </div>
                            </div>
                        </article>

                        <article className={styles.chartPanel}>
                            <div className={styles.panelTop}>
                                <h2>성향 차트</h2>
                                <span>5점 기준</span>
                            </div>

                            <div className={styles.chartGroups}>
                                <div className={styles.chartGroup}>
                                    <h3>성격 성향</h3>
                                    <div className={styles.traitList}>
                                        {personalityChart.map((trait) => (
                                            <div
                                                className={styles.traitRow}
                                                key={trait.key}
                                            >
                                                <span>{trait.label}</span>
                                                <div
                                                    className={
                                                        styles.traitTrack
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            styles.traitBar
                                                        }
                                                        style={{
                                                            width: `${Math.min(
                                                                trait.score *
                                                                    20,
                                                                100
                                                            )}%`,
                                                        }}
                                                    />
                                                </div>
                                                <strong>
                                                    {trait.score
                                                        ? trait.score.toFixed(1)
                                                        : "-"}
                                                </strong>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.chartGroup}>
                                    <h3>개발 성향</h3>
                                    <div className={styles.traitList}>
                                        {developmentChart.map((trait) => (
                                            <div
                                                className={styles.traitRow}
                                                key={trait.key}
                                            >
                                                <span>{trait.label}</span>
                                                <div
                                                    className={
                                                        styles.traitTrack
                                                    }
                                                >
                                                    <div
                                                        className={
                                                            styles.traitBar
                                                        }
                                                        style={{
                                                            width: `${Math.min(
                                                                trait.score *
                                                                    20,
                                                                100
                                                            )}%`,
                                                        }}
                                                    />
                                                </div>
                                                <strong>
                                                    {trait.score
                                                        ? trait.score.toFixed(1)
                                                        : "-"}
                                                </strong>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </article>
                    </section>

                    {profileError && (
                        <p className={styles.profileError}>{profileError}</p>
                    )}

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
