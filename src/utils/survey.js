// 카테고리별로 묶여 있는 설문 질문들을
// 화면에서 map으로 돌리기 쉬운 "하나의 질문 배열"로 펼쳐주는 함수
export const flattenQuestions = (groups, type) => {
    return groups.flatMap((group) =>
        // group.questions는 한 카테고리 안에 들어있는 질문 배열
        group.questions.map((question, index) => ({
            // 질문마다 겹치지 않는 고유 id를 만들어줌
            // 예: personality-communication-1
            id: `${type}-${group.key}-${index + 1}`,

            // 점수 평균을 낼 때 사용할 카테고리 값
            // 예: communication, responsibility
            category: group.key,

            // 화면에 보여줄 카테고리 이름
            // 예: 소통, 책임감
            categoryLabel: group.label,

            // 실제 설문 질문 문장
            question,
        }))
    );
};

// 설문 답변 점수를 카테고리별 평균 점수로 바꿔주는 함수
// 예: communication 질문 2개가 4점, 5점이면 communication: 4.5 로 변환
export const calculateAverageScores = (groups, answers, type) => {
    // groups 배열을 돌면서 최종적으로 평균 점수 객체 하나를 만든다
    // 처음 시작값은 아래쪽의 빈 객체 {}
    return groups.reduce((scores, group) => {
        // 현재 카테고리에 들어있는 질문들의 id를 만든다
        // 예: personality-communication-1
        // 예: personality-communication-2
        const questionIds = group.questions.map(
            // _는 질문 문장 값이 필요 없다는 뜻
            // 여기서는 index만 필요해서 첫 번째 값을 _로 둔다
            (_, index) => `${type}-${group.key}-${index + 1}`
        );

        // 위에서 만든 질문 id들을 이용해서 answers 객체에서 점수를 꺼내 모두 더한다
        const total = questionIds.reduce(
            (sum, questionId) =>
                // answers[questionId]는 사용자가 선택한 점수
                // input 값은 문자열일 수 있어서 Number로 숫자 변환
                sum + Number(answers[questionId]),
            // sum의 시작값
            0
        );

        // 기존 scores 객체를 유지하면서,
        // 현재 카테고리의 평균 점수를 새로 추가한다
        return {
            ...scores,

            // group.key를 객체의 key로 사용한다
            // 예: communication: 4.5
            [group.key]: total / questionIds.length,
        };
    }, {});
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
