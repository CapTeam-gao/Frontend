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
        key: "ideaPlanning",
        label: "아이디어/기획",
        questions: [
            {
                text: "나는 주제가 주어지면 빠르게 서비스 아이디어를 떠올리는 편이다.",
                reverse: false,
            },
            {
                text: "나는 해커톤에서 필요한 핵심 기능을 빠르게 정리할 수 있다.",
                reverse: false,
            },
            {
                text: "나는 아이디어가 많아도 실제로 만들 기능을 고르는 데 시간이 오래 걸린다.",
                reverse: true,
            },
        ],
    },
    {
        key: "communication",
        label: "협업/소통",
        questions: [
            {
                text: "나는 팀원에게 내 작업 진행 상황을 자주 공유하는 편이다.",
                reverse: false,
            },
            {
                text: "나는 막히는 부분이 있으면 혼자 오래 끌지 않고 팀원에게 알린다.",
                reverse: false,
            },
            {
                text: "나는 작업 상황을 굳이 말하지 않아도 팀원이 알아서 이해할 거라고 생각한다.",
                reverse: true,
            },
        ],
    },
    {
        key: "roleFlexibility",
        label: "역할 유연성",
        questions: [
            {
                text: "나는 내 역할이 아니어도 팀에 필요한 일이면 도울 수 있다.",
                reverse: false,
            },
            {
                text: "나는 상황에 따라 기획, 디자인, 발표 준비도 함께 맡을 수 있다.",
                reverse: false,
            },
            {
                text: "나는 내가 맡은 역할 밖의 일은 최대한 하지 않는 편이다.",
                reverse: true,
            },
        ],
    },
    {
        key: "timePressure",
        label: "시간 압박 대응",
        questions: [
            {
                text: "나는 시간이 부족할 때 먼저 해야 할 일을 빠르게 고를 수 있다.",
                reverse: false,
            },
            {
                text: "나는 마감이 가까워져도 제출 가능한 상태를 만드는 데 집중한다.",
                reverse: false,
            },
            {
                text: "나는 시간이 부족해지면 무엇부터 해야 할지 정하지 못하고 흔들리는 편이다.",
                reverse: true,
            },
        ],
    },
    {
        key: "staminaFocus",
        label: "체력/집중 유지",
        questions: [
            {
                text: "나는 긴 시간 동안 한 가지 작업에 집중하는 편이다.",
                reverse: false,
            },
            {
                text: "나는 피곤해도 맡은 일을 제출 가능한 수준까지 마무리하려고 한다.",
                reverse: false,
            },
            {
                text: "나는 밤이나 새벽 시간에는 집중력이 크게 떨어지는 편이다.",
                reverse: true,
            },
        ],
    },
];

export const developmentGroups = [
    {
        key: "implementation",
        label: "개발 실행력",
        questions: [
            {
                text: "나는 계획이 정해지면 바로 코드나 화면 구현을 시작하는 편이다.",
                reverse: false,
            },
            {
                text: "나는 시간이 부족하면 핵심 기능부터 먼저 구현한다.",
                reverse: false,
            },
            {
                text: "나는 구현을 시작하기 전에 모든 계획이 완벽히 정해져야 움직이는 편이다.",
                reverse: true,
            },
        ],
    },
    {
        key: "problemSolving",
        label: "문제 해결력",
        questions: [
            {
                text: "나는 오류가 생기면 당황하기보다 원인을 찾아보는 편이다.",
                reverse: false,
            },
            {
                text: "나는 막히는 문제가 생기면 검색, 로그 확인, 질문으로 해결하려 한다.",
                reverse: false,
            },
            {
                text: "나는 오류가 생기면 일단 다른 사람이 해결해주길 기다리는 편이다.",
                reverse: true,
            },
        ],
    },
    {
        key: "completionQuality",
        label: "완성도 추구",
        questions: [
            {
                text: "나는 기능뿐 아니라 사용자가 보는 화면의 완성도도 신경 쓴다.",
                reverse: false,
            },
            {
                text: "나는 제출 전에 오류나 어색한 화면 흐름을 점검하는 편이다.",
                reverse: false,
            },
            {
                text: "나는 기능이 대충 돌아가면 화면이나 마무리 상태는 크게 신경 쓰지 않는다.",
                reverse: true,
            },
        ],
    },
    {
        key: "presentation",
        label: "발표/설명",
        questions: [
            {
                text: "나는 우리가 만든 서비스의 목적과 핵심 기능을 쉽게 설명할 수 있다.",
                reverse: false,
            },
            {
                text: "나는 발표 자료나 시연 흐름을 정리하는 데 도움을 줄 수 있다.",
                reverse: false,
            },
            {
                text: "나는 사람들 앞에서 결과물을 설명하는 일이 많이 부담스럽다.",
                reverse: true,
            },
        ],
    },
    {
        key: "leadership",
        label: "리더십/정리",
        questions: [
            {
                text: "나는 팀에서 해야 할 일을 정리하고 역할을 나누는 데 도움을 줄 수 있다.",
                reverse: false,
            },
            {
                text: "나는 의견이 많을 때 기준을 잡고 결정을 돕는 편이다.",
                reverse: false,
            },
            {
                text: "나는 팀의 방향이 흔들려도 누군가 정리해줄 때까지 기다리는 편이다.",
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
