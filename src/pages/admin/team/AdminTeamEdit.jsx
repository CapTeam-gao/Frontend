import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "../../../components/common/header/Header";
import TeamEditCard from "../../../components/admin/team/TeamEditCard";
import {
    requestAcceptAllTeamRecommendations,
    requestSwapTeamMembers,
    requestTeamRecommendationsByGrade,
} from "../../../api/teamApi";
import styles from "./AdminTeamEdit.module.css";
import {
    normalizeRecommendations,
    swapMembersInTeams,
} from "../../../utils/teamRecommendation";

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
    const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
    const [regenerationPrompt, setRegenerationPrompt] = useState("");
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
        setIsRegenerateModalOpen(true);
    };
    const handleRegenerateConfirm = () => {
        navigate("/admin/team-create/loading", {
            state: {
                grade,
                regenerationPrompt,
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
                                <TeamEditCard
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
            {isRegenerateModalOpen && (
                <div className={styles.modalOverlay}>
                    <section className={styles.regenerateModal}>
                        <div className={styles.modalHeader}>
                            <div>
                                <h2 className={styles.modalTitle}>
                                    팀 재생성 조건 입력
                                </h2>
                                <p className={styles.modalDescription}>
                                    원하는 팀 구성 방향을 입력하면 기존 추천안을
                                    참고해 다시 팀을 생성합니다.
                                </p>
                            </div>

                            <button
                                type="button"
                                className={styles.modalCloseButton}
                                onClick={() => setIsRegenerateModalOpen(false)}
                            >
                                ×
                            </button>
                        </div>

                        <textarea
                            className={styles.promptTextarea}
                            value={regenerationPrompt}
                            onChange={(event) =>
                                setRegenerationPrompt(event.target.value)
                            }
                            placeholder="예: 프론트엔드 역할이 한 팀에 몰리지 않게 해주세요. 팀장 희망 학생이 각 팀에 최소 1명씩 들어가면 좋겠습니다."
                            maxLength={1000}
                        />

                        <div className={styles.promptMeta}>
                            <span>최대 1000자</span>
                            <span>{regenerationPrompt.length}/1000</span>
                        </div>

                        <div className={styles.modalActionArea}>
                            <button
                                type="button"
                                className={styles.modalCancelButton}
                                onClick={() => setIsRegenerateModalOpen(false)}
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                className={styles.modalConfirmButton}
                                onClick={handleRegenerateConfirm}
                            >
                                재생성 시작
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
};

export default AdminTeamEdit;
