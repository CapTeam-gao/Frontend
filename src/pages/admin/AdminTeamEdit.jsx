import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/common/Header";
import { cloneTeams } from "../../data/teamDummy";
import styles from "./AdminTeamEdit.module.css";

// 전체 팀 목록에서 선택한 학생이 몇 번째 팀, 몇 번째 위치에 있는지 찾는 함수
const findMember = (teams, target) => {
    // target.teamId와 같은 id를 가진 팀의 위치를 찾음
    const teamIndex = teams.findIndex((team) => team.id === target.teamId);

    // 팀을 찾지 못하면 -1이 나오기 때문에, 에러를 막기 위해 null 반환
    if (teamIndex === -1) {
        return null;
    }

    // 찾은 팀 안에서 target.memberId와 같은 id를 가진 학생의 위치를 찾음
    const memberIndex = teams[teamIndex].members.findIndex(
        (member) => member.id === target.memberId
    );

    // 학생을 찾지 못하면 -1이 나오기 때문에, 에러를 막기 위해 null 반환
    if (memberIndex === -1) {
        return null;
    }

    // 팀 위치와 학생 위치를 객체로 반환
    return {
        teamIndex,
        memberIndex,
    };
};

const MemberRow = ({ member, selected, leaderSlot, onClick }) => {
    return (
        <li
            className={`${styles.memberItem} ${
                selected ? styles.selectedMember : ""
            } ${leaderSlot ? styles.leaderMember : ""}`}
        >
            <button
                type="button"
                className={styles.memberButton}
                onClick={onClick}
            >
                <div className={styles.memberMain}>
                    <strong className={styles.memberName}>
                        {member.number} {member.name}
                    </strong>
                    {leaderSlot && (
                        <span className={styles.leaderBadge}>팀장</span>
                    )}
                </div>
                <div className={styles.memberSub}>
                    <span className={styles.positionBadge}>
                        {member.position}
                    </span>
                    <span className={styles.stackText}>{member.stack}</span>
                </div>
            </button>
        </li>
    );
};

const TeamCard = ({
    team,
    selectedMember,
    flipped,
    onMemberClick,
    onHeaderDoubleClick,
}) => {
    const roleNames = ["프론트엔드", "백엔드", "AI"];
    const roleCounts = roleNames.map((role) => ({
        role,
        count: team.members.filter((member) => member.position === role).length,
    }));
    const leaderMember = team.members[0];
    const normalMembers = team.members.slice(1);

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
                                <h2 className={styles.teamName}>{team.name}</h2>
                                <p className={styles.teamSummary}>
                                    총 {team.members.length}명
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
                            {roleCounts.map((item) => (
                                <span key={item.role}>
                                    {item.role} {item.count}
                                </span>
                            ))}
                        </div>
                    </header>

                    <ul className={styles.memberList}>
                        <MemberRow
                            member={leaderMember}
                            leaderSlot
                            selected={
                                selectedMember?.teamId === team.id &&
                                selectedMember?.memberId === leaderMember.id
                            }
                            onClick={() =>
                                onMemberClick(team.id, leaderMember.id)
                            }
                        />

                        {normalMembers.map((member) => (
                            <MemberRow
                                key={member.id}
                                member={member}
                                selected={
                                    selectedMember?.teamId === team.id &&
                                    selectedMember?.memberId === member.id
                                }
                                onClick={() =>
                                    onMemberClick(team.id, member.id)
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
                                <h2 className={styles.teamName}>{team.name}</h2>
                                <p className={styles.teamSummary}>
                                    총 {team.members.length}명
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
                            {roleCounts.map((item) => (
                                <span key={item.role}>
                                    {item.role} {item.count}
                                </span>
                            ))}
                        </div>
                    </header>

                    <div className={styles.reasonArea}>
                        <h3 className={styles.reasonTitle}>팀 배정 이유</h3>
                        <div className={styles.reasonList}>
                            {team.reasons.map((reason) => (
                                <section
                                    key={reason.title}
                                    className={styles.reasonBox}
                                >
                                    <strong>{reason.title}</strong>
                                    <p>{reason.text}</p>
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
    const [teams, setTeams] = useState(() => cloneTeams());
    const [selectedMember, setSelectedMember] = useState(null);
    const [flippedTeamIds, setFlippedTeamIds] = useState([]);
    const [message, setMessage] = useState("");

    const selectedMemberName = selectedMember
        ? teams
              .find((team) => team.id === selectedMember.teamId)
              ?.members.find((member) => member.id === selectedMember.memberId)
              ?.name
        : "";
    const selectedTeamName = selectedMember
        ? teams.find((team) => team.id === selectedMember.teamId)?.name
        : "";

    const handleMemberClick = (teamId, memberId) => {
        const nextSelected = { teamId, memberId };

        if (!selectedMember) {
            setSelectedMember(nextSelected);
            setMessage("변경할 다른 학생을 선택해주세요.");
            return;
        }

        if (
            selectedMember.teamId === teamId &&
            selectedMember.memberId === memberId
        ) {
            setSelectedMember(null);
            setMessage("선택이 취소되었습니다.");
            return;
        }

        setTeams((prevTeams) => {
            const copiedTeams = prevTeams.map((team) => ({
                ...team,
                members: team.members.map((member) => ({ ...member })),
            }));

            const first = findMember(copiedTeams, selectedMember);
            const second = findMember(copiedTeams, nextSelected);

            if (!first || !second) return copiedTeams;

            const firstMember =
                copiedTeams[first.teamIndex].members[first.memberIndex];
            const secondMember =
                copiedTeams[second.teamIndex].members[second.memberIndex];

            copiedTeams[first.teamIndex].members[first.memberIndex] =
                secondMember;
            copiedTeams[second.teamIndex].members[second.memberIndex] =
                firstMember;

            return copiedTeams;
        });

        setSelectedMember(null);
        setMessage("두 학생의 팀 위치가 변경되었습니다.");
    };

    const handleHeaderDoubleClick = (teamId) => {
        setFlippedTeamIds((prevIds) => {
            if (prevIds.includes(teamId)) {
                return prevIds.filter((id) => id !== teamId);
            }

            return [...prevIds, teamId];
        });
    };

    const handleReset = () => {
        setTeams(cloneTeams());
        setSelectedMember(null);
        setFlippedTeamIds([]);
        setMessage("팀 구성이 처음 상태로 돌아갔습니다.");
    };

    const handleApprove = () => {
        setMessage("");
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
                                onClick={handleReset}
                            >
                                초기화
                            </button>
                            <Link
                                to="/admin/team-create/loading"
                                className={styles.secondaryButton}
                            >
                                재생성
                            </Link>
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

                    <section className={styles.selectionBar}>
                        <div>
                            <strong>선택 상태</strong>
                            <p>
                                {selectedMemberName
                                    ? `${selectedTeamName} · ${selectedMemberName} 선택됨`
                                    : "학생을 선택하면 이곳에 선택 상태가 표시됩니다."}
                            </p>
                        </div>
                        <span>
                            {selectedMemberName
                                ? "교환할 학생을 한 명 더 선택하세요"
                                : "팀 상단 더블클릭 또는 배정 이유 버튼으로 이유 확인"}
                        </span>
                    </section>

                    <div className={styles.teamGrid}>
                        {teams.map((team) => (
                            <TeamCard
                                key={team.id}
                                team={team}
                                selectedMember={selectedMember}
                                flipped={flippedTeamIds.includes(team.id)}
                                onMemberClick={handleMemberClick}
                                onHeaderDoubleClick={() =>
                                    handleHeaderDoubleClick(team.id)
                                }
                            />
                        ))}
                    </div>
                </main>
            </section>
        </div>
    );
};

export default AdminTeamEdit;
