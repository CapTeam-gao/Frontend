// 일지 작성 항목. 다 채운 항목은 번호 자리에 초록 체크가 들어간다.
// 제출 버튼은 페이지 오른쪽 상태 카드가 갖는다.
import styles from "./UserLogForm.module.css";
import { getLogFields } from "../../../utils/log";

const UserLogForm = ({ formData, isLeader, isCompleted = false, onFieldChange }) => {
    const fields = getLogFields(isLeader);

    return (
        <div className={styles.fieldList}>
            {fields.map((field, index) => {
                const value = formData[field.name] ?? "";
                const filled = value.trim().length > 0;
                const fieldId = `log-field-${field.name}`;

                return (
                    <div
                        key={field.name}
                        data-reveal
                        className={`${styles.field} ${filled ? styles.filled : ""}`}
                    >
                        <label className={styles.fieldTitle} htmlFor={fieldId}>
                            <span className={styles.fieldIndex} aria-hidden="true">
                                {filled ? (
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
                                ) : (
                                    index + 1
                                )}
                            </span>
                            {field.label}
                        </label>
                        <p className={styles.fieldDesc}>{field.desc}</p>
                        <div className={styles.textareaWrap}>
                            <textarea
                                id={fieldId}
                                className={styles.textarea}
                                value={value}
                                placeholder={field.placeholder}
                                disabled={isCompleted}
                                onChange={(event) =>
                                    onFieldChange(field.name, event.target.value)
                                }
                            />
                            <span className={styles.charCount} aria-hidden="true">
                                {value.length}자
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default UserLogForm;
