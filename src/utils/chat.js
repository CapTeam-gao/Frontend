export const CHAT_UNREAD_CHANGE_EVENT = "capteam-chat-unread-change";

const MESSAGE_LINK_REGEX = /(https?:\/\/[^\s]+)/g;
const TRAILING_PUNCTUATION_REGEX = /[.,!?)]$/;

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
    if (!createdAt) return "";

    const date = new Date(createdAt);

    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}`;
};

export const getMessageDateKey = (createdAt) => {
    if (!createdAt) return "";

    const date = new Date(createdAt);

    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

export const formatDateDivider = (createdAt) => {
    if (!createdAt) return "";

    return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
    }).format(new Date(createdAt));
};
