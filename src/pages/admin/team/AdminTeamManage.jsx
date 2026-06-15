import { useEffect, useMemo, useState } from "react";
import Header from "../../../components/common/header/Header";
import AdminTeamCard from "../../../components/admin/team/AdminTeamCard";
import AdminTeamDetailModal from "../../../components/admin/team/AdminTeamDetailModal";
import {
    requestAdminTeamDetail,
    requestAdminTeamList,
} from "../../../api/teamApi";
import TeamIcon from "../../../assets/icons/team.svg";
import styles from "./AdminTeamManage.module.css";

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

            return (
                isSameGrade && (!keyword || searchableText.includes(keyword))
            );
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
                    <article
                        className={`${styles.summaryCard} ${styles.active}`}
                    >
                        <div>
                            <p>전체 팀</p>
                            <strong>{counts.total}</strong>
                        </div>
                        <span className={styles.summaryIcon}>
                            <img src={TeamIcon} alt="" />
                        </span>
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
                                selectedGrade === "GRADE_2"
                                    ? styles.selected
                                    : ""
                            }
                            onClick={() => setSelectedGrade("GRADE_2")}
                        >
                            2학년
                        </button>
                        <button
                            type="button"
                            className={
                                selectedGrade === "GRADE_3"
                                    ? styles.selected
                                    : ""
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
                        <AdminTeamCard
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

            <AdminTeamDetailModal
                team={selectedTeam}
                loading={isDetailLoading}
                error={modalError}
                onClose={handleCloseModal}
            />
        </div>
    );
};

export default AdminTeamManage;
