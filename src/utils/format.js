export const stripMarkdown = (text = "") => {
    return text
        .replace(/```[\s\S]*?```/g, "")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
        .replace(/#{1,6}\s?/g, "")
        .replace(/(\*\*|__)(.*?)\1/g, "$2")
        .replace(/(\*|_)(.*?)\1/g, "$2")
        .replace(/^>\s?/gm, "")
        .replace(/^[-*+]\s+/gm, "")
        .replace(/^\d+\.\s+/gm, "")
        .replace(/\n+/g, " ")
        .trim();
};

export const truncateText = (text = "", maxLength) => {
    return text.length > maxLength
        ? `${text.slice(0, maxLength - 1)}...`
        : text;
};

export const formatCreatedAt = (createdAt) => {
    if (!createdAt) return "";

    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
        return createdAt;
    }

    return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
};
