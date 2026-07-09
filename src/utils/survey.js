// 카테고리별로 묶여 있는 설문 질문들을
// 화면에서 map으로 돌리기 쉬운 "하나의 질문 배열"로 펼쳐주는 함수
export const flattenQuestions = (groups, type) => {
    return groups.flatMap((group) =>
        // group.questions는 한 카테고리 안에 들어있는 질문 배열
        group.questions.map((question, index) => ({
            // 질문마다 겹치지 않는 고유 id를 만들어줌
            // 예: personality-ideaPlanning-1
            id: `${type}-${group.key}-${index + 1}`,

            // 점수 평균을 낼 때 사용할 카테고리 값
            // 예: ideaPlanning, communication
            category: group.key,

            // 화면에 보여줄 카테고리 이름
            // 예: 소통, 책임감
            categoryLabel: group.label,

            // 실제 설문 질문 문장
            question,
        }))
    );
};

export const getAnswerScores = (questions, answers) => {
    return questions.map((question) => Number(answers[question.id]));
};

export const getSkillsFromText = (stackText) => {
    return stackText
        .split(/[,/]+/)
        .map((skill) => skill.trim())
        .filter(Boolean);
};

// 역문항 점수 계산 함수
export const getAdjustedScore = (score, isReverse) => {
    return isReverse ? 6 - score : score;
};

export const calculateAverageScores = (groups, answers, type) => {
    return groups.reduce((scoreResult, group) => {
        const questionScores = group.questions.map((question, index) => {
            const questionId = `${type}-${group.key}-${index + 1}`;
            const rawScore = Number(answers[questionId]);

            return getAdjustedScore(rawScore, question.reverse);
        });

        const totalScore = questionScores.reduce(
            (sum, score) => sum + score,
            0
        );

        return {
            ...scoreResult,
            [group.key]: totalScore / questionScores.length,
        };
    }, {});
};
export const calculateInconsistentAnswers = (groups, answers, type) => {
    return groups.reduce((inconsistentCount, group) => {
        const questionScores = group.questions.map((question, index) => {
            const questionId = `${type}-${group.key}-${index + 1}`;
            const rawScore = Number(answers[questionId]);

            return getAdjustedScore(rawScore, question.reverse);
        });

        const highestScore = Math.max(...questionScores);
        const lowestScore = Math.min(...questionScores);
        const scoreGap = highestScore - lowestScore;

        return scoreGap >= 3 ? inconsistentCount + 1 : inconsistentCount;
    }, 0);
};

export const getReliabilityLevel = (inconsistentCount) => {
    if (inconsistentCount === 0) return "HIGH";
    if (inconsistentCount <= 2) return "MEDIUM";

    return "LOW";
};

export const isSurveyCompleted = (surveyCompleted) => {
    if (surveyCompleted === true || surveyCompleted === 1) return true;
    if (typeof surveyCompleted !== "string") return false;

    const normalizedValue = surveyCompleted.trim().toLowerCase();

    return ["true", "1", "y", "yes", "complete", "completed"].includes(
        normalizedValue
    );
};
