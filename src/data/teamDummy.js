const positions = ["프론트엔드", "백엔드", "AI", "프론트엔드", "백엔드"];
const stacks = ["React", "Spring", "Python", "React", "Java"];
const names = [
    ["허재원", "박진욱", "양원우", "김성현", "유채민"],
    ["김지훈", "이서연", "최민준", "정다은", "박도윤"],
    ["한서준", "오하린", "강민재", "문지우", "윤서아"],
    ["장우진", "신유나", "임도현", "서지민", "권민서"],
    ["백지호", "남수빈", "조현우", "홍예린", "류지안"],
    ["고태윤", "차은서", "배준영", "하나린", "송민규"],
    ["유시온", "전하늘", "마서윤", "노지후", "안도겸"],
    ["심가온", "구연우", "민채원", "도윤재", "설아린"],
    ["나현준", "표유진", "은서호", "라민재", "채이안"],
];

const reasons = [
    {
        title: "직군별 역할 균형이 안정적임",
        text: "프론트엔드, 백엔드, AI 희망 학생이 고르게 배치되어 구현 역할이 한쪽으로 몰리지 않습니다.",
    },
    {
        title: "팀장 희망자와 보조형 학생 조합",
        text: "리더십이 있는 학생과 문서 정리, 구현 보조에 강한 학생이 함께 배치되어 협업 흐름이 안정적입니다.",
    },
    {
        title: "기술 스택 중복을 줄인 조합",
        text: "React, Spring, Python 등 주요 구현 영역이 분산되어 기능 개발을 병렬로 진행하기 좋습니다.",
    },
];

export const initialTeams = names.map((teamNames, teamIndex) => ({
    id: teamIndex + 1,
    name: `${teamIndex + 1}팀`,
    summary: "프론트엔드 : 2명 / 백엔드 : 2명 / AI : 1명",
    reasons,
    members: teamNames.map((name, memberIndex) => ({
        id: `${teamIndex + 1}-${memberIndex + 1}`,
        number: `23${teamIndex + 1}${memberIndex + 1}`,
        name,
        position: positions[memberIndex],
        stack: stacks[memberIndex],
        leader: memberIndex === 0,
    })),
}));

export const cloneTeams = () =>
    initialTeams.map((team) => ({
        ...team,
        reasons: team.reasons.map((reason) => ({ ...reason })),
        members: team.members.map((member) => ({ ...member })),
    }));
