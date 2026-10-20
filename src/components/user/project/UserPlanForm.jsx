// 기획서 작성 항목. 섹션을 다 채우면 번호 원이 초록 체크로 바뀐다.
// 저장 버튼은 페이지 오른쪽 상태 카드가 갖고, form id로 이 폼을 제출한다.
import Skeleton from "../../common/skeleton/Skeleton";
import styles from "./UserPlanForm.module.css";

export const PROJECT_PLAN_FORM_ID = "project-plan-form";

const CheckIcon = () => (
    <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="m5 12 5 5 9-10" />
    </svg>
);

const SectionHead = ({ index, title, desc, done }) => (
    <div className={`${styles.sectionHead} ${done ? styles.sectionDone : ""}`}>
        <span className={styles.sectionIndex} aria-hidden="true">
            {done ? <CheckIcon /> : index}
        </span>
        <div>
            <h2 className={styles.sectionTitle}>{title}</h2>
            <p className={styles.sectionDesc}>{desc}</p>
        </div>
    </div>
);

const UserPlanForm = ({
    projectPlan,
    sections,
    isLoading,
    onSubmit,
    onFieldChange,
    onAddFeature,
    onFeatureChange,
    onRemoveFeature,
}) => {
    if (isLoading) {
        return (
            <div className={styles.form}>
                <Skeleton width={160} height={28} />
                <Skeleton height={56} style={{ marginTop: 20 }} />
                <Skeleton height={160} style={{ marginTop: 48 }} />
                <Skeleton height={56} style={{ marginTop: 48 }} />
            </div>
        );
    }

    const [basic, intro, features] = sections;

    return (
        <form id={PROJECT_PLAN_FORM_ID} className={styles.form} onSubmit={onSubmit}>
            <section id={basic.id} className={styles.planSection}>
                <SectionHead
                    index={1}
                    title={basic.label}
                    desc="관리자 팀 관리 화면에 이 이름으로 보여요."
                    done={basic.done}
                />

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

            <section id={intro.id} className={styles.planSection}>
                <SectionHead
                    index={2}
                    title={intro.label}
                    desc="서비스의 목적, 해결하려는 문제, 사용 흐름을 간단히 작성해주세요."
                    done={intro.done}
                />

                <label className={`${styles.field} ${styles.fieldIndent}`}>
                    <span className={styles.srOnly}>서비스 소개</span>
                    <div className={styles.textareaWrap}>
                        <textarea
                            value={projectPlan.serviceSummary}
                            placeholder={"예: CapTeam은 캡스톤 프로젝트 팀 구성과 운영을 한곳에서 관리할 수 있는 서비스입니다.\n학생 설문을 기반으로 팀을 생성하고, 캡스톤 운영 및 관리 기능을 이용할 수 있습니다."}
                            onChange={(e) =>
                                onFieldChange("serviceSummary", e.target.value)
                            }
                        />
                        <span className={styles.charCount} aria-hidden="true">
                            {projectPlan.serviceSummary.length}자
                        </span>
                    </div>
                </label>
            </section>

            <section id={features.id} className={styles.planSection}>
                <SectionHead
                    index={3}
                    title={features.label}
                    desc="기능명과 기능이 하는 일을 함께 적으면 기획 의도가 더 분명해져요."
                    done={features.done}
                />

                <div className={`${styles.featureList} ${styles.fieldIndent}`}>
                    {projectPlan.coreFeatures.map((feature, index) => (
                        <div key={feature.id} className={styles.featureRow}>
                            <span
                                className={styles.featureIndex}
                                aria-hidden="true"
                            >
                                {index + 1}
                            </span>
                            <input
                                value={feature.value}
                                aria-label={`주요 기능 ${index + 1}`}
                                placeholder="예: 팀 생성 기능 - 학생 설문을 바탕으로 추천 팀을 생성합니다."
                                onChange={(e) =>
                                    onFeatureChange(feature.id, e.target.value)
                                }
                            />
                            {projectPlan.coreFeatures.length > 1 && (
                                <button
                                    type="button"
                                    className={styles.removeFeature}
                                    aria-label={`주요 기능 ${index + 1} 삭제`}
                                    onClick={() => onRemoveFeature(feature.id)}
                                >
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        aria-hidden="true"
                                    >
                                        <path d="m6 6 12 12M18 6 6 18" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    ))}

                    <button
                        type="button"
                        className={styles.addFeatureButton}
                        onClick={onAddFeature}
                    >
                        + 기능 추가
                    </button>
                </div>
            </section>
        </form>
    );
};

export default UserPlanForm;
