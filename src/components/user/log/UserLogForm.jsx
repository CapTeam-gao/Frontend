import styles from "./UserLogForm.module.css";

const leaderFields = [
    {
        name: "activityContent",
        label: "활동 내용",
        placeholder: "오늘 내가 맡아서 진행한 작업을 구체적으로 작성해주세요.",
    },
    {
        name: "todayActivityContent",
        label: "오늘 방과후 프로젝트 진행 상황",
        placeholder: "오늘 팀 전체가 진행한 내용을 자세히 작성해주세요.",
    },
    {
        name: "nextPlanContent",
        label: "다음 캡스톤 시간까지 진행할 내용",
        placeholder:
            "다음 캡스톤 시간 전까지 진행할 작업을 자세히 작성해주세요.",
    },
    {
        name: "reflectionContent",
        label: "오늘 프로젝트 수행 만족도 및 자기 반성",
        placeholder:
            "오늘 작업에서 잘된 점, 부족했던 점, 다음에 개선할 점을 작성해주세요.",
    },
];

const memberFields = leaderFields.filter(
    (field) => field.name !== "todayActivityContent"
);

const UserLogForm = ({
    formData,
    isLeader,
    isSubmitting = false,
    isCompleted = false,
    submitText = "작성 완료",
    successMessage = "",
    error,
    onFieldChange,
    onSubmit,
}) => {
    const fields = isLeader ? leaderFields : memberFields;

    return (
        <form className={styles.form} onSubmit={onSubmit}>
            <div className={styles.fieldList}>
                {fields.map((field) => (
                    <label key={field.name} className={styles.field}>
                        <span>{field.label}</span>
                        <textarea
                            value={formData[field.name] ?? ""}
                            placeholder={field.placeholder}
                            onChange={(e) =>
                                onFieldChange(field.name, e.target.value)
                            }
                        />
                    </label>
                ))}
            </div>

            <div className={styles.submitArea}>
                {isCompleted && (
                    <p className={styles.errorText}>
                        팀원 전체 제출이 완료되어 수정할 수 없습니다.
                    </p>
                )}
                {successMessage && (
                    <p className={styles.successText}>{successMessage}</p>
                )}
                {error && <p className={styles.errorText}>{error}</p>}
                <button type="submit" disabled={isSubmitting || isCompleted}>
                    {isSubmitting ? "저장 중..." : submitText}
                </button>
            </div>
        </form>
    );
};

export default UserLogForm;
