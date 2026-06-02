import { useState } from "react";
import styles from "./UserSurvey.module.css";

const roles = [
    "프론트엔드",
    "백엔드",
    "DevOps",
    "디자인",
    "AI",
    "게임개발",
    "풀스택",
];

const mainRoles = ["프론트엔드", "백엔드", "풀스택"];

const personalityQuestions = [
    "팀원들과 의견을 자주 공유하는 편입니다.",
    "갈등이 생겼을 때 먼저 조율하려고 노력합니다.",
    "맡은 일을 끝까지 책임지고 마무리하는 편입니다.",
    "팀 안에서 필요한 일을 먼저 찾아서 움직입니다.",
    "다른 사람의 의견을 듣고 내 생각을 조정할 수 있습니다.",
    "일정이 밀릴 때 팀원에게 빠르게 공유합니다.",
    "발표나 회의에서 의견을 말하는 것이 어렵지 않습니다.",
    "팀 분위기가 어색할 때 먼저 말을 거는 편입니다.",
    "역할 분담이 명확할수록 더 편하게 일합니다.",
    "팀 목표를 위해 개인 선호를 어느 정도 조정할 수 있습니다.",
];

const devQuestions = [
    "새로운 기술을 찾아보고 적용하는 것을 좋아합니다.",
    "구현 전 구조를 먼저 정리하고 개발하는 편입니다.",
    "오류가 생기면 원인을 끝까지 추적하려고 합니다.",
    "코드 작성 후 스스로 테스트하는 습관이 있습니다.",
    "문서나 주석으로 작업 내용을 정리하는 편입니다.",
    "기능을 작게 나누어 순서대로 구현하는 편입니다.",
    "디자인과 사용자 경험을 고려하며 개발합니다.",
    "Git/GitHub를 활용한 협업 흐름에 익숙합니다.",
    "마감 전에 여유 있게 작업을 끝내려고 합니다.",
    "어려운 기능도 자료를 찾아가며 구현해보려 합니다.",
];

const RatingRow = ({ number, question }) => {
    return (
        <li className={styles.questionItem}>
            <p className={styles.questionText}>
                {number}. {question}
            </p>

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
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [stackText, setStackText] = useState("");
    const [experiences, setExperiences] = useState([
        {
            id: 1,
            value: "",
        },
    ]);
    const [preferredMembers, setPreferredMembers] = useState([""]);
    const [leaderPreference, setLeaderPreference] = useState("");

    const toggleRole = (role) => {
        setSelectedRoles((prevRoles) => {
            const isSelected = prevRoles.includes(role);

            if (isSelected) {
                return prevRoles.filter(
                    (selectedRole) => selectedRole !== role
                );
            }

            if (mainRoles.includes(role)) {
                return [
                    ...prevRoles.filter(
                        (selectedRole) => !mainRoles.includes(selectedRole)
                    ),
                    role,
                ];
            }

            return [...prevRoles, role];
        });
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
                id: Date.now(),
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
                    <form className={styles.form}>
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
                                                selectedRoles.includes(role)
                                                    ? styles.selectedOption
                                                    : ""
                                            }`}
                                            onClick={() => toggleRole(role)}
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
                                        key={question}
                                        number={index + 1}
                                        question={question}
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
                                {devQuestions.map((question, index) => (
                                    <RatingRow
                                        key={question}
                                        number={index + 11}
                                        question={question}
                                    />
                                ))}
                            </ul>
                        </section>

                        <div className={styles.submitArea}>
                            <p>
                                제출 후에는 마이페이지에서 일부 정보를 수정할 수
                                있습니다.
                            </p>
                            <button type="button">설문 제출</button>
                        </div>
                    </form>
                </section>
            </main>
        </div>
    );
};

export default UserSurvey;
