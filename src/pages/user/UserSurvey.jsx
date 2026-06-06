import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestSubmitSurvey } from "../../api/userApi";
import authStore from "../../store/authStore";
import styles from "./UserSurvey.module.css";

const roles = [
    "프론트엔드",
    "백엔드",
    "DevOps",
    "디자인",
    "AI",
    "앱 개발",
    "게임개발",
    "보안",
    "풀스택",
];

const personalityGroups = [
    {
        key: "communication",
        label: "소통 성향",
        questions: [
            "나는 작업 중 막히는 부분이 있으면 팀원에게 상황을 공유하는 편이다.",
            "나는 팀원의 의견이 내 생각과 달라도 먼저 들어보려고 한다.",
        ],
    },
    {
        key: "responsibility",
        label: "책임감",
        questions: [
            "나는 맡은 일을 정해진 시간 안에 끝내려고 노력하는 편이다.",
            "나는 내가 맡은 일이 늦어질 것 같으면 미리 팀원에게 알린다.",
        ],
    },
    {
        key: "collaboration",
        label: "협업 선호도",
        questions: [
            "나는 혼자 작업하는 것보다 팀원과 역할을 나눠 작업하는 것이 편하다.",
            "나는 팀원이 어려움을 겪고 있으면 내 일이 아니어도 도와주려는 편이다.",
        ],
    },
    {
        key: "flexibility",
        label: "유연성",
        questions: [
            "나는 프로젝트 도중 역할이나 계획이 바뀌어도 적응하려고 노력한다.",
            "나는 내 작업물에 대한 피드백을 받으면 수정 방향을 고민해본다.",
        ],
    },
    {
        key: "emotionalStability",
        label: "감정 안정성",
        questions: [
            "나는 프로젝트 중 의견 충돌이 생겨도 감정적으로 대응하지 않으려고 한다.",
            "나는 일정이 바빠져도 차분하게 우선순위를 정하려고 한다.",
        ],
    },
];

const developmentGroups = [
    {
        key: "leadership",
        label: "리더십",
        questions: [
            "나는 팀 프로젝트에서 필요한 일을 먼저 정리하고 역할을 나누는 편이다.",
            "나는 팀이 방향을 잃었을 때 먼저 의견을 내고 정리하려고 한다.",
        ],
    },
    {
        key: "problemSolving",
        label: "문제 해결력",
        questions: [
            "나는 오류가 생기면 바로 포기하기보다 원인을 찾아보는 편이다.",
            "나는 모르는 기능이 있어도 검색이나 문서를 보며 해결해보려고 한다.",
        ],
    },
    {
        key: "implementation",
        label: "구현 실행력",
        questions: [
            "나는 정해진 기능을 실제 코드로 구현해보는 과정에 자신이 있다.",
            "나는 작은 기능이라도 완성해서 화면에 보이게 만드는 것을 중요하게 생각한다.",
        ],
    },
    {
        key: "learningAbility",
        label: "학습 성장성",
        questions: [
            "나는 프로젝트에 필요한 기술이라면 처음 접해도 배우려고 한다.",
            "나는 내가 부족한 부분을 알게 되면 따로 공부해서 보완하려고 한다.",
        ],
    },
    {
        key: "planning",
        label: "기획 정리력",
        questions: [
            "나는 기능을 만들기 전에 필요한 화면 흐름이나 데이터를 먼저 정리하는 편이다.",
            "나는 프로젝트 내용을 문서나 발표 자료로 정리하는 것에 부담이 적다.",
        ],
    },
];

const flattenQuestions = (groups, type) => {
    return groups.flatMap((group) =>
        group.questions.map((question, index) => ({
            id: `${type}-${group.key}-${index + 1}`,
            category: group.key,
            categoryLabel: group.label,
            question,
        }))
    );
};

const personalityQuestions = flattenQuestions(personalityGroups, "personality");
const developmentQuestions = flattenQuestions(developmentGroups, "development");
const allRatingQuestions = [...personalityQuestions, ...developmentQuestions];

const calculateAverageScores = (groups, answers, type) => {
    return groups.reduce((scores, group) => {
        const questionIds = group.questions.map(
            (_, index) => `${type}-${group.key}-${index + 1}`
        );
        const total = questionIds.reduce(
            (sum, questionId) => sum + Number(answers[questionId]),
            0
        );

        return {
            ...scores,
            [group.key]: total / questionIds.length,
        };
    }, {});
};

const getAnswerScores = (questions, answers) => {
    return questions.map((question) => Number(answers[question.id]));
};

const getSkillsFromText = (stackText) => {
    return stackText
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);
};

const roleToStudentRole = {
    프론트엔드: "FRONTEND",
    백엔드: "BACKEND",
    DevOps: "BACKEND",
    디자인: "DESIGN",
    AI: "AI",
    "앱 개발": "APP",
    게임개발: "APP",
    보안: "BACKEND",
    풀스택: "BACKEND",
};

const RatingRow = ({ number, question, categoryLabel, value, onChange }) => {
    return (
        <li className={styles.questionItem}>
            <p className={styles.questionText}>
                {number}. {question}
            </p>
            <p className={styles.questionCategory}>{categoryLabel}</p>

            <div className={styles.scaleArea}>
                <div className={styles.scaleLabels}>
                    <span>전혀 그렇지 않다</span>
                    <span>매우 그렇다</span>
                </div>

                <div
                    className={styles.scaleGroup}
                    aria-label={`${number}번 점수`}
                >
                    {[1, 2, 3, 4, 5].map((score) => (
                        <label key={score} className={styles.scaleOption}>
                            <input
                                type="radio"
                                name={`question-${number}`}
                                value={score}
                                checked={value === score}
                                onChange={() => onChange(score)}
                            />
                            <span>{score}</span>
                        </label>
                    ))}
                </div>
            </div>
        </li>
    );
};

const UserSurvey = () => {
    const navigate = useNavigate();
    const user = authStore((state) => state.user);
    const accessToken = authStore((state) => state.accessToken);
    const saveLogin = authStore((state) => state.saveLogin);
    const [selectedRole, setSelectedRole] = useState("");
    const [stackText, setStackText] = useState("");
    const [experiences, setExperiences] = useState([
        {
            id: 1,
            value: "",
        },
    ]);
    const [preferredMembers, setPreferredMembers] = useState([""]);
    const [leaderPreference, setLeaderPreference] = useState("");
    const [answers, setAnswers] = useState({});
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const selectRole = (role) => {
        setSelectedRole(role);
    };

    const updateExperience = (id, value) => {
        setExperiences((prevExperiences) =>
            prevExperiences.map((experience) =>
                experience.id === id ? { ...experience, value } : experience
            )
        );
    };

    const addExperience = () => {
        setExperiences((prevExperiences) => [
            ...prevExperiences,
            {
                id: crypto.randomUUID(), // 고유한 ID 생성해주는 함수
                value: "",
            },
        ]);
    };

    const removeExperience = (id) => {
        setExperiences((prevExperiences) =>
            prevExperiences.filter((experience) => experience.id !== id)
        );
    };

    const updatePreferredMember = (index, value) => {
        setPreferredMembers((prevMembers) =>
            prevMembers.map((member, memberIndex) =>
                memberIndex === index ? value : member
            )
        );
    };

    const addPreferredMember = () => {
        if (preferredMembers.length >= 3) return;

        setPreferredMembers((prevMembers) => [...prevMembers, ""]);
    };

    const removePreferredMember = (index) => {
        setPreferredMembers((prevMembers) =>
            prevMembers.filter((_, memberIndex) => memberIndex !== index)
        );
    };

    const updateAnswer = (questionId, score) => {
        setAnswers((prevAnswers) => ({
            ...prevAnswers,
            [questionId]: score,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const cleanExperiences = experiences
            .map((experience) => experience.value.trim())
            .filter(Boolean);
        const cleanPreferredMembers = preferredMembers
            .map((member) => member.trim())
            .filter(Boolean);
        const cleanSkills = getSkillsFromText(stackText);

        if (!selectedRole) {
            setError("희망 직군을 선택해주세요.");
            return;
        }

        if (cleanSkills.length === 0) {
            setError("사용 가능한 기술 스택을 입력해주세요.");
            return;
        }

        if (cleanExperiences.length === 0) {
            setError("구현 경험을 1개 이상 입력해주세요.");
            return;
        }

        if (!leaderPreference) {
            setError("팀장 선호 여부를 선택해주세요.");
            return;
        }

        const hasEmptyRating = allRatingQuestions.some(
            (question) => !answers[question.id]
        );

        if (hasEmptyRating) {
            setError("성격 성향과 개발 성향 문항을 모두 선택해주세요.");
            return;
        }

        setError("");

        const surveyData = {
            studentRole: roleToStudentRole[selectedRole],
            selectedRoles: [selectedRole],
            stackText,
            skill: cleanSkills,
            experience: cleanExperiences,
            experiences: cleanExperiences.map((experience) => ({
                value: experience,
            })),
            preferredTeammates: cleanPreferredMembers,
            preferredMembers: cleanPreferredMembers,
            wantsLeader: leaderPreference === "O",
            leaderPreference,
            personalityScoreAnswers: getAnswerScores(
                personalityQuestions,
                answers
            ),
            developmentScoreAnswers: getAnswerScores(
                developmentQuestions,
                answers
            ),
            personalityScores: calculateAverageScores(
                personalityGroups,
                answers,
                "personality"
            ),
            developmentScores: calculateAverageScores(
                developmentGroups,
                answers,
                "development"
            ),
        };

        try {
            setIsSubmitting(true);
            await requestSubmitSurvey(surveyData);

            if (user && accessToken) {
                saveLogin(
                    {
                        ...user,
                        surveyCompleted: true,
                    },
                    accessToken
                );
            }

            navigate("/user/dashboard");
        } catch (e) {
            setError(
                e.response?.data?.message ||
                    e.response?.data?.error ||
                    "설문 저장 중 오류가 발생했습니다."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.page}>
            <main className={styles.body}>
                <section className={styles.surveyNav}>
                    <strong>설문 구성</strong>
                    <span>1. 기술 정보</span>
                    <span>2. 성격 성향 10문항</span>
                    <span>3. 개발 성향 10문항</span>
                </section>

                <section className={styles.layout}>
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <section className={styles.card}>
                            <div className={styles.cardHeader}>
                                <span>STEP 1</span>
                                <h2>기술 정보</h2>
                                <p>
                                    팀 매칭에 사용할 희망 역할, 기술 스택, 구현
                                    경험을 입력해주세요.
                                </p>
                            </div>

                            <div className={styles.formSection}>
                                <div className={styles.sectionTitleArea}>
                                    <h3>희망 직군</h3>
                                    <p>희망하는 직군을 선택해주세요.</p>
                                </div>

                                <div className={styles.roleList}>
                                    {roles.map((role) => (
                                        <button
                                            key={role}
                                            type="button"
                                            className={`${
                                                styles.optionButton
                                            } ${
                                                selectedRole === role
                                                    ? styles.selectedOption
                                                    : ""
                                            }`}
                                            onClick={() => selectRole(role)}
                                        >
                                            {role}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.formSection}>
                                <div className={styles.sectionTitleArea}>
                                    <h3>사용 가능한 기술 스택</h3>
                                    <p>
                                        사용할 수 있는 기술을 쉼표로 구분해서
                                        작성해주세요.
                                    </p>
                                </div>

                                <textarea
                                    className={styles.stackTextarea}
                                    value={stackText}
                                    placeholder="예: React, JavaScript, Spring, MySQL"
                                    onChange={(e) =>
                                        setStackText(e.target.value)
                                    }
                                />
                            </div>

                            <div className={styles.formSection}>
                                <div className={styles.sectionTitleArea}>
                                    <h3>구현 경험</h3>
                                    <p>
                                        구현한 기능과 사용한 기술, 맡았던 로직을
                                        한 줄로 정리해주세요.
                                    </p>
                                </div>

                                <div className={styles.dynamicList}>
                                    {experiences.map((experience, index) => (
                                        <div
                                            key={experience.id}
                                            className={styles.dynamicItem}
                                        >
                                            <div className={styles.itemHeader}>
                                                <strong>
                                                    경험 {index + 1}
                                                </strong>
                                                {experiences.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeExperience(
                                                                experience.id
                                                            )
                                                        }
                                                    >
                                                        삭제
                                                    </button>
                                                )}
                                            </div>
                                            <textarea
                                                value={experience.value}
                                                placeholder="예: 로그인 기능 구현 - axios를 이용한 API 호출 및 zustand를 사용한 토큰 전역 관리"
                                                onChange={(e) =>
                                                    updateExperience(
                                                        experience.id,
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    className={styles.addButton}
                                    onClick={addExperience}
                                >
                                    구현 경험 추가
                                </button>
                            </div>

                            <div className={styles.formSection}>
                                <div className={styles.sectionTitleArea}>
                                    <h3>선호 팀원</h3>
                                    <p>
                                        함께 팀을 하고 싶은 학생을 최대 3명까지
                                        작성할 수 있습니다.
                                    </p>
                                </div>

                                <div className={styles.memberList}>
                                    {preferredMembers.map((member, index) => (
                                        <div
                                            key={`member-${index}`}
                                            className={styles.memberRow}
                                        >
                                            <input
                                                type="text"
                                                value={member}
                                                placeholder="예: 2313 허재원"
                                                onChange={(e) =>
                                                    updatePreferredMember(
                                                        index,
                                                        e.target.value
                                                    )
                                                }
                                            />
                                            {preferredMembers.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removePreferredMember(
                                                            index
                                                        )
                                                    }
                                                >
                                                    삭제
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    className={styles.addButton}
                                    onClick={addPreferredMember}
                                    disabled={preferredMembers.length >= 3}
                                >
                                    선호 팀원 추가
                                </button>
                            </div>

                            <div className={styles.formSection}>
                                <div className={styles.sectionTitleArea}>
                                    <h3>팀장 선호 여부</h3>
                                    <p>팀장 역할을 맡고 싶은지 선택해주세요.</p>
                                </div>

                                <div className={styles.binaryGroup}>
                                    {["O", "X"].map((value) => (
                                        <button
                                            key={value}
                                            type="button"
                                            className={`${
                                                styles.binaryButton
                                            } ${
                                                leaderPreference === value
                                                    ? styles.selectedOption
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                setLeaderPreference(value)
                                            }
                                        >
                                            {value}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section className={styles.card}>
                            <div className={styles.cardHeader}>
                                <span>STEP 2</span>
                                <h2>성격 성향</h2>
                            </div>

                            <ul className={styles.questionList}>
                                {personalityQuestions.map((question, index) => (
                                    <RatingRow
                                        key={question.id}
                                        number={index + 1}
                                        question={question.question}
                                        categoryLabel={question.categoryLabel}
                                        value={answers[question.id]}
                                        onChange={(score) =>
                                            updateAnswer(question.id, score)
                                        }
                                    />
                                ))}
                            </ul>
                        </section>

                        <section className={styles.card}>
                            <div className={styles.cardHeader}>
                                <span>STEP 3</span>
                                <h2>개발 성향</h2>
                                <p>
                                    개발할 때의 습관과 선호하는 작업 방식을
                                    선택해주세요.
                                </p>
                            </div>

                            <ul className={styles.questionList}>
                                {developmentQuestions.map((question, index) => (
                                    <RatingRow
                                        key={question.id}
                                        number={index + 11}
                                        question={question.question}
                                        categoryLabel={question.categoryLabel}
                                        value={answers[question.id]}
                                        onChange={(score) =>
                                            updateAnswer(question.id, score)
                                        }
                                    />
                                ))}
                            </ul>
                        </section>

                        <div className={styles.submitArea}>
                            <p className={error ? styles.errorText : ""}>
                                {error ||
                                    "제출 후에는 마이페이지에서 일부 정보를 수정할 수 있습니다."}
                            </p>
                            <button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "제출 중..." : "설문 제출"}
                            </button>
                        </div>
                    </form>
                </section>
            </main>
        </div>
    );
};

export default UserSurvey;
