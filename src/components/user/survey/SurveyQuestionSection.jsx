import { RatingRow } from "./UserSurveyForm";

const SurveyQuestionSection = ({
    styles,
    step,
    title,
    description,
    questions,
    startNumber,
    answers,
    onChangeAnswer,
}) => {
    return (
        <section className={styles.card}>
            <div className={styles.cardHeader}>
                <span>{step}</span>
                <h2>{title}</h2>
                {description && <p>{description}</p>}
            </div>

            <ul className={styles.questionList}>
                {questions.map((question, index) => {
                    const questionNumber = startNumber + index;

                    return (
                        <RatingRow
                            key={question.id}
                            number={questionNumber}
                            question={question.question}
                            categoryLabel={question.categoryLabel}
                            value={answers[question.id]}
                            onChange={(score) =>
                                onChangeAnswer(question.id, score)
                            }
                        />
                    );
                })}
            </ul>
        </section>
    );
};

export default SurveyQuestionSection;
