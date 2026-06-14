import { gradeLabels } from "../../../constants/team";
import { getRoleSummary } from "../../../utils/teamRecommendation";
import TeamMemberRow from "./TeamMemberRow";
import styles from "./TeamEditCard.module.css";

const TeamEditCard = ({
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
                            <TeamMemberRow
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

export default TeamEditCard;
