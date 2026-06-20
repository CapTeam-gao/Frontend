import { useEffect, useMemo, useState } from "react";
import Header from "../../../components/common/header/Header";
import AdminTeamCard from "../../../components/admin/team/AdminTeamCard";
import AdminTeamDetailModal from "../../../components/admin/team/AdminTeamDetailModal";
import {
    requestAdminTeamDetail,
    requestAdminTeamList,
} from "../../../api/teamApi";
import TeamIcon from "../../../assets/icons/team.svg";
import useDelayedLoading from "../../../hooks/useDelayedLoading";
import styles from "./AdminTeamManage.module.css";

const AdminTeamManage = () => {
    const [teams, setTeams] = useState([]);
    const [selectedGrade, setSelectedGrade] = useState("all");
    const [searchText, setSearchText] = useState("");
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [error, setError] = useState("");
    const [modalError, setModalError] = useState("");
    const showLoading = useDelayedLoading(isLoading);
    const showDetailLoading = useDelayedLoading(isDetailLoading);

    useEffect(() => {
        const getTeams = async () => {
            try {
                setIsLoading(true);
                const data = await requestAdminTeamList();
                setTeams(Array.isArray(data) ? data : []);
            } catch {
                setError("팀 목록을 불러오지 못했습니다.");
            } finally {
                setIsLoading(false);
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
            const isSameGrade =
                selectedGrade === "all" || team.grade === selectedGrade;
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
                    <button
                        type="button"
                        className={`${styles.summaryCard} ${
                            selectedGrade === "all" ? styles.active : ""
                        }`}
                        onClick={() => setSelectedGrade("all")}
                        aria-pressed={selectedGrade === "all"}
                    >
                        <div>
                            <p>전체 팀</p>
                            <strong>{!isLoading && counts.total}</strong>
                        </div>
                        <span className={styles.summaryIcon}>
                            <img src={TeamIcon} alt="" />
                        </span>
                    </button>

                    <button
                        type="button"
                        className={`${styles.summaryCard} ${
                            selectedGrade === "GRADE_2" ? styles.active : ""
                        }`}
                        onClick={() => setSelectedGrade("GRADE_2")}
                        aria-pressed={selectedGrade === "GRADE_2"}
                    >
                        <p>2학년 팀</p>
                        <strong>{!isLoading && counts.grade2}</strong>
                    </button>

                    <button
                        type="button"
                        className={`${styles.summaryCard} ${
                            selectedGrade === "GRADE_3" ? styles.active : ""
                        }`}
                        onClick={() => setSelectedGrade("GRADE_3")}
                        aria-pressed={selectedGrade === "GRADE_3"}
                    >
                        <p>3학년 팀</p>
                        <strong>{!isLoading && counts.grade3}</strong>
                    </button>
                </section>

                <section className={styles.controlArea}>
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

                {isLoading ? (
                    <p className={styles.emptyText}>
                        {showLoading && "팀 목록을 불러오는 중입니다."}
                    </p>
                ) : (
                    <section className={styles.teamGrid}>
                        {filteredTeams.map((team) => (
                            <AdminTeamCard
                                key={team.teamId}
                                team={team}
                                onClick={() => handleOpenTeam(team.teamId)}
                            />
                        ))}
                    </section>
                )}

                {!isLoading && !error && filteredTeams.length === 0 && (
                    <p className={styles.emptyText}>
                        조회할 팀 정보가 없습니다.
                    </p>
                )}
            </main>

            <AdminTeamDetailModal
                team={selectedTeam}
                loading={showDetailLoading}
                error={modalError}
                onClose={handleCloseModal}
            />
        </div>
    );
};

export default AdminTeamManage;
