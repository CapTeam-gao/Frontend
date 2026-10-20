import styles from "./ChatAvatar.module.css";

// 이름 옆에 붙는 장식이라 스크린리더에는 숨긴다(이름은 항상 글자로 함께 보인다)
const getInitials = (name = "") => (name.length >= 3 ? name.slice(1, 3) : name);

const ChatAvatar = ({ name, size = 36, online, className = "" }) => (
    <span
        className={`${styles.avatar} ${className}`}
        style={{ "--avatar-size": `${size}px` }}
        aria-hidden="true"
    >
        {getInitials(name)}
        {online !== undefined && (
            <i className={`${styles.presence} ${online ? styles.online : ""}`} />
        )}
    </span>
);

export default ChatAvatar;
