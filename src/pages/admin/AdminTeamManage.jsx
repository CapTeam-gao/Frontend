import { useEffect, useMemo, useState } from "react";
import Header from "../../components/common/Header";
import { requestAdminTeamDetail, requestAdminTeamList } from "../../api/teamApi";
import styles from "./AdminTeamManage.module.css";

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

const getRoleCount = (roleCount = {}, role) => roleCount[role] || 0;

const getRoleSummary = (roleCount = {}) => {
    const frontend = getRoleCount(roleCount, "FRONTEND");
    const backend = getRoleCount(roleCount, "BACKEND");
    const ai = getRoleCount(roleCount, "AI");

    return `프론트엔드 : ${frontend}명 / 백엔드 : ${backend}명 / AI : ${ai}명`;
};

const hasProjectInfo = (team) => Boolean(team?.serviceName);

const TeamMemberPreview = ({ member }) => {
    return (
        <li className={styles.memberPreview}>
            <strong>{member.name}</strong>
            {member.leaderRole === "LEADER" && (
                <span className={styles.leaderBadge}>팀장</span>
            )}
            <p>{roleLabels[member.studentRole] || member.studentRole}</p>
        </li>
    );
};

const TeamCard = ({ team, onClick }) => {
    const projectWritten = hasProjectInfo(team);

    return (
        <button type="button" className={styles.teamCard} onClick={onClick}>
            <header className={styles.teamHeader}>
                <div className={styles.teamTitleGroup}>
                    <h2>{projectWritten ? team.serviceName : team.teamName}</h2>
                    <span>{gradeLabels[team.grade] || team.grade}</span>
                </div>
                <p>{getRoleSummary(team.roleCount)}</p>
            </header>

            {projectWritten ? (
                <>
                    <strong className={styles.projectTitle}>
                        {team.serviceName}
                    </strong>
                    <ul className={styles.memberPreviewList}>
                        {(team.members || []).map((member) => (
                            <TeamMemberPreview
                                key={`${team.teamId}-${member.name}-${member.studentRole}`}
                                member={member}
                            />
                        ))}
                    </ul>
                </>
            ) : (
                <div className={styles.emptyProject}>
                    정보가 입력되지 않았습니다.
                </div>
            )}
        </button>
    );
};

const TeamDetailModal = ({ team, loading, error, onClose }) => {
    if (!team && !loading && !error) return null;

    const projectWritten = hasProjectInfo(team);

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <section
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    className={styles.closeButton}
                    onClick={onClose}
                >
                    X
                </button>

                {loading && <p className={styles.modalStatus}>불러오는 중...</p>}
                {error && <p className={styles.modalError}>{error}</p>}

                {team && (
                    <>
                        <header className={styles.modalHeader}>
                            <div>
                                <h2>{team.serviceName || team.teamName}</h2>
                                <p>{gradeLabels[team.grade] || team.grade}</p>
                            </div>
                            <strong>{getRoleSummary(team.roleCount)}</strong>
                        </header>

                        {projectWritten ? (
                            <div className={styles.modalContent}>
                                <div className={styles.projectPanel}>
                                    <section className={styles.projectGrid}>
                                        <div>
                                            <h3>서비스 소개</h3>
                                            <p>{team.serviceIntro}</p>
                                        </div>
                                        <div>
                                            <h3>주요 기능 정리</h3>
                                            <p>{team.mainFeatures}</p>
                                        </div>
                                    </section>

                                    <section className={styles.highlightBox}>
                                        <h3>강점</h3>
                                        <p>
                                            역할 분배와 프로젝트 정보가 입력되어
                                            팀 진행 상황을 빠르게 확인할 수
                                            있습니다.
                                        </p>
                                    </section>

                                    <section
                                        className={`${styles.highlightBox} ${styles.warningBox}`}
                                    >
                                        <h3>확인 필요</h3>
                                        <p>
                                            기획서 내용과 실제 팀 역할이 맞는지
                                            발표 전 한 번 더 확인해주세요.
                                        </p>
                                    </section>
                                </div>

                                <aside className={styles.memberPanel}>
                                    {(team.members || []).map((member) => (
                                        <div
                                            key={member.userId}
                                            className={styles.modalMember}
                                        >
                                            <strong>{member.name}</strong>
                                            <div>
                                                {member.leaderRole ===
                                                    "LEADER" && (
                                                    <span
                                                        className={
                                                            styles.leaderBadge
                                                        }
                                                    >
                                                        팀장
                                                    </span>
                                                )}
                                                <p>
                                                    {roleLabels[
                                                        member.studentRole
                                                    ] || member.studentRole}
                                                    {member.skill?.length
                                                        ? ` | ${member.skill.join(
                                                              ", "
                                                          )}`
                                                        : ""}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </aside>
                            </div>
                        ) : (
                            <div className={styles.emptyModal}>
                                정보가 입력되지 않았습니다.
                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    );
};

const AdminTeamManage = () => {
    const [teams, setTeams] = useState([]);
    const [selectedGrade, setSelectedGrade] = useState("GRADE_2");
    const [searchText, setSearchText] = useState("");
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [error, setError] = useState("");
    const [modalError, setModalError] = useState("");

    useEffect(() => {
        const getTeams = async () => {
            try {
                const data = await requestAdminTeamList();
                setTeams(Array.isArray(data) ? data : []);
            } catch {
                setError("팀 목록을 불러오지 못했습니다.");
            }
        };

        getTeams();
    }, []);

    const counts = useMemo(() => {
        const grade2 = teams.filter((team) => team.grade === "GRADE_2").length;
        const grade3 = teams.filter((team) => team.grade === "GRADE_3").length;

        return {
            total: teams.length,
            grade2,
            grade3,
        };
    }, [teams]);

    const filteredTeams = useMemo(() => {
        const keyword = searchText.trim().toLowerCase();

        return teams.filter((team) => {
            const isSameGrade = team.grade === selectedGrade;
            const memberNames = (team.members || [])
                .map((member) => member.name)
                .join(" ")
                .toLowerCase();
            const searchableText = `${team.teamName || ""} ${
                team.serviceName || ""
            } ${memberNames}`.toLowerCase();

            return isSameGrade && (!keyword || searchableText.includes(keyword));
        });
    }, [searchText, selectedGrade, teams]);

    const handleOpenTeam = async (teamId) => {
        try {
            setSelectedTeam(null);
            setModalError("");
            setIsDetailLoading(true);

            const data = await requestAdminTeamDetail(teamId);
            setSelectedTeam(data);
        } catch {
            setModalError("팀 상세 정보를 불러오지 못했습니다.");
        } finally {
            setIsDetailLoading(false);
        }
    };

    const handleCloseModal = () => {
        setSelectedTeam(null);
        setModalError("");
        setIsDetailLoading(false);
    };

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.body}>
                <section className={styles.summaryArea}>
                    <article className={`${styles.summaryCard} ${styles.active}`}>
                        <div>
                            <p>전체 팀</p>
                            <strong>{counts.total}</strong>
                        </div>
                        <span className={styles.summaryIcon}>▣</span>
                    </article>

                    <article className={styles.summaryCard}>
                        <p>2학년 팀</p>
                        <strong>{counts.grade2}</strong>
                    </article>

                    <article className={styles.summaryCard}>
                        <p>3학년 팀</p>
                        <strong>{counts.grade3}</strong>
                    </article>
                </section>

                <section className={styles.controlArea}>
                    <div className={styles.gradeTabs}>
                        <button
                            type="button"
                            className={
                                selectedGrade === "GRADE_2" ? styles.selected : ""
                            }
                            onClick={() => setSelectedGrade("GRADE_2")}
                        >
                            2학년
                        </button>
                        <button
                            type="button"
                            className={
                                selectedGrade === "GRADE_3" ? styles.selected : ""
                            }
                            onClick={() => setSelectedGrade("GRADE_3")}
                        >
                            3학년
                        </button>
                    </div>

                    <label className={styles.searchBox}>
                        <input
                            type="text"
                            value={searchText}
                            placeholder="팀명 또는 학생 이름을 검색하세요..."
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                        <span>⌕</span>
                    </label>
                </section>

                {error && <p className={styles.errorText}>{error}</p>}

                <section className={styles.teamGrid}>
                    {filteredTeams.map((team) => (
                        <TeamCard
                            key={team.teamId}
                            team={team}
                            onClick={() => handleOpenTeam(team.teamId)}
                        />
                    ))}
                </section>

                {!error && filteredTeams.length === 0 && (
                    <p className={styles.emptyText}>
                        조회할 팀 정보가 없습니다.
                    </p>
                )}
            </main>

            <TeamDetailModal
                team={selectedTeam}
                loading={isDetailLoading}
                error={modalError}
                onClose={handleCloseModal}
            />
        </div>
    );
};

export default AdminTeamManage;
