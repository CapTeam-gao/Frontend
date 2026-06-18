import styles from "./UserSurveyForm.module.css";

export const RatingRow = ({
    number,
    question,
    categoryLabel,
    value,
    onChange,
}) => {
    return (
        <li className={styles.questionItem}>
            <p className={styles.questionText}>
                {number}. {question.text}
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
