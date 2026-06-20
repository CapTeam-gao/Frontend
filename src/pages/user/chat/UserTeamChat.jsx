import { Fragment, useEffect, useRef, useState } from "react";
import Header from "../../../components/common/header/Header";
import ChatChannel from "../../../components/common/chat/ChatChannel";
import ChatMessage from "../../../components/common/chat/ChatMessage";
import ChatInput from "../../../components/common/chat/ChatInput";
import {
    requestChatMessages,
    requestCreateChatChannel,
    requestChatPresence,
    requestMarkChatAsRead,
    requestMyChatRoom,
} from "../../../api/chatApi";
import authStore from "../../../store/authStore";
import styles from "./UserTeamChat.module.css";
import {
    formatDateDivider,
    getMessageDateKey,
    getMessageMinuteKey,
} from "../../../utils/chat.js";

import {
    createChatClient,
    sendChatSocketMessage,
    subscribeChatChannel,
    subscribeTeamPresence,
} from "../../../api/chatSocket.js";
import useDelayedLoading from "../../../hooks/useDelayedLoading";

const SELECTED_CHAT_CHANNEL_STORAGE_KEY = "capteam-selected-chat-channel-id";

const UserTeamChat = () => {
    const user = authStore((state) => state.user);
    const currentUserId = user?.userId;

    const chatClientRef = useRef(null);
    const subscriptionRef = useRef(null);
    const presenceSubscriptionRef = useRef(null);

    const [room, setRoom] = useState(null);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMessageLoading, setIsMessageLoading] = useState(false);
    const [isPresenceLoading, setIsPresenceLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState("");
    const [socketConnected, setSocketConnected] = useState(false);
    const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
    const [members, setMembers] = useState([]);
    const [presenceTeamId, setPresenceTeamId] = useState(null);
    const [newChannelName, setNewChannelName] = useState("");
    const [channelCreateError, setChannelCreateError] = useState("");
    const [isCreatingChannel, setIsCreatingChannel] = useState(false);
    const messagesEndRef = useRef(null);
    const showLoading = useDelayedLoading(isLoading);
    const showMessageLoading = useDelayedLoading(isMessageLoading);
    const memberStatusList = isPresenceLoading ? [] : members;
    const onlineMembers = memberStatusList.filter((member) => member.online);
    const offlineMembers = memberStatusList.filter((member) => !member.online);

    const updateSelectedChannel = (channel) => {
        setSelectedChannel(channel);

        if (channel?.id) {
            localStorage.setItem(
                SELECTED_CHAT_CHANNEL_STORAGE_KEY,
                String(channel.id)
            );
        }
    };

    useEffect(() => {
        const getChatRoom = async () => {
            try {
                const roomData = await requestMyChatRoom();
                const channels = roomData.channels ?? [];
                const storedChannelId = localStorage.getItem(
                    SELECTED_CHAT_CHANNEL_STORAGE_KEY
                );
                const storedChannel = channels.find(
                    (channel) => String(channel.id) === storedChannelId
                );
                const firstChannel = channels[0] ?? null;

                setRoom(roomData);
                setSelectedChannel(storedChannel ?? firstChannel);
            } catch {
                setError("채팅방 정보를 불러오지 못했습니다.");
            } finally {
                setIsLoading(false);
            }
        };

        getChatRoom();
    }, []);
    useEffect(() => {
        const client = createChatClient({
            onConnect: () => {
                setSocketConnected(true);
            },
            onError: () => {
                setSocketConnected(false);
                setError("실시간 채팅 연결에 실패했습니다.");
            },
        });

        chatClientRef.current = client;
        client.activate();

        return () => {
            subscriptionRef.current?.unsubscribe();
            presenceSubscriptionRef.current?.unsubscribe();

            client.reconnectDelay = 0;
            client.deactivate({ force: true });
            setSocketConnected(false);
        };
    }, []);

    useEffect(() => {
        if (!selectedChannel?.id) return;

        const getMessages = async () => {
            try {
                setIsMessageLoading(true);
                const data = await requestChatMessages(selectedChannel.id);
                const messageList = data.content ?? [];

                setMessages([...messageList].reverse());
                await requestMarkChatAsRead(selectedChannel.id);
            } catch {
                setError("메시지를 불러오지 못했습니다.");
            } finally {
                setIsMessageLoading(false);
            }
        };

        getMessages();
    }, [selectedChannel]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            block: "end",
        });
    }, [messages]);

    useEffect(() => {
        if (!selectedChannel?.id || !socketConnected) return;

        subscriptionRef.current?.unsubscribe();

        subscriptionRef.current = subscribeChatChannel(
            chatClientRef.current,
            selectedChannel.id,
            (receivedMessage) => {
                setMessages((prevMessages) => {
                    const alreadyExists = prevMessages.some(
                        (message) => message.id === receivedMessage.id
                    );

                    if (alreadyExists) return prevMessages;

                    return [...prevMessages, receivedMessage];
                });

                requestMarkChatAsRead(selectedChannel.id);
            }
        );

        return () => {
            subscriptionRef.current?.unsubscribe();
        };
    }, [selectedChannel, socketConnected]);

    useEffect(() => {
        if (!selectedChannel?.id) return;

        const getPresence = async () => {
            try {
                setIsPresenceLoading(true);
                const data = await requestChatPresence(selectedChannel.id);

                setPresenceTeamId(data.teamId);
                setMembers(data.members ?? []);
            } catch {
                setError("팀원 접속 상태를 불러오지 못했습니다.");
            } finally {
                setIsPresenceLoading(false);
            }
        };

        getPresence();
    }, [selectedChannel?.id, socketConnected]);
    useEffect(() => {
        if (!presenceTeamId || !socketConnected) return;

        presenceSubscriptionRef.current?.unsubscribe();

        presenceSubscriptionRef.current = subscribeTeamPresence(
            chatClientRef.current,
            presenceTeamId,
            (presenceEvent) => {
                setMembers((prevMembers) => {
                    const alreadyExists = prevMembers.some(
                        (member) => member.userId === presenceEvent.userId
                    );

                    if (!alreadyExists) {
                        return [...prevMembers, presenceEvent];
                    }

                    return prevMembers.map((member) =>
                        member.userId === presenceEvent.userId
                            ? {
                                  ...member,
                                  ...presenceEvent,
                              }
                            : member
                    );
                });
            }
        );

        return () => {
            presenceSubscriptionRef.current?.unsubscribe();
        };
    }, [presenceTeamId, socketConnected]);

    const handleSendMessage = async (message) => {
        if (!selectedChannel?.id) return;

        const client = chatClientRef.current;

        if (!client?.connected) {
            setError("채팅 서버와 연결되지 않았습니다.");
            return;
        }

        try {
            setIsSending(true);

            sendChatSocketMessage(client, selectedChannel.id, message);
        } catch {
            setError("메시지 전송에 실패했습니다.");
        } finally {
            setIsSending(false);
        }
    };
    const handleCreateChannel = async () => {
        const trimmedChannelName = newChannelName.trim();

        if (!trimmedChannelName) {
            setChannelCreateError("채널 이름을 입력해주세요.");
            return;
        }

        if (!room?.id) {
            setChannelCreateError("채팅방 정보를 찾을 수 없습니다.");
            return;
        }

        try {
            setIsCreatingChannel(true);
            setChannelCreateError("");

            const createdChannel = await requestCreateChatChannel(
                room.id,
                trimmedChannelName
            );

            setRoom((prevRoom) => ({
                ...prevRoom,
                channels: [...(prevRoom.channels ?? []), createdChannel],
            }));

            updateSelectedChannel(createdChannel);
            setMessages([]);
            setNewChannelName("");
            setIsChannelModalOpen(false);
        } catch {
            setChannelCreateError("채널 생성에 실패했습니다.");
        } finally {
            setIsCreatingChannel(false);
        }
    };
    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.panel}>
                <section className={styles.chatLayout}>
                    <aside className={styles.sidebar}>
                        <div className={styles.sidebarHeader}>
                            <h1>{room?.teamName || "팀 채팅"}</h1>
                            <p>프로젝트 대화 공간</p>
                        </div>

                        <div className={styles.channelArea}>
                            <div className={styles.sectionTitle}>
                                <span>채널</span>
                                <button
                                    type="button"
                                    className={styles.addChannelButton}
                                    aria-label="채널 추가"
                                    onClick={() => setIsChannelModalOpen(true)}
                                >
                                    +
                                </button>
                            </div>

                            <div className={styles.channelList}>
                                {room?.channels?.map((channel) => (
                                    <ChatChannel
                                        key={channel.id}
                                        channel={channel}
                                        selected={
                                            selectedChannel?.id === channel.id
                                        }
                                        onClick={() =>
                                            updateSelectedChannel(channel)
                                        }
                                    />
                                ))}
                            </div>
                        </div>
                    </aside>

                    <section className={styles.chatContent}>
                        {error && <p className={styles.errorText}>{error}</p>}

                        <div className={styles.messageArea}>
                            {isLoading ? (
                                <p className={styles.emptyText}>
                                    {showLoading &&
                                        "채팅방을 불러오는 중입니다."}
                                </p>
                            ) : isMessageLoading ? (
                                <p className={styles.emptyText}>
                                    {showMessageLoading &&
                                        "메시지를 불러오는 중입니다."}
                                </p>
                            ) : !selectedChannel ? (
                                <p className={styles.emptyText}>
                                    생성된 채팅 채널이 없습니다.
                                </p>
                            ) : messages.length === 0 ? (
                                <p className={styles.emptyText}>
                                    아직 작성된 메시지가 없습니다.
                                </p>
                            ) : (
                                <ul className={styles.messageList}>
                                    {messages.map((message, index) => {
                                        const prevMessage = messages[index - 1];

                                        const currentMinuteKey =
                                            getMessageMinuteKey(
                                                message.createdAt
                                            );
                                        const prevMinuteKey =
                                            getMessageMinuteKey(
                                                prevMessage?.createdAt
                                            );

                                        const currentDateKey =
                                            getMessageDateKey(
                                                message.createdAt
                                            );
                                        const prevDateKey = getMessageDateKey(
                                            prevMessage?.createdAt
                                        );

                                        const showTime =
                                            currentMinuteKey !== prevMinuteKey;
                                        const showDateDivider =
                                            currentDateKey !== prevDateKey;

                                        const messageKey =
                                            message.id ??
                                            `${message.senderId}-${message.createdAt}-${index}`;

                                        return (
                                            <Fragment key={messageKey}>
                                                {showDateDivider && (
                                                    <li
                                                        className={
                                                            styles.dateDivider
                                                        }
                                                    >
                                                        <span>
                                                            {formatDateDivider(
                                                                message.createdAt
                                                            )}
                                                        </span>
                                                    </li>
                                                )}

                                                <ChatMessage
                                                    message={message}
                                                    mine={
                                                        message.senderId ===
                                                        currentUserId
                                                    }
                                                    showTime={showTime}
                                                />
                                            </Fragment>
                                        );
                                    })}

                                    <li
                                        ref={messagesEndRef}
                                        className={styles.messageEnd}
                                    />
                                </ul>
                            )}
                        </div>

                        <ChatInput
                            onSend={handleSendMessage}
                            disabled={!selectedChannel}
                            isSending={isSending}
                        />
                    </section>

                    <aside className={styles.memberSidebar}>
                        <div className={styles.memberSidebarHeader}>
                            <strong>팀원</strong>
                            <span>{memberStatusList.length}명</span>
                        </div>

                        <div className={styles.memberGroup}>
                            <p className={styles.memberGroupTitle}>
                                온라인 - {onlineMembers.length}
                            </p>

                            <ul className={styles.memberList}>
                                {onlineMembers.map((member) => (
                                    <li
                                        key={member.userId}
                                        className={styles.memberItem}
                                    >
                                        <span className={styles.memberName}>
                                            {member.name}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className={styles.memberGroup}>
                            <p className={styles.memberGroupTitle}>
                                오프라인 - {offlineMembers.length}
                            </p>

                            {offlineMembers.length === 0 ? (
                                <p className={styles.memberEmptyText}>
                                    오프라인 팀원이 없습니다.
                                </p>
                            ) : (
                                <ul className={styles.memberList}>
                                    {offlineMembers.map((member) => (
                                        <li
                                            key={member.userId}
                                            className={styles.memberItem}
                                        >
                                            <span className={styles.memberName}>
                                                {member.name}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </aside>

                    {isChannelModalOpen && (
                        <div
                            className={styles.modalOverlay}
                            onClick={() => setIsChannelModalOpen(false)}
                        >
                            <section
                                className={styles.channelModal}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className={styles.channelModalHeader}>
                                    <div>
                                        <h2>채널 추가</h2>
                                    </div>
                                </div>

                                <label className={styles.channelModalField}>
                                    <span>채널 이름</span>
                                    <input
                                        type="text"
                                        placeholder="예: 프론트엔드, 백엔드, 진행상황"
                                        value={newChannelName}
                                        onChange={(e) => {
                                            setNewChannelName(e.target.value);
                                            setChannelCreateError("");
                                        }}
                                    />
                                    {channelCreateError && (
                                        <p className={styles.channelModalError}>
                                            {channelCreateError}
                                        </p>
                                    )}
                                </label>

                                <div className={styles.channelModalActions}>
                                    <button
                                        type="button"
                                        className={styles.cancelButton}
                                        onClick={() =>
                                            setIsChannelModalOpen(false)
                                        }
                                    >
                                        취소
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.createButton}
                                        disabled={isCreatingChannel}
                                        onClick={handleCreateChannel}
                                    >
                                        {isCreatingChannel ? "추가 중" : "추가"}
                                    </button>
                                </div>
                            </section>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default UserTeamChat;
