export const CHAT_UNREAD_CHANGE_EVENT = "capteam-chat-unread-change";

const MESSAGE_LINK_REGEX = /(https?:\/\/[^\s]+)/g;
const TRAILING_PUNCTUATION_REGEX = /[.,!?)]$/;
const TIMEZONE_PATTERN = /(Z|[+-]\d{2}:\d{2})$/;

export const parseChatDate = (createdAt) => {
    if (!createdAt) return null;

    const timestamp = String(createdAt);
    const date = new Date(
        TIMEZONE_PATTERN.test(timestamp) ? timestamp : `${timestamp}Z`
    );

    return Number.isNaN(date.getTime()) ? null : date;
};

export const formatChatTime = (createdAt) => {
    const date = parseChatDate(createdAt);

    if (!date) return "";

    return new Intl.DateTimeFormat("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
};

export const parseMessageTextWithLinks = (messageText = "") => {
    const parts = [];
    let lastIndex = 0;

    messageText.replace(MESSAGE_LINK_REGEX, (matchedUrl, _match, offset) => {
        if (offset > lastIndex) {
            parts.push({
                type: "text",
                value: messageText.slice(lastIndex, offset),
            });
        }

        let url = matchedUrl;
        let trailingText = "";

        while (TRAILING_PUNCTUATION_REGEX.test(url)) {
            trailingText = `${url.slice(-1)}${trailingText}`;
            url = url.slice(0, -1);
        }

        parts.push({
            type: "link",
            value: url,
        });

        if (trailingText) {
            parts.push({
                type: "text",
                value: trailingText,
            });
        }

        lastIndex = offset + matchedUrl.length;

        return matchedUrl;
    });

    if (lastIndex < messageText.length) {
        parts.push({
            type: "text",
            value: messageText.slice(lastIndex),
        });
    }

    return parts.length
        ? parts
        : [
              {
                  type: "text",
                  value: messageText,
              },
          ];
};

export const getMessageMinuteKey = (createdAt) => {
    const date = parseChatDate(createdAt);

    if (!date) return "";

    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}`;
};

export const getMessageDateKey = (createdAt) => {
    const date = parseChatDate(createdAt);

    if (!date) return "";

    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

export const formatDateDivider = (createdAt) => {
    const date = parseChatDate(createdAt);

    if (!date) return "";

    return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
    }).format(date);
};
