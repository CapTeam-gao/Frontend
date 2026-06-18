const SurveyExperienceSection = ({
    styles,
    experiences,
    onUpdateExperience,
    onAddExperience,
    onRemoveExperience,
}) => {
    return (
        <div className={styles.formSection}>
            <div className={styles.sectionTitleArea}>
                <h3>구현 경험</h3>
                <p>
                    구현한 기능과 사용한 기술, 맡았던 로직을 한 줄로
                    정리해주세요.
                </p>
            </div>

            <div className={styles.dynamicList}>
                {experiences.map((experience, index) => (
                    <div key={experience.id} className={styles.dynamicItem}>
                        <div className={styles.itemHeader}>
                            <strong>경험 {index + 1}</strong>
                            {experiences.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        onRemoveExperience(experience.id)
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
                                onUpdateExperience(
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
                onClick={onAddExperience}
            >
                구현 경험 추가
            </button>
        </div>
    );
};

export default SurveyExperienceSection;
