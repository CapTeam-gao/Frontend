import { formatCountdownTime } from "../../../utils/capstoneLogTime";
import styles from "./LogCountdown.module.css";

const UNITS = ["시간", "분", "초"];

// "HH : MM : SS"를 숫자 + 단위 칸으로 나눠 크게 보여 준다
const LogCountdown = ({ milliseconds, size = "lg" }) => {
    const parts = formatCountdownTime(milliseconds).split(" : ");

    return (
        <div
            className={`${styles.countdown} ${size === "sm" ? styles.small : ""}`}
            role="timer"
            aria-label={`${parts[0]}시간 ${parts[1]}분 ${parts[2]}초`}
        >
            {parts.map((value, index) => (
                <span key={UNITS[index]} className={styles.unit} aria-hidden="true">
                    <span className={styles.value}>{value}</span>
                    <span className={styles.label}>{UNITS[index]}</span>
                </span>
            ))}
        </div>
    );
};

export default LogCountdown;
