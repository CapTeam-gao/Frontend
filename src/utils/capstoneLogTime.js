const CAPSTONE_LOG_DAY = 3;
const CAPSTONE_LOG_START_HOUR = 15;
const CAPSTONE_LOG_START_MINUTE = 40;
const CAPSTONE_LOG_END_HOUR = 18;
const CAPSTONE_LOG_END_MINUTE = 10;
const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

const createDateWithTime = (baseDate, hour, minute) => {
    const date = new Date(baseDate);
    date.setHours(hour, minute, 0, 0);

    return date;
};

export const getTodayCapstoneLogWindow = (baseDate = new Date()) => {
    return {
        startAt: createDateWithTime(
            baseDate,
            CAPSTONE_LOG_START_HOUR,
            CAPSTONE_LOG_START_MINUTE
        ),
        endAt: createDateWithTime(
            baseDate,
            CAPSTONE_LOG_END_HOUR,
            CAPSTONE_LOG_END_MINUTE
        ),
    };
};

export const isCapstoneLogTime = (baseDate = new Date()) => {
    const { startAt, endAt } = getTodayCapstoneLogWindow(baseDate);
    const isCapstoneDay = baseDate.getDay() === CAPSTONE_LOG_DAY;

    return (
        isCapstoneDay &&
        baseDate.getTime() >= startAt.getTime() &&
        baseDate.getTime() <= endAt.getTime()
    );
};

export const getCapstoneLogRemainingMs = (baseDate = new Date()) => {
    const { endAt } = getTodayCapstoneLogWindow(baseDate);

    return Math.max(endAt.getTime() - baseDate.getTime(), 0);
};

export const getNextCapstoneLogWindow = (baseDate = new Date()) => {
    const currentDay = baseDate.getDay();
    const daysUntilCapstoneDay =
        (CAPSTONE_LOG_DAY - currentDay + 7) % 7;
    const nextDate = new Date(baseDate);
    nextDate.setDate(baseDate.getDate() + daysUntilCapstoneDay);

    let nextWindow = getTodayCapstoneLogWindow(nextDate);

    if (
        daysUntilCapstoneDay === 0 &&
        baseDate.getTime() > nextWindow.endAt.getTime()
    ) {
        nextDate.setDate(baseDate.getDate() + 7);
        nextWindow = getTodayCapstoneLogWindow(nextDate);
    }

    return nextWindow;
};

export const getNextCapstoneLogStartRemainingMs = (
    baseDate = new Date()
) => {
    const { startAt } = getNextCapstoneLogWindow(baseDate);

    return Math.max(startAt.getTime() - baseDate.getTime(), 0);
};

const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`;
};

export const formatCapstoneLogDateTime = (date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayLabel = DAY_LABELS[date.getDay()];

    return `${month}월 ${day}일(${dayLabel}) ${formatTime(date)}`;
};

export const getCapstoneLogUnavailableText = (
    baseDate = new Date()
) => {
    const { startAt, endAt } = getNextCapstoneLogWindow(baseDate);

    return `다음 작성 가능 시간은 ${formatCapstoneLogDateTime(
        startAt
    )}부터 ${formatTime(endAt)}까지입니다.`;
};

export const formatCountdownTime = (milliseconds) => {
    const totalSeconds = Math.max(Math.floor(milliseconds / 1000), 0);

    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
        2,
        "0"
    );
    const seconds = String(totalSeconds % 60).padStart(2, "0");

    return `${hours} : ${minutes} : ${seconds}`;
};

export const getCapstoneLogStatusText = ({
    teamCreated,
    todayJournalSubmitted,
    baseDate = new Date(),
}) => {
    if (!teamCreated) return "팀 생성 전입니다";

    if (isCapstoneLogTime(baseDate) && !todayJournalSubmitted) {
        return "오늘 일지가 미제출 상태입니다";
    }

    return "";
};
