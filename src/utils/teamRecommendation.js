import { roleLabels, roleOrder, summaryRoleOrder } from "../constants/team";

export const getSortedMembers = (members = []) => {
    return [...members].sort((a, b) => {
        if (a.recommendedLeader !== b.recommendedLeader) {
            return a.recommendedLeader ? -1 : 1;
        }

        const roleA = roleOrder[a.studentRole] || 99;
        const roleB = roleOrder[b.studentRole] || 99;

        if (roleA !== roleB) return roleA - roleB;

        return a.name.localeCompare(b.name, "ko");
    });
};

export const normalizeRecommendations = (recommendations = []) => {
    return recommendations.map((team) => ({
        ...team,
        members: getSortedMembers(team.members),
    }));
};

export const swapMembersInTeams = (teams, firstSelected, secondSelected) => {
    const nextTeams = teams.map((team) => ({
        ...team,
        members: team.members.map((member) => ({ ...member })),
    }));

    const firstTeamIndex = nextTeams.findIndex(
        (team) => team.id === firstSelected.recommendationId
    );
    const secondTeamIndex = nextTeams.findIndex(
        (team) => team.id === secondSelected.recommendationId
    );

    if (firstTeamIndex === -1 || secondTeamIndex === -1) return nextTeams;

    const firstMemberIndex = nextTeams[firstTeamIndex].members.findIndex(
        (member) => member.userId === firstSelected.userId
    );
    const secondMemberIndex = nextTeams[secondTeamIndex].members.findIndex(
        (member) => member.userId === secondSelected.userId
    );

    if (firstMemberIndex === -1 || secondMemberIndex === -1) return nextTeams;

    const firstMember = nextTeams[firstTeamIndex].members[firstMemberIndex];
    const secondMember = nextTeams[secondTeamIndex].members[secondMemberIndex];

    nextTeams[firstTeamIndex].members[firstMemberIndex] = secondMember;
    nextTeams[secondTeamIndex].members[secondMemberIndex] = firstMember;

    return nextTeams;
};

export const getRoleSummary = (members = []) => {
    const counts = members.reduce((acc, member) => {
        if (!member.studentRole) return acc;
        acc[member.studentRole] = (acc[member.studentRole] || 0) + 1;
        return acc;
    }, {});

    return summaryRoleOrder
        .filter((role) => counts[role])
        .map((role) => `${roleLabels[role] || role} : ${counts[role]}명`)
        .join(" / ");
};
