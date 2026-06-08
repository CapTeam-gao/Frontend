import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import {
    requestAcceptAllTeamRecommendations,
    requestSwapTeamMembers,
    requestTeamRecommendationsByGrade,
} from "../../api/teamApi";
import styles from "./AdminTeamEdit.module.css";

const roleLabels = {
    FRONTEND: "프론트엔드",
    BACKEND: "백엔드",
    AI: "AI",
    DESIGN: "디자인",
    APP: "앱",
    GAME: "게임",
    DEVOPS: "DevOps",
    SECURITY: "보안",
    FULLSTACK: "풀스택",
};

const gradeLabels = {
    GRADE_2: "2학년",
    GRADE_3: "3학년",
};

const levelLabels = {
    UPPER: "상",
    MIDDLE: "중",
    LOWER: "하",
};

const roleOrder = {
    FRONTEND: 1,
    BACKEND: 2,
    AI: 3,
    DESIGN: 4,
    APP: 5,
    FULLSTACK: 6,
    DEVOPS: 7,
    SECURITY: 8,
    GAME: 9,
};

const summaryRoleOrder = [
    "FRONTEND",
    "BACKEND",
    "AI",
    "DESIGN",
    "APP",
    "FULLSTACK",
    "DEVOPS",
    "SECURITY",
    "GAME",
];

const getSortedMembers = (members = []) => {
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

const normalizeRecommendations = (recommendations = []) => {
    return recommendations.map((team) => ({
        ...team,
        members: getSortedMembers(team.members),
    }));
};

const swapMembersInTeams = (teams, firstSelected, secondSelected) => {
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

const getRoleSummary = (members = []) => {
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

const MemberRow = ({ member, selected, highlighted, onClick }) => {
    const isLeader = member.recommendedLeader;

    return (
        <li
            className={`${styles.memberItem} ${
                selected ? styles.selectedMember : ""
            } ${highlighted ? styles.highlightedMember : ""} ${
                isLeader ? styles.leaderMember : ""
            }`}
        >
            <button
                type="button"
                className={styles.memberButton}
                disabled={isLeader}
                onClick={onClick}
                title={isLeader ? "팀장은 변경할 수 없습니다." : undefined}
            >
                <div className={styles.memberMain}>
                    <strong className={styles.memberName}>{member.name}</strong>
                    {isLeader && (
                        <span className={styles.leaderBadge}>팀장</span>
                    )}
                </div>
                <div className={styles.memberSub}>
                    <span className={styles.positionBadge}>
                        {roleLabels[member.studentRole] || member.studentRole}
                    </span>
                    <span className={styles.stackText}>
                        {member.skill || "스택 미입력"}
                    </span>
                    <span className={styles.levelText}>
                        {levelLabels[member.studentLevel] ||
                            member.studentLevel ||
                            "-"}
                    </span>
                </div>
            </button>
        </li>
    );
};

const TeamCard = ({
    team,
    teamNumber,
    selectedMember,
    highlightedUserIds,
    flipped,
    onMemberClick,
    onHeaderDoubleClick,
}) => {
    return (
        <article className={styles.teamCardShell}>
            <div
                className={`${styles.teamCardInner} ${
                    flipped ? styles.reasonVisible : ""
                }`}
            >
                <div className={styles.teamCardFace}>
                    <header
                        className={styles.teamHeader}
                        onDoubleClick={onHeaderDoubleClick}
                    >
                        <div className={styles.teamHeaderTop}>
                            <div>
                                <h2 className={styles.teamName}>
                                    {teamNumber}팀
                                </h2>
                                <p className={styles.teamSummary}>
                                    총 {team.members.length}명 ·{" "}
                                    {gradeLabels[team.grade] || team.grade}
                                </p>
                            </div>
                            <button
                                type="button"
                                className={styles.reasonButton}
                                onClick={onHeaderDoubleClick}
                            >
                                배정 이유
                            </button>
                        </div>
                        <div className={styles.roleSummary}>
                            <span>{getRoleSummary(team.members)}</span>
                        </div>
                    </header>

                    <ul className={styles.memberList}>
                        {team.members.map((member) => (
                            <MemberRow
                                key={member.userId}
                                member={member}
                                selected={
                                    selectedMember?.recommendationId ===
                                        team.id &&
                                    selectedMember?.userId === member.userId
                                }
                                highlighted={highlightedUserIds.includes(
                                    member.userId
                                )}
                                onClick={() =>
                                    onMemberClick(team.id, member.userId)
                                }
                            />
                        ))}
                    </ul>
                </div>

                <div className={styles.teamCardBack}>
                    <header
                        className={styles.teamHeader}
                        onDoubleClick={onHeaderDoubleClick}
                    >
                        <div className={styles.teamHeaderTop}>
                            <div>
                                <h2 className={styles.teamName}>
                                    {teamNumber}팀
                                </h2>
                                <p className={styles.teamSummary}>
                                    총 {team.members.length}명 ·{" "}
                                    {gradeLabels[team.grade] || team.grade}
                                </p>
                            </div>
                            <button
                                type="button"
                                className={styles.reasonButton}
                                onClick={onHeaderDoubleClick}
                            >
                                팀원 보기
                            </button>
                        </div>
                        <div className={styles.roleSummary}>
                            <span>{getRoleSummary(team.members)}</span>
                        </div>
                    </header>

                    <div className={styles.reasonArea}>
                        <h3 className={styles.reasonTitle}>팀 배정 이유</h3>
                        <div className={styles.reasonList}>
                            {(team.reasons || []).map((reason) => (
                                <section
                                    key={`${team.id}-${reason.title}`}
                                    className={styles.reasonBox}
                                >
                                    <strong>{reason.title}</strong>
                                    <p>{reason.description}</p>
                                </section>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
};

const AdminTeamEdit = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const grade = location.state?.grade || "GRADE_2";
    const [teams, setTeams] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [highlightedUserIds, setHighlightedUserIds] = useState([]);
    const [flippedTeamIds, setFlippedTeamIds] = useState([]);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const highlightTimerRef = useRef(null);

    const selectedMemberName = useMemo(() => {
        if (!selectedMember) return "";

        return teams
            .find((team) => team.id === selectedMember.recommendationId)
            ?.members.find((member) => member.userId === selectedMember.userId)
            ?.name;
    }, [selectedMember, teams]);

    const getRecommendations = async (targetGrade = grade) => {
        try {
            setIsLoading(true);
            setError("");

            const data = await requestTeamRecommendationsByGrade(targetGrade);
            setTeams(Array.isArray(data) ? normalizeRecommendations(data) : []);
        } catch {
            setError("팀 추천안을 불러오지 못했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getRecommendations(grade);
    }, []);

    useEffect(() => {
        return () => {
            if (highlightTimerRef.current) {
                clearTimeout(highlightTimerRef.current);
            }
        };
    }, []);

    const handleMemberClick = async (recommendationId, userId) => {
        const clickedMember = teams
            .find((team) => team.id === recommendationId)
            ?.members.find((member) => member.userId === userId);

        if (clickedMember?.recommendedLeader) {
            setMessage("팀장은 변경할 수 없습니다.");
            return;
        }

        const nextSelected = { recommendationId, userId };

        if (!selectedMember) {
            setSelectedMember(nextSelected);
            setMessage("변경할 다른 학생을 선택해주세요.");
            return;
        }

        if (
            selectedMember.recommendationId === recommendationId &&
            selectedMember.userId === userId
        ) {
            setSelectedMember(null);
            setMessage("선택이 취소되었습니다.");
            return;
        }

        try {
            await requestSwapTeamMembers(
                selectedMember.recommendationId,
                selectedMember.userId,
                recommendationId,
                userId
            );
            setTeams((prevTeams) =>
                swapMembersInTeams(prevTeams, selectedMember, nextSelected)
            );
            setSelectedMember(null);
            setHighlightedUserIds([selectedMember.userId, userId]);
            if (highlightTimerRef.current) {
                clearTimeout(highlightTimerRef.current);
            }
            highlightTimerRef.current = setTimeout(() => {
                setHighlightedUserIds([]);
            }, 1000);
            setMessage("두 학생의 팀 위치가 변경되었습니다.");
        } catch {
            setMessage("학생 교환에 실패했습니다.");
        }
    };

    const handleHeaderDoubleClick = (teamId) => {
        setFlippedTeamIds((prevIds) => {
            if (prevIds.includes(teamId)) {
                return prevIds.filter((id) => id !== teamId);
            }

            return [...prevIds, teamId];
        });
    };

    const handleRegenerate = () => {
        navigate("/admin/team-create/loading", {
            state: {
                grade,
            },
        });
    };

    const handleApprove = async () => {
        try {
            await requestAcceptAllTeamRecommendations(grade);
            navigate("/admin/team-manage");
        } catch {
            setMessage("팀 구성 승인에 실패했습니다.");
        }
    };

    return (
        <div className={styles.page}>
            <Header />

            <section className={styles.panel}>
                <main className={styles.content}>
                    <Link to="/admin/team-create" className={styles.backLink}>
                        ← 처음으로
                    </Link>
                    <div className={styles.titleArea}>
                        <div>
                            <h1 className={styles.title}>
                                팀 구성 검토 및 수정
                            </h1>
                            <p className={styles.tipText}>
                                팁: 학생을 클릭한 뒤 다른 학생을 클릭하면 두
                                학생의 팀이 변경됩니다
                            </p>
                        </div>

                        <div className={styles.actionArea}>
                            <button
                                type="button"
                                className={styles.secondaryButton}
                                onClick={handleRegenerate}
                            >
                                재생성
                            </button>
                            <button
                                type="button"
                                className={styles.primaryButton}
                                onClick={handleApprove}
                            >
                                팀 구성 승인
                            </button>
                        </div>
                    </div>

                    {message && <p className={styles.messageText}>{message}</p>}
                    {error && <p className={styles.messageText}>{error}</p>}

                    <section className={styles.selectionBar}>
                        <div>
                            <strong>선택 상태</strong>
                            <p>
                                {selectedMemberName
                                    ? `${selectedMemberName} 선택됨`
                                    : "학생을 선택하면 이곳에 선택 상태가 표시됩니다."}
                            </p>
                        </div>
                        <span>
                            {selectedMemberName
                                ? "교환할 학생을 한 명 더 선택하세요"
                                : "팀 상단 더블클릭 또는 배정 이유 버튼으로 이유 확인"}
                        </span>
                    </section>

                    {isLoading ? (
                        <p className={styles.messageText}>
                            팀 추천안을 불러오는 중입니다.
                        </p>
                    ) : (
                        <div className={styles.teamGrid}>
                            {teams.map((team, index) => (
                                <TeamCard
                                    key={team.id}
                                    team={team}
                                    teamNumber={index + 1}
                                    selectedMember={selectedMember}
                                    highlightedUserIds={highlightedUserIds}
                                    flipped={flippedTeamIds.includes(team.id)}
                                    onMemberClick={handleMemberClick}
                                    onHeaderDoubleClick={() =>
                                        handleHeaderDoubleClick(team.id)
                                    }
                                />
                            ))}
                        </div>
                    )}
                </main>
            </section>
        </div>
    );
};

export default AdminTeamEdit;
