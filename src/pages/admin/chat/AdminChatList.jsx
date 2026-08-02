import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/common/header/Header";
import {
    requestAdminChannelSummaries,
    requestAdminChatMessages,
    requestAdminChatRooms,
} from "../../../api/adminChatApi";
import { requestAdminTeamList } from "../../../api/teamApi";
import { gradeLabels } from "../../../utils/matchingJobLock";
import { formatChatTime } from "../../../utils/chat";
import styles from "./AdminChatList.module.css";

const GRADE_ORDER = ["GRADE_2", "GRADE_3"];

const getRoomPreview = async (room) => {
    const firstChannel = room.channels?.[0];

    if (!firstChannel) {
        return { lastMessage: null, unreadCount: 0 };
    }

    const [messagePage, channelSummaries] = await Promise.all([
        requestAdminChatMessages(firstChannel.id, { page: 0, size: 1 }).catch(
            () => null
        ),
        requestAdminChannelSummaries(room.id).catch(() => []),
    ]);

    const lastMessage =
        (Array.isArray(messagePage?.content) && messagePage.content[0]) ||
        null;
    const unreadCount = (channelSummaries ?? []).reduce(
        (total, summary) => total + Number(summary.unreadCount ?? 0),
        0
    );

    return { lastMessage, unreadCount };
};

const AdminChatList = () => {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [keyword, setKeyword] = useState("");
    const [activeGrade, setActiveGrade] = useState("");

    useEffect(() => {
        const getRooms = async () => {
            try {
                setIsLoading(true);
                setError("");

                const [roomList, teamList] = await Promise.all([
                    requestAdminChatRooms(),
                    requestAdminTeamList().catch(() => []),
                ]);

                const normalizedRooms = Array.isArray(roomList)
                    ? roomList
                    : [];
                const teamsByName = new Map(
                    (Array.isArray(teamList) ? teamList : []).map((team) => [
                        team.teamName,
                        team,
                    ])
                );

                const joinedRooms = await Promise.all(
                    normalizedRooms.map(async (room) => {
                        const team = teamsByName.get(room.teamName);
                        const { lastMessage, unreadCount } =
                            await getRoomPreview(room);

                        return {
                            ...room,
                            grade: team?.grade ?? "",
                            memberCount: team?.members?.length ?? 0,
                            lastMessage,
                            unreadCount,
                        };
                    })
                );

                setRooms(joinedRooms);

                const firstGrade = GRADE_ORDER.find((grade) =>
                    joinedRooms.some((room) => room.grade === grade)
                );
                setActiveGrade(firstGrade ?? "");
            } catch {
                setError("채팅방 목록을 불러오지 못했습니다.");
            } finally {
                setIsLoading(false);
            }
        };

        getRooms();
    }, []);

    const gradeTabs = useMemo(
        () =>
            GRADE_ORDER.filter((grade) =>
                rooms.some((room) => room.grade === grade)
            ),
        [rooms]
    );

    const visibleRooms = rooms.filter((room) => {
        const matchesGrade = !activeGrade || room.grade === activeGrade;
        const matchesKeyword = (room.teamName ?? "")
            .toLowerCase()
            .includes(keyword.toLowerCase());

        return matchesGrade && matchesKeyword;
    });

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.content}>
                <h1 className={styles.title}>채팅 관리</h1>
                <p className={styles.subtitle}>
                    팀을 선택하면 채팅방으로 이동합니다.
                </p>

                <div className={styles.controlRow}>
                    {gradeTabs.length > 0 && (
                        <div className={styles.gradeTabs}>
                            {gradeTabs.map((grade) => (
                                <button
                                    key={grade}
                                    type="button"
                                    className={`${styles.gradeTab} ${
                                        activeGrade === grade
                                            ? styles.activeGradeTab
                                            : ""
                                    }`}
                                    onClick={() => setActiveGrade(grade)}
                                >
                                    {gradeLabels[grade] ?? grade}
                                </button>
                            ))}
                        </div>
                    )}

                    <input
                        type="text"
                        className={styles.search}
                        placeholder="팀명을 검색하세요"
                        value={keyword}
                        onChange={(event) => setKeyword(event.target.value)}
                    />
                </div>

                {error && <p className={styles.errorText}>{error}</p>}

                <div className={styles.chatList}>
                    {isLoading && (
                        <p className={styles.emptyText}>
                            채팅방 목록을 불러오는 중입니다.
                        </p>
                    )}

                    {!isLoading && visibleRooms.length === 0 && (
                        <p className={styles.emptyText}>
                            {keyword
                                ? "검색 결과가 없습니다."
                                : "채팅방이 없습니다."}
                        </p>
                    )}

                    {!isLoading &&
                        visibleRooms.map((room) => (
                            <button
                                key={room.id}
                                type="button"
                                className={styles.chatRow}
                                onClick={() =>
                                    navigate(`/admin/chat/${room.id}`)
                                }
                            >
                                <div className={styles.chatMain}>
                                    <div className={styles.chatTitleRow}>
                                        <span className={styles.chatTeam}>
                                            {room.teamName}
                                        </span>
                                        {room.grade && (
                                            <span
                                                className={styles.gradeBadge}
                                            >
                                                {gradeLabels[room.grade] ??
                                                    room.grade}
                                            </span>
                                        )}
                                        {room.unreadCount > 0 && (
                                            <span
                                                className={styles.unreadDot}
                                            />
                                        )}
                                    </div>

                                    <p
                                        className={`${styles.chatPreview} ${
                                            room.lastMessage
                                                ? ""
                                                : styles.emptyPreview
                                        }`}
                                    >
                                        {room.lastMessage ? (
                                            <>
                                                <b>
                                                    {
                                                        room.lastMessage
                                                            .senderName
                                                    }
                                                    :
                                                </b>{" "}
                                                {room.lastMessage.message ??
                                                    "파일을 보냈습니다."}
                                            </>
                                        ) : (
                                            "아직 대화가 없습니다."
                                        )}
                                    </p>
                                </div>

                                <div className={styles.chatMeta}>
                                    {room.lastMessage && (
                                        <div className={styles.chatTime}>
                                            {formatChatTime(
                                                room.lastMessage.createdAt
                                            )}
                                        </div>
                                    )}
                                    <div className={styles.chatMembers}>
                                        팀원 {room.memberCount}명
                                    </div>
                                </div>
                            </button>
                        ))}
                </div>
            </main>
        </div>
    );
};

export default AdminChatList;
