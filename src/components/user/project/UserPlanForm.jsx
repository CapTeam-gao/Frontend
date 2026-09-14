import Skeleton from "../../common/skeleton/Skeleton";
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
    onRemoveFeature,
}) => {
    if (isLoading) {
        return (
            <div className={styles.form}>
                <Skeleton width={96} height={24} style={{ marginTop: 40 }} />
                <Skeleton height={56} style={{ marginTop: 16 }} />
                <Skeleton height={56} style={{ marginTop: 12 }} />
                <Skeleton height={160} style={{ marginTop: 40 }} />
            </div>
        );
    }

    return (
        <form className={styles.form} onSubmit={onSubmit}>
            <section id="project-basic" className={styles.planSection}>
                <div className={styles.sectionHead}>
                    <h2 className={styles.sectionTitle}>기본 정보</h2>
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
            </section>

            <section id="project-intro" className={styles.planSection}>
                <div className={styles.sectionHead}>
                    <h2 className={styles.sectionTitle}>서비스 소개</h2>
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
                        서비스의 목적, 해결하려는 문제, 사용 흐름을 간단히
                        작성해주세요.
                    </small>
                </label>
            </section>

            <section id="project-features" className={styles.planSection}>
                <div className={styles.sectionHead}>
                    <h2 className={styles.sectionTitle}>주요 기능</h2>
                </div>

                <div className={styles.field}>
                    <div className={styles.featureHeader}>
                        <span>기능 목록</span>
                        <button
                            type="button"
                            className={styles.addFeatureButton}
                            onClick={onAddFeature}
                        >
                            기능 추가
                        </button>
                    </div>

                    <div className={styles.featureList}>
                        {projectPlan.coreFeatures.map((feature) => (
                            <div key={feature.id} className={styles.featureRow}>
                                <input
                                    value={feature.value}
                                    placeholder="예: 팀 생성 기능 - 학생 설문을 바탕으로 추천 팀을 생성합니다."
                                    onChange={(e) =>
                                        onFeatureChange(feature.id, e.target.value)
                                    }
                                />
                                {projectPlan.coreFeatures.length > 1 && (
                                    <button
                                        type="button"
                                        className={styles.removeFeature}
                                        onClick={() => onRemoveFeature(feature.id)}
                                    >
                                        삭제
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <small>
                        기능명과 기능이 하는 일을 함께 적으면 기획 의도가 더
                        분명해집니다.
                    </small>
                </div>
            </section>

            <div className={styles.actions}>
                <p className={error ? styles.errorMessage : styles.actionHint}>
                    {error ||
                        "모든 항목을 채워야 저장할 수 있어요."}
                </p>
                <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isSubmitting}
                >
                    {isSubmitting
                        ? "저장 중..."
                        : hasSavedPlan
                          ? "수정 저장"
                          : "저장"}
                </button>
            </div>
        </form>
    );
};

export default UserPlanForm;
