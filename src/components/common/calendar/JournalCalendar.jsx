import styles from "./JournalCalendar.module.css";

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

const toISODate = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
        date.getDate()
    ).padStart(2, "0")}`;

// 월 그리드(6주 고정)를 만든다. 이전/다음 달로 넘어가는 칸은 비워둔다.
const buildWeeks = (monthStr) => {
    const [year, month] = monthStr.split("-").map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const daysInMonth = new Date(year, month, 0).getDate();
    const startOffset = firstDay.getDay();

    const cells = [];
    for (let i = 0; i < startOffset; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) {
        cells.push(new Date(year, month - 1, day));
    }
    // 마지막 주만 채우고 끝낸다 — 6주로 고정하면 달 끝에 빈 줄이 남는다.
    while (cells.length % 7 !== 0) cells.push(null);

    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) {
        weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
};

// ratio(0~1 | null)를 4단계 채움 강도로 나눈다. null이면 데이터 없는 날(빈 칸).
const ratioToLevel = (ratio) => {
    if (ratio === null || ratio === undefined) return null;
    if (ratio <= 0) return 0;
    if (ratio < 0.67) return 1;
    if (ratio < 1) return 2;
    return 3;
};

// days: [{ date: "yyyy-MM-dd", ratio: 0~1 | null }]
const JournalCalendar = ({ month, days = [], todayISO }) => {
    const ratioByDate = new Map(days.map((day) => [day.date, day.ratio]));
    const weeks = buildWeeks(month);

    return (
        <div className={styles.card}>
            <div className={styles.weekdays}>
                {WEEKDAY_LABELS.map((label) => (
                    <span key={label} className={styles.weekday}>
                        {label}
                    </span>
                ))}
            </div>
            <div className={styles.grid}>
                {weeks.flatMap((week, weekIndex) =>
                    week.map((date, dayIndex) => {
                        if (!date) {
                            return (
                                <div
                                    key={`${weekIndex}-${dayIndex}`}
                                    className={styles.cell}
                                    aria-hidden="true"
                                />
                            );
                        }

                        const iso = toISODate(date);
                        const isToday = iso === todayISO;
                        const level = ratioToLevel(ratioByDate.get(iso));

                        return (
                            <div
                                key={iso}
                                className={`${styles.cell} ${
                                    isToday ? styles.today : ""
                                }`}
                            >
                                <span className={styles.dayNumber}>
                                    {date.getDate()}
                                </span>
                                {level !== null && (
                                    <span
                                        className={styles.dot}
                                        data-level={level}
                                        aria-label={
                                            level === 3
                                                ? "전원 제출"
                                                : level === 0
                                                  ? "미제출"
                                                  : "일부 제출"
                                        }
                                    />
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default JournalCalendar;
