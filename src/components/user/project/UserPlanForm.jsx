import styles from "./UserPlanForm.module.css";

const UserPlanForm = ({
    projectPlan,
    hasSavedPlan,
    error,
    isLoading,
    isSubmitting,
    onSubmit,
    onFieldChange,
    onAddFeature,
    onFeatureChange,
}) => {
    return (
        <form className={styles.formCard} onSubmit={onSubmit}>
            {isLoading && (
                <p className={styles.loadingText}>
                    기획서를 불러오는 중입니다...
                </p>
            )}

            <div className={styles.formSectionHeader}>
                <span>STEP 1</span>
                <h2>기본 정보</h2>
            </div>

            <div className={styles.fieldGrid}>
                <label className={styles.field}>
                    <span>팀명</span>
                    <input
                        type="text"
                        value={projectPlan.teamName}
                        placeholder="예: Gao"
                        onChange={(e) =>
                            onFieldChange("teamName", e.target.value)
                        }
                    />
                </label>

                <label className={styles.field}>
                    <span>서비스명</span>
                    <input
                        type="text"
                        value={projectPlan.serviceName}
                        placeholder="예: CapTeam"
                        onChange={(e) =>
                            onFieldChange("serviceName", e.target.value)
                        }
                    />
                </label>
            </div>

            <div className={styles.formSectionHeader}>
                <span>STEP 2</span>
                <h2>서비스 내용</h2>
            </div>

            <label className={styles.field}>
                <span>서비스 소개</span>
                <textarea
                    value={projectPlan.serviceSummary}
                    placeholder="예: CapTeam은 캡스톤 프로젝트 팀 구성과 운영을 한곳에서 관리할 수 있는 서비스입니다.
학생 설문을 기반으로 팀을 생성하고, 캡스톤 운영 및 관리 기능을 이용할 수 있습니다."
                    onChange={(e) =>
                        onFieldChange("serviceSummary", e.target.value)
                    }
                />
                <small>
                    서비스의 목적, 해결하려는 문제, 핵심 흐름을 간단히
                    작성해주세요.
                </small>
            </label>

            <div className={styles.field}>
                <div className={styles.featureHeader}>
                    <span>주요 기능</span>
                    <button
                        type="button"
                        className={styles.addFeatureButton}
                        onClick={onAddFeature}
                    >
                        주요 기능 추가
                    </button>
                </div>

                <div className={styles.featureList}>
                    {projectPlan.coreFeatures.map((feature) => (
                        <input
                            key={feature.id}
                            value={feature.value}
                            placeholder="예: 팀 생성 기능 - 학년을 선택하면 분석된 학생 정보를 기반으로 추천 팀이 생성됩니다."
                            onChange={(e) =>
                                onFeatureChange(feature.id, e.target.value)
                            }
                        />
                    ))}
                </div>

                <small>
                    기능명과 설명을 함께 작성하면 팀 관리 화면에서 더 명확하게
                    확인할 수 있습니다.
                </small>
            </div>

            {error && <p className={styles.errorMessage}>{error}</p>}

            <button
                type="submit"
                className={styles.submitButton}
                disabled={isLoading || isSubmitting}
            >
                {isSubmitting ? "저장 중..." : hasSavedPlan ? "수정 저장" : "저장"}
            </button>
        </form>
    );
};

export default UserPlanForm;
