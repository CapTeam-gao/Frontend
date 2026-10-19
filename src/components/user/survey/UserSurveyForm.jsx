import { forwardRef } from "react";
import styles from "./UserSurveyForm.module.css";

export const RatingRow = forwardRef(function RatingRow(
    { number, question, value, onChange },
    ref
) {
    return (
        <li ref={ref} className={styles.questionItem}>
            <p id={`survey-question-${number}`} className={styles.questionText}>
                <b>{number}.</b> {question.text}
            </p>

            <div className={styles.scaleArea}>
                <div
                    className={styles.scaleGroup}
                    role="radiogroup"
                    aria-labelledby={`survey-question-${number}`}
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
                <div className={styles.scaleLabels}>
                    <span>전혀 그렇지 않다</span>
                    <span>매우 그렇다</span>
                </div>
            </div>
        </li>
    );
});
