export const roles = [
    "프론트엔드",
    "백엔드",
    "DevOps",
    "디자인",
    "AI",
    "앱 개발",
    "게임개발",
    "보안",
    "풀스택",
];

export const personalityGroups = [
    {
        key: "communication",
        label: "소통 성향",
        questions: [
            {
                text: "나는 팀원에게 진행 상황을 먼저 공유하는 편이다.",
                reverse: false,
            },
            {
                text: "나는 의견이 다를 때 직접 말로 풀어내려고 한다.",
                reverse: false,
            },
            {
                text: "나는 할 말이 있어도 굳이 먼저 꺼내지 않는다.",
                reverse: true,
            },
        ],
    },
    {
        key: "responsibility",
        label: "책임감",
        questions: [
            {
                text: "나는 맡은 일은 끝까지 마무리한다.",
                reverse: false,
            },
            {
                text: "나는 내가 맡은 부분에 문제가 생기면 먼저 책임지려 한다.",
                reverse: false,
            },
            {
                text: "나는 일이 어려워지면 일단 미루는 편이다.",
                reverse: true,
            },
        ],
    },
    {
        key: "collaboration",
        label: "협업 선호도",
        questions: [
            {
                text: "나는 혼자 하는 것보다 팀으로 일하는 것을 선호한다.",
                reverse: false,
            },
            {
                text: "나는 팀원의 의견이 다르면 맞춰서 조율하려고 한다.",
                reverse: false,
            },
            {
                text: "나는 내 방식대로 진행하는 것을 더 편하게 느낀다.",
                reverse: true,
            },
        ],
    },
    {
        key: "flexibility",
        label: "유연성",
        questions: [
            {
                text: "나는 기존 방식보다 더 나은 방법이 있으면 시도해본다.",
                reverse: false,
            },
            {
                text: "나는 갑작스러운 일정·요구사항 변경에도 잘 적응한다.",
                reverse: false,
            },
            {
                text: "나는 정해진 방식이 바뀌면 불편함을 느낀다.",
                reverse: true,
            },
        ],
    },
    {
        key: "emotionalStability",
        label: "감정 안정성",
        questions: [
            {
                text: "나는 예상치 못한 상황에서도 비교적 차분하게 대응한다.",
                reverse: false,
            },
            {
                text: "나는 압박감이 큰 상황에서도 평정심을 유지한다.",
                reverse: false,
            },
            {
                text: "나는 작은 문제에도 쉽게 스트레스를 받는다.",
                reverse: true,
            },
        ],
    },
];

export const developmentGroups = [
    {
        key: "leadership",
        label: "리더십",
        questions: [
            {
                text: "나는 리더 역할이 주어질 때 부담보다 의욕을 느낀다.",
                reverse: false,
            },
            {
                text: "나는 팀의 방향이 흔들릴 때 먼저 나서서 정리하려 한다.",
                reverse: false,
            },
            {
                text: "나는 결정을 내려야 하는 상황을 피하고 싶어한다.",
                reverse: true,
            },
        ],
    },
    {
        key: "problemSolving",
        label: "문제 해결력",
        questions: [
            {
                text: "나는 문제가 생기면 여러 가지 해결 방법을 떠올려본다.",
                reverse: false,
            },
            {
                text: "나는 복잡한 문제도 구조를 나눠서 차근차근 접근한다.",
                reverse: false,
            },
            {
                text: "나는 문제가 생기면 일단 다른 사람이 해결해주길 기다린다.",
                reverse: true,
            },
        ],
    },
    {
        key: "implementation",
        label: "구현 실행력",
        questions: [
            {
                text: "나는 계획이 정해지면 바로 실행에 옮기는 편이다.",
                reverse: false,
            },
            {
                text: "나는 작업을 시작하면 외부 자극에 쉽게 산만해지지 않는다.",
                reverse: false,
            },
            {
                text: "나는 아이디어는 많지만 실제로 끝까지 만들어내는 일은 적다.",
                reverse: true,
            },
        ],
    },
    {
        key: "learningAbility",
        label: "학습 성장성",
        questions: [
            {
                text: "나는 새로운 기술이나 도구를 배우는 것에 거부감이 없다.",
                reverse: false,
            },
            {
                text: "나는 모르는 분야가 나오면 스스로 찾아서 학습한다.",
                reverse: false,
            },
            {
                text: "나는 익숙한 방식 외에 새로운 것을 배우는 게 부담스럽다.",
                reverse: true,
            },
        ],
    },
    {
        key: "planning",
        label: "기획 정리력",
        questions: [
            {
                text: "나는 일을 시작하기 전에 전체 일정과 순서를 정리한다.",
                reverse: false,
            },
            {
                text: "나는 질서있고 체계적인 상태를 선호한다.",
                reverse: false,
            },
            {
                text: "나는 계획 없이 일단 진행하다가 그때그때 정하는 편이다.",
                reverse: true,
            },
        ],
    },
];

export const roleToStudentRole = {
    프론트엔드: "FRONTEND",
    백엔드: "BACKEND",
    DevOps: "DEVOPS",
    디자인: "DESIGN",
    AI: "AI",
    "앱 개발": "APP",
    게임개발: "GAME",
    보안: "SECURITY",
    풀스택: "FULLSTACK",
};
