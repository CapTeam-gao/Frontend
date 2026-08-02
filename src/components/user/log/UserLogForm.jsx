import styles from "./UserLogForm.module.css";
import { getFilledFieldCount, getLogFields } from "../../../utils/log";

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
    const fields = getLogFields(isLeader);
    const filledCount = getFilledFieldCount(formData, fields);
    const isAllFilled = filledCount === fields.length;
    const statusText = isAllFilled
        ? "모든 항목이 작성되었습니다. 제출 전 내용을 한 번만 확인해주세요."
        : `${fields.length}개 항목을 모두 작성하면 제출할 수 있습니다. (${filledCount}/${fields.length})`;

    return (
        <form className={styles.form} onSubmit={onSubmit}>
            <div className={styles.fieldList}>
                {fields.map((field, index) => (
                    <div key={field.name} className={styles.field}>
                        <div className={styles.fieldTitle}>
                            <span className={styles.fieldIndex}>
                                {String(index + 1).padStart(2, "0")}
                            </span>
                            {field.label}
                        </div>
                        <p className={styles.fieldDesc}>{field.desc}</p>
                        <textarea
                            value={formData[field.name] ?? ""}
                            placeholder={field.placeholder}
                            onChange={(e) =>
                                onFieldChange(field.name, e.target.value)
                            }
                        />
                    </div>
                ))}
            </div>

            <div className={styles.submitArea}>
                {isCompleted ? (
                    <p className={styles.errorText}>
                        팀원 전체 제출이 완료되어 수정할 수 없습니다.
                    </p>
                ) : error ? (
                    <p className={styles.errorText}>{error}</p>
                ) : successMessage ? (
                    <p className={styles.successText}>{successMessage}</p>
                ) : (
                    <p
                        className={`${styles.statusText} ${
                            isAllFilled ? styles.statusTextOk : ""
                        }`}
                    >
                        {statusText}
                    </p>
                )}
                <button type="submit" disabled={isSubmitting || isCompleted}>
                    {isSubmitting ? "저장 중..." : submitText}
                </button>
            </div>
        </form>
    );
};

export default UserLogForm;
