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
