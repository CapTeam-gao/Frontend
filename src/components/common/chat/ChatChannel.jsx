import styles from "./ChatChannel.module.css";

const ChatChannel = ({ channel, selected, onClick }) => {
    return (
        <button
            type="button"
            className={`${styles.channelButton} ${
                selected ? styles.selected : ""
            }`}
            onClick={onClick}
        >
            <span className={styles.channelMark}>#</span>
            <span className={styles.channelName}>{channel.channelName}</span>
        </button>
    );
};

export default ChatChannel;
