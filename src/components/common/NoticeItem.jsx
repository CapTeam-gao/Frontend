import styles from "./NoticeItem.module.css";

const NoticeItem = ({ notice }) => {
    return (
        <li className={styles.item}>
            <div className={styles.titleArea}>
                {notice.important && <span className={styles.tag}>중요</span>}
                <h3 className={styles.title}>{notice.title}</h3>
            </div>
            <p className={styles.content}>{notice.content}</p>
            <div className={styles.meta}>
                <p className={styles.writer}>{notice.writer}</p>
                <p className={styles.date}>{notice.date}</p>
            </div>
        </li>
    );
};

export default NoticeItem;
