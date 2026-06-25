import styles from "./TeamResultNoticeDetail.module.css";

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

const TeamResultNoticeDetail = ({ notice }) => {
    const teamResult = notice?.teamResult;
    const teams = teamResult?.teams ?? [];

    return (
        <section className={styles.wrapper}>
            <div className={styles.hero}>
                <p className={styles.eyebrow}>팀 배정 결과</p>
                <h2 className={styles.title}>
                    캡스톤 팀 배정이 완료되었습니다
                </h2>
                <p className={styles.description}>
                    아래 팀 목록에서 본인이 배정된 팀과 역할을 반드시
                    확인하세요. 확인 후 팀 채팅방에서 프로젝트 주제와 역할
                    분담을 논의하면 됩니다.
                </p>
            </div>

            <div className={styles.guideBox}>
                <p className={styles.guideTitle}>확인 사항</p>
                <ul className={styles.guideList}>
                    <li>본인의 팀, 역할, 팀장 여부를 먼저 확인하세요.</li>
                    <li>팀 채팅방에서 팀원들과 프로젝트 주제를 정리하세요.</li>
                    <li>
                        프로젝트 기획서는 팀원 협의 후 CapTeam에서 작성하세요.
                    </li>
                    <li>
                        캡스톤 일지는 안내된 양식에 맞춰 CapTeam에 작성하세요.
                    </li>
                    <li>
                        공지 미확인으로 생기는 불이익은 본인 및 각 팀
                        책임입니다.
                    </li>
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

            <div className={styles.footerNote}>
                팀 배정과 관련된 문의가 있다면 담당 선생님께 문의하세요.
            </div>
        </section>
    );
};

export default TeamResultNoticeDetail;
