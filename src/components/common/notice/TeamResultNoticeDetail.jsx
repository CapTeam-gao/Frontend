import styles from "./TeamResultNoticeDetail.module.css";
import { parseTeamResultNoticeContent } from "../../../utils/teamResultNotice";

const sortMembers = (members = []) => {
    return [...members].sort((a, b) => Number(b.leader) - Number(a.leader));
};

const getRoleLabel = (role) => {
    switch (role) {
        case "FRONTEND":
            return "프론트엔드";
        case "BACKEND":
            return "백엔드";
        case "AI":
            return "AI";
        case "APP":
            return "앱";
        case "DESIGN":
            return "디자인";
        case "PLANNER":
            return "기획";
        default:
            return role ?? "미정";
    }
};

const TeamResultNoticeDetail = ({ notice, parsed }) => {
    const teamResult = notice?.teamResult;
    const teams = teamResult?.teams ?? [];

    return (
        <section className={styles.wrapper}>
            <div className={styles.hero}>
                <p className={styles.eyebrow}>팀 배정 결과</p>
                <h2 className={styles.title}>{parsed.heroTitle}</h2>
                <p className={styles.description}>{parsed.heroDescription}</p>
            </div>

            <div className={styles.guideBox}>
                <p className={styles.guideTitle}>{parsed.guideTitle}</p>
                <ul className={styles.guideList}>
                    {parsed.guideItems.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
            </div>

            <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>팀 목록</h3>
            </div>

            {teams.length === 0 ? (
                <div className={styles.emptyBox}>
                    팀 배정 결과 정보를 아직 불러오지 못했어.
                </div>
            ) : (
                <div className={styles.teamList}>
                    {teams.map((team) => {
                        const sortedMembers = sortMembers(team.members);

                        return (
                            <article
                                key={team.teamId ?? team.teamName}
                                className={styles.teamCard}
                            >
                                <div className={styles.teamTop}>
                                    <div>
                                        <h4 className={styles.teamName}>
                                            {team.teamName}
                                        </h4>
                                        {team.roleSummary && (
                                            <p className={styles.roleSummary}>
                                                {team.roleSummary}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.memberRow}>
                                    {sortedMembers.map((member) => (
                                        <div
                                            key={member.userId ?? member.name}
                                            className={styles.memberChip}
                                        >
                                            <span className={styles.memberName}>
                                                {member.name}
                                            </span>
                                            {member.leader && (
                                                <span
                                                    className={
                                                        styles.leaderBadge
                                                    }
                                                >
                                                    팀장
                                                </span>
                                            )}
                                            <span className={styles.dot}>
                                                ·
                                            </span>
                                            <span className={styles.memberRole}>
                                                {getRoleLabel(
                                                    member.studentRole
                                                )}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            <div className={styles.footerNote}>{parsed.footerNote}</div>
        </section>
    );
};

export default TeamResultNoticeDetail;
