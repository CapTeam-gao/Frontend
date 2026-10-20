// Design v3 팀 상세 서랍. 오른쪽에서 열리고(모바일은 아래 시트), 카드 없이
// 왼쪽 이름표 + 오른쪽 내용으로 섹션을 나눈다. 상태는 점 + 글자 색으로만 표시한다.
import { useNavigate } from "react-router-dom";
import {
    gradeLabels,
    roleLabels,
    ROLE_SHADES,
    summaryRoleOrder,
} from "../../../constants/team";
import { parseMainFeatures } from "../../../utils/projectPlan";
import {
    hasProjectInfo,
    getTeamDisplayName,
} from "../../../utils/teamRecommendation";
import ModalOverlay from "../../common/modal/ModalOverlay";
import { useModalClose } from "../../common/modal/modalCloseContext";
import Skeleton from "../../common/skeleton/Skeleton";
import EmptyState from "../../common/empty/EmptyState";
import useInView from "../../../hooks/useInView";
import styles from "./AdminTeamDetailModal.module.css";

const MANUAL_TEAM_DESCRIPTION = "관리자가 직접 구성한 팀입니다.";

const getRoles = (members) => {
    const counts = members.reduce((result, member) => {
        if (member.studentRole) {
            result[member.studentRole] = (result[member.studentRole] || 0) + 1;
        }
        return result;
    }, {});

    return summaryRoleOrder
        .filter((role) => counts[role])
        .map((role, index) => ({
            role,
            count: counts[role],
            color: ROLE_SHADES[index % ROLE_SHADES.length],
        }));
};

const CloseButton = () => {
    const close = useModalClose();

    return (
        <button
            type="button"
            className={styles.closeButton}
            onClick={close}
            aria-label="팀 상세 닫기"
        >
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden="true"
            >
                <path d="m6 6 12 12M18 6 6 18" />
            </svg>
        </button>
    );
};

const DetailSkeleton = () => (
    <div className={styles.skeleton}>
        <div className={styles.facts}>
            {[0, 1, 2].map((index) => (
                <div key={index}>
                    <Skeleton width={56} height={16} />
                    <Skeleton width={96} height={24} style={{ marginTop: 10 }} />
                </div>
            ))}
        </div>
        <Skeleton height={72} style={{ marginTop: 48 }} />
        <Skeleton height={56} style={{ marginTop: 16 }} />
        <Skeleton height={56} style={{ marginTop: 8 }} />
        <Skeleton height={56} style={{ marginTop: 8 }} />
    </div>
);

const AdminTeamDetailModal = ({ team, loading, error, onClose }) => {
    const navigate = useNavigate();
    const contentRef = useInView({ replayKey: team?.teamId ?? "none" });

    const projectWritten = hasProjectInfo(team);
    const members = team?.members || [];
    const mainFeatures = parseMainFeatures(team?.mainFeatures);
    const isManualTeam = team?.strengths === MANUAL_TEAM_DESCRIPTION;
    const leader = members.find((member) => member.leaderRole === "LEADER");
    const roles = getRoles(members);
    const roleSummary = roles
        .map(({ role, count }) => `${roleLabels[role] || role} ${count}`)
        .join(" · ");

    const moveToStudentDetail = (userId) => {
        navigate(`/admin/student?userId=${encodeURIComponent(userId)}`);
    };

    return (
        <ModalOverlay
            onClose={onClose}
            variant="drawer"
            overlayClassName={styles.overlay}
            modalClassName={styles.panel}
            ariaLabelledby="admin-team-detail-modal-title"
        >
            <header className={styles.header}>
                <div className={styles.headerMain}>
                    {team && (
                        <p className={styles.kicker}>
                            <span>
                                {gradeLabels[team.grade] || team.grade} ·{" "}
                                {team.teamName}
                            </span>
                            <span
                                className={
                                    projectWritten
                                        ? styles.planDone
                                        : styles.planPending
                                }
                            >
                                기획서 작성 {projectWritten ? "완료" : "전"}
                            </span>
                        </p>
                    )}
                    <h2
                        id="admin-team-detail-modal-title"
                        className={styles.title}
                    >
                        {team
                            ? getTeamDisplayName(team, projectWritten)
                            : "팀 상세"}
                    </h2>
                    {team && (
                        <p
                            className={`${styles.subtitle} ${
                                projectWritten ? "" : styles.subtitleMuted
                            }`}
                        >
                            {projectWritten
                                ? team.serviceName
                                : "기획서를 아직 작성하지 않았어요"}
                        </p>
                    )}
                </div>

                <CloseButton />
            </header>

            <div className={styles.scrollArea}>
                {loading ? (
                    <DetailSkeleton />
                ) : error ? (
                    <EmptyState
                        variant="error"
                        title="팀 정보를 불러오지 못했어요"
                        description={error}
                    />
                ) : (
                    team && (
                        <div ref={contentRef}>
                            <dl data-reveal className={styles.facts}>
                                <div>
                                    <dt>팀원</dt>
                                    <dd>{members.length}명</dd>
                                </div>
                                <div>
                                    <dt>팀장</dt>
                                    <dd>{leader?.name || "—"}</dd>
                                </div>
                                <div className={styles.factWide}>
                                    <dt>역할 구성</dt>
                                    <dd>
                                        {roles.length > 0 ? (
                                            <>
                                                <span
                                                    className={styles.roleBar}
                                                    role="img"
                                                    aria-label={`역할 구성: ${roleSummary}`}
                                                >
                                                    {roles.map(
                                                        ({ role, count, color }) => (
                                                            <i
                                                                key={role}
                                                                style={{
                                                                    flex: count,
                                                                    backgroundColor:
                                                                        color,
                                                                }}
                                                            />
                                                        )
                                                    )}
                                                </span>
                                                <span
                                                    className={styles.roleLabels}
                                                    aria-hidden="true"
                                                >
                                                    {roles.map(
                                                        ({ role, count, color }) => (
                                                            <span key={role}>
                                                                <i
                                                                    style={{
                                                                        backgroundColor:
                                                                            color,
                                                                    }}
                                                                />
                                                                {roleLabels[role] ||
                                                                    role}{" "}
                                                                {count}
                                                            </span>
                                                        )
                                                    )}
                                                </span>
                                            </>
                                        ) : (
                                            <span className={styles.muted}>
                                                역할 정보 없음
                                            </span>
                                        )}
                                    </dd>
                                </div>
                            </dl>

                            {projectWritten ? (
                                <>
                                    <section
                                        data-reveal
                                        className={styles.section}
                                    >
                                        <h3 className={styles.sectionLabel}>
                                            서비스 소개
                                        </h3>
                                        <p className={styles.bodyText}>
                                            {team.serviceIntro || (
                                                <span className={styles.muted}>
                                                    서비스 소개가 비어 있어요.
                                                </span>
                                            )}
                                        </p>
                                    </section>

                                    {mainFeatures.length > 0 && (
                                        <section
                                            data-reveal
                                            className={styles.section}
                                        >
                                            <h3
                                                className={styles.sectionLabel}
                                            >
                                                주요 기능
                                            </h3>
                                            <ol className={styles.featureList}>
                                                {mainFeatures.map(
                                                    (feature, index) => (
                                                        <li
                                                            key={`${feature}-${index}`}
                                                        >
                                                            <span
                                                                className={
                                                                    styles.featureIndex
                                                                }
                                                            >
                                                                {index + 1}
                                                            </span>
                                                            {feature}
                                                        </li>
                                                    )
                                                )}
                                            </ol>
                                        </section>
                                    )}
                                </>
                            ) : (
                                <section data-reveal className={styles.section}>
                                    <h3 className={styles.sectionLabel}>
                                        프로젝트 기획서
                                    </h3>
                                    <p className={styles.bodyText}>
                                        <span className={styles.muted}>
                                            학생이 프로젝트 기획서를 저장하면
                                            <br />
                                            여기에서 서비스 소개와 주요 기능을
                                            볼 수 있어요.
                                        </span>
                                    </p>
                                </section>
                            )}

                            <section data-reveal className={styles.section}>
                                <h3 className={styles.sectionLabel}>
                                    팀원 구성
                                </h3>
                                <div>
                                    <ul className={styles.memberList}>
                                        {members.map((member, index) => {
                                            const roleIndex = roles.findIndex(
                                                ({ role }) =>
                                                    role === member.studentRole
                                            );

                                            return (
                                                <li key={member.userId ?? index}>
                                                    <button
                                                        type="button"
                                                        className={
                                                            styles.memberRow
                                                        }
                                                        onClick={() =>
                                                            moveToStudentDetail(
                                                                member.userId
                                                            )
                                                        }
                                                    >
                                                        <span
                                                            className={
                                                                styles.memberName
                                                            }
                                                        >
                                                            {member.name}
                                                            {member.leaderRole ===
                                                                "LEADER" && (
                                                                <b>팀장</b>
                                                            )}
                                                        </span>
                                                        <span
                                                            className={
                                                                styles.memberRole
                                                            }
                                                        >
                                                            <i
                                                                style={{
                                                                    backgroundColor:
                                                                        roles[
                                                                            roleIndex
                                                                        ]
                                                                            ?.color ??
                                                                        "#c9d1cd",
                                                                }}
                                                            />
                                                            {roleLabels[
                                                                member
                                                                    .studentRole
                                                            ] ||
                                                                member.studentRole ||
                                                                "직군 없음"}
                                                        </span>
                                                        <span
                                                            className={
                                                                styles.memberSkill
                                                            }
                                                        >
                                                            {member.skill
                                                                ?.length > 0
                                                                ? `${member.skill
                                                                      .slice(0, 3)
                                                                      .join(
                                                                          " · "
                                                                      )}${
                                                                      member
                                                                          .skill
                                                                          .length >
                                                                      3
                                                                          ? ` · +${
                                                                                member
                                                                                    .skill
                                                                                    .length -
                                                                                3
                                                                            }`
                                                                          : ""
                                                                  }`
                                                                : ""}
                                                        </span>
                                                        <span
                                                            className={
                                                                styles.memberArrow
                                                            }
                                                            aria-hidden="true"
                                                        >
                                                            →
                                                        </span>
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                    <p className={styles.hint}>
                                        학생을 누르면 학생 관리의 상세로
                                        이동해요.
                                    </p>
                                </div>
                            </section>

                            <section data-reveal className={styles.section}>
                                <h3 className={styles.sectionLabel}>
                                    AI 팀 분석
                                </h3>
                                <div className={styles.insightGrid}>
                                    <div className={styles.strength}>
                                        <b>강점</b>
                                        <p>
                                            {team.strengths ||
                                                "아직 팀 강점 정보를 받아오지 못했어요."}
                                        </p>
                                    </div>
                                    <div className={styles.weakness}>
                                        <b>약점</b>
                                        <p>
                                            {team.weaknesses ||
                                                (isManualTeam
                                                    ? MANUAL_TEAM_DESCRIPTION
                                                    : "아직 팀 약점 정보를 받아오지 못했어요.")}
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )
                )}
            </div>
        </ModalOverlay>
    );
};

export default AdminTeamDetailModal;
