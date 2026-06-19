import { Fragment, useEffect, useRef, useState } from "react";
import Header from "../../../components/common/header/Header";
import ChatChannel from "../../../components/common/chat/ChatChannel";
import ChatMessage from "../../../components/common/chat/ChatMessage";
import ChatInput from "../../../components/common/chat/ChatInput";
import {
    requestChatMessages,
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
} from "../../../api/chatSocket.js";

const UserTeamChat = () => {
    const user = authStore((state) => state.user);
    const currentUserId = user?.userId;

    const chatClientRef = useRef(null);
    const subscriptionRef = useRef(null);

    const [room, setRoom] = useState(null);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState("");
    const [socketConnected, setSocketConnected] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const getChatRoom = async () => {
            try {
                const roomData = await requestMyChatRoom();
                const firstChannel = roomData.channels?.[0] ?? null;

                setRoom(roomData);
                setSelectedChannel(firstChannel);
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
            client.deactivate();
            setSocketConnected(false);
        };
    }, []);

    useEffect(() => {
        if (!selectedChannel?.id) return;

        const getMessages = async () => {
            try {
                const data = await requestChatMessages(selectedChannel.id);
                const messageList = data.content ?? [];

                setMessages([...messageList].reverse());
                await requestMarkChatAsRead(selectedChannel.id);
            } catch {
                setError("메시지를 불러오지 못했습니다.");
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
                                            setSelectedChannel(channel)
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
                                    채팅방을 불러오는 중입니다.
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

                                        return (
                                            <Fragment key={message.id}>
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
                </section>
            </main>
        </div>
    );
};

export default UserTeamChat;
