import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "../../../components/common/header/Header";
import { requestAdminStudentList } from "../../../api/studentApi";
import { requestCreateManualTeams } from "../../../api/teamApi";
import { roleLabels, gradeLabels } from "../../../constants/team";
import { getApiErrorMessage } from "../../../utils/apiError";
import {
    getRoleBarSegments,
    getRoleSummary,
} from "../../../utils/teamRecommendation";
import styles from "./AdminTeamManualCreate.module.css";

const MAX_TEAM_SIZE = 5;

const matchesKeyword = (student, keyword) => {
    if (!keyword) return false;

    const roleLabel = roleLabels[student.studentRole] || "";

    return (
        student.name.toLowerCase().includes(keyword) ||
        student.userId.replace("stu", "").includes(keyword) ||
        roleLabel.toLowerCase().includes(keyword)
    );
};

let teamIdSeq = 1;
const createEmptyTeam = () => ({
    id: `team-${teamIdSeq++}`,
    memberUserIds: [],
    leaderUserId: null,
});

const AdminTeamManualCreate = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const grade = location.state?.grade || "GRADE_2";
    const [students, setStudents] = useState([]);
    const [teams, setTeams] = useState([createEmptyTeam(), createEmptyTeam()]);
    const [searchByTeamId, setSearchByTeamId] = useState({});
    const [openResultsTeamId, setOpenResultsTeamId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    useEffect(() => {
        const getStudents = async () => {
            try {
                const data = await requestAdminStudentList();
                setStudents(
                    Array.isArray(data?.students)
                        ? data.students.filter(
                              (student) => student.grade === grade
                          )
                        : []
                );
            } catch {
                setError("학생 목록을 불러오지 못했습니다.");
            } finally {
                setIsLoading(false);
            }
        };

        getStudents();
    }, [grade]);

    const assignedUserIds = useMemo(() => {
        const assigned = new Set();
        teams.forEach((team) => {
            team.memberUserIds.forEach((userId) => assigned.add(userId));
        });
        return assigned;
    }, [teams]);

    const unassignedStudents = students.filter(
        (student) => !assignedUserIds.has(student.userId)
    );

    const findStudent = (userId) =>
        students.find((student) => student.userId === userId);

    const handleAddTeam = () => {
        setTeams((prevTeams) => [...prevTeams, createEmptyTeam()]);
    };

    const handleRemoveTeam = (teamId) => {
        setTeams((prevTeams) =>
            prevTeams.filter((team) => team.id !== teamId)
        );
    };

    const handleAddMember = (teamId, userId) => {
        setTeams((prevTeams) =>
            prevTeams.map((team) => {
                if (team.id !== teamId) return team;
                if (team.memberUserIds.includes(userId)) return team;
                if (team.memberUserIds.length >= MAX_TEAM_SIZE) return team;

                return {
                    ...team,
                    memberUserIds: [...team.memberUserIds, userId],
                    leaderUserId: team.leaderUserId || userId,
                };
            })
        );
        setSearchByTeamId((prev) => ({ ...prev, [teamId]: "" }));
        setOpenResultsTeamId(null);
    };

    const handleRemoveMember = (teamId, userId) => {
        setTeams((prevTeams) =>
            prevTeams.map((team) => {
                if (team.id !== teamId) return team;

                const memberUserIds = team.memberUserIds.filter(
                    (id) => id !== userId
                );

                return {
                    ...team,
                    memberUserIds,
                    leaderUserId:
                        team.leaderUserId === userId
                            ? memberUserIds[0] || null
                            : team.leaderUserId,
                };
            })
        );
    };

    const handleSetLeader = (teamId, userId) => {
        setTeams((prevTeams) =>
            prevTeams.map((team) =>
                team.id === teamId ? { ...team, leaderUserId: userId } : team
            )
        );
    };

    const handleSearchChange = (teamId, value) => {
        setSearchByTeamId((prev) => ({ ...prev, [teamId]: value }));
        setOpenResultsTeamId(value.trim() ? teamId : null);
    };

    const getSearchResults = (teamId) => {
        const keyword = (searchByTeamId[teamId] || "").trim().toLowerCase();

        return unassignedStudents
            .filter((student) => matchesKeyword(student, keyword))
            .slice(0, 6);
    };

    const buildTeamsPayload = () =>
        teams
            .filter((team) => team.memberUserIds.length > 0)
            .map((team, index) => ({
                teamName: `${index + 1}팀`,
                memberUserIds: team.memberUserIds,
                leaderUserId: team.leaderUserId,
            }));

    const submitTeams = async () => {
        try {
            setIsSubmitting(true);
            setError("");
            await requestCreateManualTeams(grade, buildTeamsPayload());
            navigate("/admin/team-manage");
        } catch (e) {
            setError(getApiErrorMessage(e, "팀 구성 저장에 실패했습니다."));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitClick = () => {
        if (unassignedStudents.length > 0) {
            setIsConfirmModalOpen(true);
            return;
        }

        submitTeams();
    };

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.body}>
                <Link to="/admin/team-create" className={styles.backLink}>
                    ← 처음으로
                </Link>

                <div className={styles.titleArea}>
                    <div>
                        <h1 className={styles.title}>
                            {gradeLabels[grade]} 팀 직접 구성
                        </h1>
                        <p className={styles.tipText}>
                            팁: 학생을 검색해서 팀에 추가하고, 팀장 한 명을
                            지정하세요. 한 팀은 최대 {MAX_TEAM_SIZE}명까지
                            배정할 수 있습니다.
                        </p>
                    </div>
                    <button
                        type="button"
                        className={styles.submitButton}
                        disabled={isSubmitting}
                        onClick={handleSubmitClick}
                    >
                        {isSubmitting ? "저장 중..." : "직접 구성 완료"}
                    </button>
                </div>

                {error && <p className={styles.errorText}>{error}</p>}

                {!isLoading && (
                    <section className={styles.layout}>
                        <aside className={styles.poolPanel}>
                            <div className={styles.poolHeader}>
                                <h2>미배정 학생</h2>
                                <span className={styles.poolCount}>
                                    {unassignedStudents.length}명
                                </span>
                            </div>
                            <div className={styles.poolList}>
                                {unassignedStudents.length ? (
                                    unassignedStudents.map((student) => (
                                        <div
                                            key={student.userId}
                                            className={styles.poolItem}
                                        >
                                            <div className={styles.poolName}>
                                                {student.name}
                                            </div>
                                            <div className={styles.poolMeta}>
                                                <span>
                                                    {student.userId.replace(
                                                        "stu",
                                                        ""
                                                    )}
                                                </span>
                                                <span
                                                    className={
                                                        styles.poolRoleTag
                                                    }
                                                >
                                                    {roleLabels[
                                                        student.studentRole
                                                    ] || student.studentRole}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className={styles.poolEmpty}>
                                        모든 학생이 배정되었습니다.
                                    </p>
                                )}
                            </div>
                        </aside>

                        <section>
                            <div className={styles.teamToolbar}>
                                <h2>팀 목록</h2>
                                <button
                                    type="button"
                                    className={styles.addTeamButton}
                                    onClick={handleAddTeam}
                                >
                                    + 팀 추가
                                </button>
                            </div>

                            {teams.length ? (
                                <div className={styles.teamGrid}>
                                    {teams.map((team, index) => {
                                        const members =
                                            team.memberUserIds.map(
                                                (userId) =>
                                                    findStudent(userId)
                                            );
                                        const isFull =
                                            team.memberUserIds.length >=
                                            MAX_TEAM_SIZE;
                                        const searchResults =
                                            getSearchResults(team.id);

                                        return (
                                            <article
                                                key={team.id}
                                                className={styles.teamCard}
                                            >
                                                <div
                                                    className={
                                                        styles.teamCardHead
                                                    }
                                                >
                                                    <h3
                                                        className={
                                                            styles.teamName
                                                        }
                                                    >
                                                        {index + 1}팀
                                                    </h3>
                                                    <span
                                                        className={`${styles.teamCapacity} ${
                                                            isFull
                                                                ? styles.isFull
                                                                : ""
                                                        }`}
                                                    >
                                                        {
                                                            team.memberUserIds
                                                                .length
                                                        }
                                                        /{MAX_TEAM_SIZE}명
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className={
                                                            styles.removeTeamButton
                                                        }
                                                        onClick={() =>
                                                            handleRemoveTeam(
                                                                team.id
                                                            )
                                                        }
                                                    >
                                                        팀 삭제
                                                    </button>
                                                </div>

                                                {members.length > 0 && (
                                                    <>
                                                        <div
                                                            className={
                                                                styles.roleBar
                                                            }
                                                        >
                                                            {getRoleBarSegments(
                                                                members
                                                            ).map(
                                                                (segment) => (
                                                                    <span
                                                                        key={
                                                                            segment.role
                                                                        }
                                                                        style={{
                                                                            width: `${segment.percent}%`,
                                                                        }}
                                                                    />
                                                                )
                                                            )}
                                                        </div>
                                                        <div
                                                            className={
                                                                styles.roleLegend
                                                            }
                                                        >
                                                            {getRoleSummary(
                                                                members
                                                            )}
                                                        </div>
                                                    </>
                                                )}

                                                {isFull ? (
                                                    <p
                                                        className={
                                                            styles.teamFullNote
                                                        }
                                                    >
                                                        정원 {MAX_TEAM_SIZE}
                                                        명이 모두 찼습니다.
                                                    </p>
                                                ) : (
                                                    <div
                                                        className={
                                                            styles.teamSearchWrap
                                                        }
                                                    >
                                                        <span
                                                            className={
                                                                styles.icon
                                                            }
                                                        >
                                                            ⌕
                                                        </span>
                                                        <input
                                                            type="text"
                                                            placeholder="이름, 학번, 역할로 검색해서 추가"
                                                            autoComplete="off"
                                                            value={
                                                                searchByTeamId[
                                                                    team.id
                                                                ] || ""
                                                            }
                                                            onChange={(e) =>
                                                                handleSearchChange(
                                                                    team.id,
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                        {openResultsTeamId ===
                                                            team.id && (
                                                            <div
                                                                className={
                                                                    styles.teamSearchResults
                                                                }
                                                            >
                                                                {searchResults.length ? (
                                                                    searchResults.map(
                                                                        (
                                                                            student
                                                                        ) => (
                                                                            <button
                                                                                key={
                                                                                    student.userId
                                                                                }
                                                                                type="button"
                                                                                className={
                                                                                    styles.teamSearchResult
                                                                                }
                                                                                onClick={() =>
                                                                                    handleAddMember(
                                                                                        team.id,
                                                                                        student.userId
                                                                                    )
                                                                                }
                                                                            >
                                                                                <span>
                                                                                    {
                                                                                        student.name
                                                                                    }
                                                                                </span>
                                                                                <span>
                                                                                    {roleLabels[
                                                                                        student
                                                                                            .studentRole
                                                                                    ] ||
                                                                                        student.studentRole}
                                                                                </span>
                                                                            </button>
                                                                        )
                                                                    )
                                                                ) : (
                                                                    <div
                                                                        className={
                                                                            styles.teamSearchEmpty
                                                                        }
                                                                    >
                                                                        일치하는
                                                                        학생이
                                                                        없습니다.
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <ul
                                                    className={
                                                        styles.memberList
                                                    }
                                                >
                                                    {members.length ? (
                                                        members.map(
                                                            (member) => (
                                                                <li
                                                                    key={
                                                                        member.userId
                                                                    }
                                                                    className={
                                                                        styles.memberRow
                                                                    }
                                                                >
                                                                    <div
                                                                        className={
                                                                            styles.memberMain
                                                                        }
                                                                    >
                                                                        <span
                                                                            className={
                                                                                styles.memberName
                                                                            }
                                                                        >
                                                                            {
                                                                                member.name
                                                                            }
                                                                        </span>
                                                                        {team.leaderUserId ===
                                                                            member.userId && (
                                                                            <span
                                                                                className={
                                                                                    styles.leaderBadge
                                                                                }
                                                                            >
                                                                                팀장
                                                                            </span>
                                                                        )}
                                                                        <span
                                                                            className={
                                                                                styles.memberRole
                                                                            }
                                                                        >
                                                                            {roleLabels[
                                                                                member
                                                                                    .studentRole
                                                                            ] ||
                                                                                member.studentRole}
                                                                        </span>
                                                                    </div>
                                                                    <div
                                                                        className={
                                                                            styles.memberActions
                                                                        }
                                                                    >
                                                                        {team.leaderUserId !==
                                                                            member.userId && (
                                                                            <button
                                                                                type="button"
                                                                                className={
                                                                                    styles.setLeaderButton
                                                                                }
                                                                                onClick={() =>
                                                                                    handleSetLeader(
                                                                                        team.id,
                                                                                        member.userId
                                                                                    )
                                                                                }
                                                                            >
                                                                                팀장
                                                                                지정
                                                                            </button>
                                                                        )}
                                                                        <button
                                                                            type="button"
                                                                            className={
                                                                                styles.removeMemberButton
                                                                            }
                                                                            onClick={() =>
                                                                                handleRemoveMember(
                                                                                    team.id,
                                                                                    member.userId
                                                                                )
                                                                            }
                                                                        >
                                                                            삭제
                                                                        </button>
                                                                    </div>
                                                                </li>
                                                            )
                                                        )
                                                    ) : (
                                                        <li
                                                            className={
                                                                styles.memberEmpty
                                                            }
                                                        >
                                                            아직 배정된
                                                            학생이 없습니다.
                                                        </li>
                                                    )}
                                                </ul>
                                            </article>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className={styles.emptyTeamGrid}>
                                    아직 만든 팀이 없습니다. "+ 팀 추가"로
                                    시작하세요.
                                </p>
                            )}
                        </section>
                    </section>
                )}
            </main>

            {isConfirmModalOpen && (
                <div className={styles.modalOverlay}>
                    <section className={styles.confirmModal}>
                        <h2 className={styles.confirmModalTitle}>
                            배정되지 않은 학생이 있습니다
                        </h2>
                        <p className={styles.confirmModalText}>
                            아직 배정되지 않은 학생이{" "}
                            {unassignedStudents.length}명 있습니다. 이대로
                            진행하시겠습니까?
                        </p>
                        <div className={styles.confirmModalActions}>
                            <button
                                type="button"
                                className={styles.confirmCancelButton}
                                onClick={() => setIsConfirmModalOpen(false)}
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                className={styles.confirmProceedButton}
                                onClick={() => {
                                    setIsConfirmModalOpen(false);
                                    submitTeams();
                                }}
                            >
                                진행하시겠습니까?
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
};

export default AdminTeamManualCreate;
