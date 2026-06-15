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
            "나는 작업 중 막히는 부분이 있으면 팀원에게 상황을 공유하는 편이다.",
            "나는 팀원의 의견이 내 생각과 달라도 먼저 들어보려고 한다.",
        ],
    },
    {
        key: "responsibility",
        label: "책임감",
        questions: [
            "나는 맡은 일을 정해진 시간 안에 끝내려고 노력하는 편이다.",
            "나는 내가 맡은 일이 늦어질 것 같으면 미리 팀원에게 알린다.",
        ],
    },
    {
        key: "collaboration",
        label: "협업 선호도",
        questions: [
            "나는 혼자 작업하는 것보다 팀원과 역할을 나눠 작업하는 것이 편하다.",
            "나는 팀원이 어려움을 겪고 있으면 내 일이 아니어도 도와주려는 편이다.",
        ],
    },
    {
        key: "flexibility",
        label: "유연성",
        questions: [
            "나는 프로젝트 도중 역할이나 계획이 바뀌어도 적응하려고 노력한다.",
            "나는 내 작업물에 대한 피드백을 받으면 수정 방향을 고민해본다.",
        ],
    },
    {
        key: "emotionalStability",
        label: "감정 안정성",
        questions: [
            "나는 프로젝트 중 의견 충돌이 생겨도 감정적으로 대응하지 않으려고 한다.",
            "나는 일정이 바빠져도 차분하게 우선순위를 정하려고 한다.",
        ],
    },
];

export const developmentGroups = [
    {
        key: "leadership",
        label: "리더십",
        questions: [
            "나는 팀 프로젝트에서 필요한 일을 먼저 정리하고 역할을 나누는 편이다.",
            "나는 팀이 방향을 잃었을 때 먼저 의견을 내고 정리하려고 한다.",
        ],
    },
    {
        key: "problemSolving",
        label: "문제 해결력",
        questions: [
            "나는 오류가 생기면 바로 포기하기보다 원인을 찾아보는 편이다.",
            "나는 모르는 기능이 있어도 검색이나 문서를 보며 해결해보려고 한다.",
        ],
    },
    {
        key: "implementation",
        label: "구현 실행력",
        questions: [
            "나는 정해진 기능을 실제 코드로 구현해보는 과정에 자신이 있다.",
            "나는 작은 기능이라도 완성해서 화면에 보이게 만드는 것을 중요하게 생각한다.",
        ],
    },
    {
        key: "learningAbility",
        label: "학습 성장성",
        questions: [
            "나는 프로젝트에 필요한 기술이라면 처음 접해도 배우려고 한다.",
            "나는 내가 부족한 부분을 알게 되면 따로 공부해서 보완하려고 한다.",
        ],
    },
    {
        key: "planning",
        label: "기획 정리력",
        questions: [
            "나는 기능을 만들기 전에 필요한 화면 흐름이나 데이터를 먼저 정리하는 편이다.",
            "나는 프로젝트 내용을 문서나 발표 자료로 정리하는 것에 부담이 적다.",
        ],
    },
];

export const roleToStudentRole = {
    프론트엔드: "FRONTEND",
    백엔드: "BACKEND",
    DevOps: "BACKEND",
    디자인: "DESIGN",
    AI: "AI",
    "앱 개발": "APP",
    게임개발: "APP",
    보안: "BACKEND",
    풀스택: "BACKEND",
};
