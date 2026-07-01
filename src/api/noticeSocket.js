import { getSocketBaseUrl } from "./baseUrl";

const makeNoticeSocketUrl = () => {
    const baseUrl = getSocketBaseUrl();
    const url = new URL(baseUrl);

    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    url.pathname = "/ws";
    url.search = "";
    url.hash = "";

    return url.toString();
};

const makeFrame = (command, headers = {}, body = "") => {
    const headerLines = Object.entries(headers)
        .map(([key, value]) => `${key}:${value}`)
        .join("\n");

    return `${command}\n${headerLines}\n\n${body}\0`;
};

const parseFrames = (data) => {
    return String(data)
        .split("\0")
        .map((rawFrame) => rawFrame.trim())
        .filter(Boolean)
        .map((rawFrame) => {
            const [headerPart, body = ""] = rawFrame.split("\n\n");
            const [command, ...headerLines] = headerPart.split("\n");
            const headers = headerLines.reduce((acc, line) => {
                const separatorIndex = line.indexOf(":");

                if (separatorIndex === -1) return acc;

                const key = line.slice(0, separatorIndex);
                const value = line.slice(separatorIndex + 1);

                acc[key] = value;
                return acc;
            }, {});

            return { command, headers, body };
        });
};

export const subscribeNoticeCreated = (accessToken, onNoticeCreated) => {
    if (!accessToken) return () => {};

    let socket = null;
    let reconnectTimer = null;
    let closedByPage = false;

    const connect = () => {
        socket = new WebSocket(makeNoticeSocketUrl());

        socket.onopen = () => {
            socket.send(
                makeFrame("CONNECT", {
                    Authorization: `Bearer ${accessToken}`,
                    "accept-version": "1.2",
                    "heart-beat": "10000,10000",
                })
            );
        };

        socket.onmessage = (message) => {
            parseFrames(message.data).forEach((frame) => {
                if (frame.command === "CONNECTED") {
                    socket.send(
                        makeFrame("SUBSCRIBE", {
                            id: "notice-created-subscription",
                            destination: "/sub/notices",
                        })
                    );
                    return;
                }

                if (frame.command === "MESSAGE") {
                    const event = JSON.parse(frame.body);

                    if (event.eventType === "NOTICE_CREATED") {
                        onNoticeCreated(event);
                    }
                }
            });
        };

        socket.onerror = (error) => {
            console.error("공지 WebSocket 연결 오류", error);
        };

        socket.onclose = () => {
            if (closedByPage) return;

            reconnectTimer = window.setTimeout(connect, 5000);
        };
    };

    connect();

    return () => {
        closedByPage = true;
        window.clearTimeout(reconnectTimer);

        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(makeFrame("DISCONNECT"));
        }

        socket?.close();
    };
};
