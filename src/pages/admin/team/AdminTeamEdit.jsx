import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "../../../components/common/header/Header";
import TeamEditCard from "../../../components/admin/team/TeamEditCard";
import {
    requestAcceptAllTeamRecommendations,
    requestApplyTeamMatchingVersion,
    requestDiscardTeamMatchingVersion,
    requestSwapTeamMembers,
    requestTeamMatchingJob,
    requestTeamMatchingVersionDetail,
    requestTeamMatchingVersionDiff,
    requestTeamMatchingVersionList,
    requestTeamRecommendationsByGrade,
} from "../../../api/teamApi";
import { requestAdminDashboard } from "../../../api/dashboardApi";
import styles from "./AdminTeamEdit.module.css";
import {
    getRoleSummary,
    normalizeRecommendations,
    swapMembersInTeams,
} from "../../../utils/teamRecommendation";
import { roleLabels } from "../../../constants/team";
import useDelayedLoading from "../../../hooks/useDelayedLoading";
import { getAdminTeamCreationStatus } from "../../../utils/teamStatus";
import { setStoredAdminTeamCreated } from "../../../utils/adminTeamStatusStorage";
import {
    MATCHING_POLL_INTERVAL,
    WAITING_JOB_STATUSES,
    wait,
} from "../../../utils/matchingJobLock";
import { formatCreatedAt } from "../../../utils/format";

const VERSION_STATUS_LABELS = {
    DRAFT: "검토 중",
    APPLIED: "적용됨",
    DISCARDED: "폐기됨",
};

const AdminTeamEdit = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const grade = location.state?.grade || "GRADE_2";
    const streamingJobId = location.state?.jobId || null;
    const baseVersionId = location.state?.baseVersionId || null;
    const [teams, setTeams] = useState([]);
    const [streamingJobStatus, setStreamingJobStatus] = useState(
        streamingJobId ? "RUNNING" : null
    );
    const isStreaming = Boolean(streamingJobId) && streamingJobStatus !== "SUCCEEDED";
    const [baselineTeams, setBaselineTeams] = useState(null);
    const [reviewPending, setReviewPending] = useState(false);
    const [pendingVersionId, setPendingVersionId] = useState(null);
    const [isChangesModalOpen, setIsChangesModalOpen] = useState(false);
    const [compareTab, setCompareTab] = useState("before");
    const [diffData, setDiffData] = useState(null);
    const [isDiffLoading, setIsDiffLoading] = useState(false);
    const [diffError, setDiffError] = useState(false);
    const isLocked = isStreaming || reviewPending;
    const [selectedMember, setSelectedMember] = useState(null);
    const [highlightedUserIds, setHighlightedUserIds] = useState([]);
    const [flippedTeamIds, setFlippedTeamIds] = useState([]);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const showLoading = useDelayedLoading(isLoading);
    const highlightTimerRef = useRef(null);
    const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
    const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
    const [versionHistory, setVersionHistory] = useState([]);
    const [isVersionHistoryLoading, setIsVersionHistoryLoading] = useState(false);
    const [versionHistoryError, setVersionHistoryError] = useState("");
    const [regenerationPrompt, setRegenerationPrompt] = useState("");
    const movedByUserId = useMemo(() => {
        if (!diffData?.movedStudents) return {};

        return diffData.movedStudents.reduce((acc, moved) => {
            acc[moved.userId] = moved;
            return acc;
        }, {});
    }, [diffData]);

    const changedByTeam = useMemo(() => {
        if (!diffData?.movedStudents) return [];

        const groups = new Map();

        diffData.movedStudents.forEach((moved) => {
            if (!groups.has(moved.toTeamId)) {
                groups.set(moved.toTeamId, {
                    teamId: moved.toTeamId,
                    teamName: moved.toTeamName,
                    students: [],
                });
            }

            groups.get(moved.toTeamId).students.push(moved);
        });

        return Array.from(groups.values());
    }, [diffData]);

    const selectedMemberName = useMemo(() => {
        if (!selectedMember) return "";

        return teams
            .find((team) => team.id === selectedMember.recommendationId)
            ?.members.find((member) => member.userId === selectedMember.userId)
            ?.name;
    }, [selectedMember, teams]);

    const getRecommendations = useCallback(
        async (targetGrade = grade) => {
            try {
                setIsLoading(true);
                setError("");

                const data = await requestTeamRecommendationsByGrade(
                    targetGrade
                );
                setTeams(
                    Array.isArray(data) ? normalizeRecommendations(data) : []
                );
            } catch {
                setError("팀 추천안을 불러오지 못했습니다.");
            } finally {
                setIsLoading(false);
            }
        },
        [grade]
    );

    useEffect(() => {
        if (!streamingJobId) {
            getRecommendations(grade);
            return undefined;
        }

        // ponytail: 로딩 화면이 첫 팀만 도착하면 넘어오므로, 여기서 나머지 팀을
        // 이어서 폴링해 도착하는 대로 teams에 추가한다. 다 끝나면(SUCCEEDED)
        // 스왑 등에 필요한 확정 ID를 얻기 위해 한 번 더 정식 조회로 교체한다.
        let ignore = false;

        const pollRemainingTeams = async () => {
            try {
                setError("");

                if (baseVersionId) {
                    try {
                        const baseline = await requestTeamMatchingVersionDetail(
                            baseVersionId
                        );
                        if (!ignore) {
                            setBaselineTeams(
                                Array.isArray(baseline)
                                    ? normalizeRecommendations(baseline)
                                    : []
                            );
                        }
                    } catch {
                        // ponytail: baseline 조회 실패해도 스트리밍은 계속 진행 — 이 경우 "변경사항" 비교만 못 하게 됨
                        if (!ignore) {
                            setMessage(
                                "이전 결과를 불러오지 못해 변경사항 비교가 제한될 수 있습니다."
                            );
                        }
                    }
                }

                let currentJob = await requestTeamMatchingJob(streamingJobId);

                while (
                    !ignore &&
                    WAITING_JOB_STATUSES.includes(currentJob?.status)
                ) {
                    const partialTeams = Array.isArray(currentJob?.partialTeams)
                        ? normalizeRecommendations(currentJob.partialTeams)
                        : [];

                    setTeams(partialTeams);
                    setStreamingJobStatus(currentJob?.status);
                    setIsLoading(false);

                    await wait(MATCHING_POLL_INTERVAL);
                    if (ignore) return;

                    currentJob = await requestTeamMatchingJob(streamingJobId);
                }

                if (ignore) return;

                setStreamingJobStatus(currentJob?.status);

                if (currentJob?.status === "SUCCEEDED") {
                    if (baseVersionId && currentJob?.versionId) {
                        const finalTeams = await requestTeamMatchingVersionDetail(
                            currentJob.versionId
                        );
                        if (!ignore) {
                            setTeams(
                                Array.isArray(finalTeams)
                                    ? normalizeRecommendations(finalTeams)
                                    : []
                            );
                            setPendingVersionId(currentJob.versionId);
                            setReviewPending(true);
                            setIsLoading(false);
                        }
                        return;
                    }

                    await getRecommendations(grade);
                    return;
                }

                setError(
                    currentJob?.errorMessage ||
                        "일부 팀 생성에 실패했습니다. 이미 도착한 팀은 그대로 남아있습니다."
                );
                setIsLoading(false);
            } catch {
                if (!ignore) {
                    setError("팀 추천안을 불러오지 못했습니다.");
                    setIsLoading(false);
                }
            }
        };

        pollRemainingTeams();

        return () => {
            ignore = true;
        };
    }, [streamingJobId, grade, getRecommendations, baseVersionId]);

    useEffect(() => {
        const preventUnload = (event) => {
            event.preventDefault();
            event.returnValue = "";
        };

        const preventBack = () => {
            window.history.pushState(null, "", window.location.href);
        };

        window.history.pushState(null, "", window.location.href);
        window.addEventListener("beforeunload", preventUnload);
        window.addEventListener("popstate", preventBack);

        return () => {
            window.removeEventListener("beforeunload", preventUnload);
            window.removeEventListener("popstate", preventBack);
        };
    }, []);

    useEffect(() => {
        return () => {
            if (highlightTimerRef.current) {
                clearTimeout(highlightTimerRef.current);
            }
        };
    }, []);

    const handleMemberClick = async (recommendationId, userId) => {
        if (isStreaming) {
            setMessage("팀 생성이 모두 끝나면 수정할 수 있습니다.");
            return;
        }

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
        const currentVersionId = teams[0]?.matchingVersionId || null;

        navigate("/admin/team-create/loading", {
            state: {
                grade,
                regenerationPrompt,
                baseVersionId: currentVersionId,
            },
        });
    };

    const openChangesModal = async () => {
        setIsChangesModalOpen(true);
        setCompareTab("before");
        setDiffError(false);

        if (!baseVersionId || !pendingVersionId) return;

        try {
            setIsDiffLoading(true);
            const diff = await requestTeamMatchingVersionDiff(
                baseVersionId,
                pendingVersionId
            );
            setDiffData(diff);
        } catch {
            setDiffData(null);
            setDiffError(true);
        } finally {
            setIsDiffLoading(false);
        }
    };

    const closeChangesModal = () => setIsChangesModalOpen(false);

    const openVersionHistory = async () => {
        setIsVersionHistoryOpen(true);

        try {
            setIsVersionHistoryLoading(true);
            setVersionHistoryError("");
            const versions = await requestTeamMatchingVersionList(grade);
            setVersionHistory(Array.isArray(versions) ? versions : []);
        } catch {
            setVersionHistoryError("버전 이력을 불러오지 못했습니다.");
        } finally {
            setIsVersionHistoryLoading(false);
        }
    };

    const closeVersionHistory = () => setIsVersionHistoryOpen(false);

    const handleApplyChanges = async () => {
        if (!pendingVersionId) return;

        try {
            await requestApplyTeamMatchingVersion(pendingVersionId);
            setReviewPending(false);
            setBaselineTeams(null);
            setPendingVersionId(null);
            setDiffData(null);
            setIsChangesModalOpen(false);
            setMessage("재생성 결과가 적용되었습니다.");
        } catch {
            setMessage("결과 적용에 실패했습니다.");
        }
    };

    const handleDiscardChanges = async () => {
        if (!pendingVersionId) return;

        try {
            await requestDiscardTeamMatchingVersion(pendingVersionId);
            setTeams(baselineTeams || []);
            setReviewPending(false);
            setBaselineTeams(null);
            setPendingVersionId(null);
            setDiffData(null);
            setIsChangesModalOpen(false);
            setMessage("재생성을 취소했습니다. 기존 팀 배정이 유지됩니다.");
        } catch {
            setMessage("취소 처리에 실패했습니다.");
        }
    };
    const handleApprove = async () => {
        try {
            await requestAcceptAllTeamRecommendations(grade);

            let teamManageAccessible = false;

            try {
                const dashboard = await requestAdminDashboard({ force: true });

                teamManageAccessible =
                    getAdminTeamCreationStatus(dashboard).teamManageAccessible;
            } catch {
                teamManageAccessible = false;
            }

            setStoredAdminTeamCreated(teamManageAccessible);

            navigate(
                teamManageAccessible ? "/admin/team-manage" : "/admin/team-create",
                {
                    replace: true,
                }
            );
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
                            {reviewPending && (
                                <button
                                    type="button"
                                    className={styles.changesButton}
                                    onClick={openChangesModal}
                                    disabled={isStreaming}
                                >
                                    변경사항
                                    {diffData?.movedStudents?.length ? (
                                        <span className={styles.changesCount}>
                                            {diffData.movedStudents.length}
                                        </span>
                                    ) : null}
                                </button>
                            )}
                            <button
                                type="button"
                                className={styles.secondaryButton}
                                onClick={openVersionHistory}
                            >
                                버전 이력
                            </button>
                            <button
                                type="button"
                                className={styles.secondaryButton}
                                onClick={handleRegenerate}
                                disabled={isLocked}
                            >
                                재생성
                            </button>
                            <button
                                type="button"
                                className={styles.primaryButton}
                                onClick={handleApprove}
                                disabled={isLocked}
                            >
                                팀 구성 승인
                            </button>
                        </div>
                    </div>

                    {isStreaming && (
                        <p className={styles.messageText}>
                            팀이 생성되는 대로 이 화면에 순서대로 나타납니다
                            (현재 {teams.length}팀 도착) — 완료되면 수정할 수
                            있습니다.
                        </p>
                    )}
                    {reviewPending && !isStreaming && (
                        <p className={styles.messageText}>
                            재생성 결과 검토 대기 — 변경사항에서 확인 후 적용
                            또는 취소
                        </p>
                    )}
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
                            {showLoading &&
                                "팀 추천안을 불러오는 중입니다."}
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
            {isChangesModalOpen && (
                <div className={styles.modalOverlay}>
                    <section className={styles.changesModal}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>
                                재생성 전·후 비교
                            </h2>
                            <button
                                type="button"
                                className={styles.modalCloseButton}
                                onClick={closeChangesModal}
                            >
                                ×
                            </button>
                        </div>

                        <div className={styles.compareTabs}>
                            <button
                                type="button"
                                className={`${styles.compareTab} ${
                                    compareTab === "before"
                                        ? styles.compareTabActive
                                        : ""
                                }`}
                                onClick={() => setCompareTab("before")}
                            >
                                이전 결과
                            </button>
                            <button
                                type="button"
                                className={`${styles.compareTab} ${
                                    compareTab === "after"
                                        ? styles.compareTabActive
                                        : ""
                                }`}
                                onClick={() => setCompareTab("after")}
                            >
                                재생성 결과
                            </button>
                            <button
                                type="button"
                                className={`${styles.compareTab} ${
                                    compareTab === "changed"
                                        ? styles.compareTabActive
                                        : ""
                                }`}
                                onClick={() => setCompareTab("changed")}
                            >
                                변경된 항목만 보기
                                {diffData?.movedStudents?.length ? (
                                    <span className={styles.compareTabCount}>
                                        {diffData.movedStudents.length}명
                                    </span>
                                ) : null}
                            </button>
                        </div>

                        <div className={styles.compareBody}>
                            {isDiffLoading ? (
                                <p className={styles.messageText}>
                                    비교 결과를 불러오는 중입니다.
                                </p>
                            ) : diffError ? (
                                <p className={styles.messageText}>
                                    변경사항을 불러오지 못했습니다. 다시 시도해주세요.
                                </p>
                            ) : compareTab === "changed" ? (
                                changedByTeam.length === 0 ? (
                                    <p className={styles.messageText}>
                                        변경된 학생이 없습니다.
                                    </p>
                                ) : (
                                    <div className={styles.compareGrid}>
                                        {changedByTeam.map((group) => (
                                            <article
                                                key={group.teamId}
                                                className={styles.diffCard}
                                            >
                                                <header
                                                    className={
                                                        styles.diffHeader
                                                    }
                                                >
                                                    <h3>
                                                        {group.teamName}로
                                                        이동
                                                    </h3>
                                                    <div
                                                        className={
                                                            styles.roleLegend
                                                        }
                                                    >
                                                        {group.students.length}
                                                        명 이동
                                                    </div>
                                                </header>
                                                <ul
                                                    className={
                                                        styles.diffMemberList
                                                    }
                                                >
                                                    {group.students.map(
                                                        (student) => (
                                                            <li
                                                                key={
                                                                    student.userId
                                                                }
                                                                className={`${styles.diffMember} ${styles.diffMemberChanged}`}
                                                            >
                                                                <div>
                                                                    <div
                                                                        className={
                                                                            styles.diffMemberName
                                                                        }
                                                                    >
                                                                        {
                                                                            student.name
                                                                        }
                                                                    </div>
                                                                </div>
                                                                <span
                                                                    className={
                                                                        styles.diffMemberMoved
                                                                    }
                                                                >
                                                                    {
                                                                        student.fromTeamName
                                                                    }{" "}
                                                                    →{" "}
                                                                    {
                                                                        student.toTeamName
                                                                    }
                                                                </span>
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            </article>
                                        ))}
                                    </div>
                                )
                            ) : (
                                <div className={styles.compareGrid}>
                                    {(compareTab === "before"
                                        ? baselineTeams || []
                                        : teams
                                    ).map((team, index) => (
                                        <article
                                            key={team.id}
                                            className={styles.diffCard}
                                        >
                                            <header
                                                className={styles.diffHeader}
                                            >
                                                <h3>{index + 1}팀</h3>
                                                <div
                                                    className={
                                                        styles.roleLegend
                                                    }
                                                >
                                                    {getRoleSummary(
                                                        team.members
                                                    )}
                                                </div>
                                            </header>
                                            <ul
                                                className={
                                                    styles.diffMemberList
                                                }
                                            >
                                                {team.members.map(
                                                    (member) => {
                                                        const moved =
                                                            movedByUserId[
                                                                member.userId
                                                            ];

                                                        return (
                                                            <li
                                                                key={
                                                                    member.userId
                                                                }
                                                                className={`${
                                                                    styles.diffMember
                                                                } ${
                                                                    moved
                                                                        ? styles.diffMemberChanged
                                                                        : ""
                                                                }`}
                                                            >
                                                                <div>
                                                                    <div
                                                                        className={
                                                                            styles.diffMemberName
                                                                        }
                                                                    >
                                                                        {
                                                                            member.name
                                                                        }
                                                                        {member.recommendedLeader
                                                                            ? " · 팀장"
                                                                            : ""}
                                                                    </div>
                                                                    <div
                                                                        className={
                                                                            styles.diffMemberRole
                                                                        }
                                                                    >
                                                                        {
                                                                            roleLabels[
                                                                                member
                                                                                    .studentRole
                                                                            ]
                                                                        }{" "}
                                                                        ·{" "}
                                                                        {
                                                                            member.skill
                                                                        }
                                                                    </div>
                                                                </div>
                                                                {moved &&
                                                                compareTab ===
                                                                    "after" ? (
                                                                    <span
                                                                        className={
                                                                            styles.diffMemberMoved
                                                                        }
                                                                    >
                                                                        {
                                                                            moved.fromTeamName
                                                                        }{" "}
                                                                        →{" "}
                                                                        {
                                                                            moved.toTeamName
                                                                        }
                                                                    </span>
                                                                ) : null}
                                                            </li>
                                                        );
                                                    }
                                                )}
                                            </ul>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className={styles.modalActionArea}>
                            <button
                                type="button"
                                className={styles.modalCancelButton}
                                onClick={handleDiscardChanges}
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                className={styles.modalConfirmButton}
                                onClick={handleApplyChanges}
                            >
                                새 결과 적용
                            </button>
                        </div>
                    </section>
                </div>
            )}

            {isVersionHistoryOpen && (
                <div
                    className={styles.modalOverlay}
                    onClick={closeVersionHistory}
                >
                    <section
                        className={styles.regenerateModal}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>버전 이력</h2>
                            <button
                                type="button"
                                className={styles.modalCloseButton}
                                onClick={closeVersionHistory}
                            >
                                ×
                            </button>
                        </div>

                        {isVersionHistoryLoading ? (
                            <p className={styles.modalDescription}>
                                불러오는 중입니다.
                            </p>
                        ) : versionHistoryError ? (
                            <p className={styles.modalDescription}>
                                {versionHistoryError}
                            </p>
                        ) : versionHistory.length === 0 ? (
                            <p className={styles.modalDescription}>
                                아직 생성된 버전이 없습니다.
                            </p>
                        ) : (
                            <ul className={styles.diffMemberList}>
                                {versionHistory.map((version) => (
                                    <li
                                        key={version.versionId}
                                        className={styles.diffMember}
                                    >
                                        <div>
                                            <span
                                                className={
                                                    styles.diffMemberName
                                                }
                                            >
                                                v{version.versionNumber} ·{" "}
                                                {VERSION_STATUS_LABELS[
                                                    version.status
                                                ] || version.status}
                                            </span>
                                            {version.regenerationPrompt && (
                                                <p
                                                    className={
                                                        styles.diffMemberRole
                                                    }
                                                >
                                                    {version.regenerationPrompt}
                                                </p>
                                            )}
                                        </div>
                                        <span
                                            className={styles.diffMemberMoved}
                                        >
                                            {formatCreatedAt(
                                                version.createdAt
                                            )}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
};

export default AdminTeamEdit;
