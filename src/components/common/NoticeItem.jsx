import styles from "./NoticeItem.module.css";
import { formatCreatedAt } from "../../utils/format";

const NoticeItem = ({ notice }) => {
    // 글자수 100 글자 넘어가면 ... 처리하는 로직
    const truncate = (str, n) => {
        return str?.length > n ? str.substr(0, n - 1) + "..." : str;
    };
    return (
        <li className={styles.item}>
            <div className={styles.titleArea}>
                {notice.important === "IMPORTANT" && (
                    <span className={styles.tag}>중요</span>
                )}
                <h3 className={styles.title}>{notice.title}</h3>
            </div>
            {notice.content && (
                <p className={styles.content}>
                    {/* truncate 함수로 감싸서 100글자 넘으면 ... 처리 */}
                    <span>{truncate(notice.content, 100)}</span>
                </p>
            )}
            <div className={styles.meta}>
                <p className={styles.writer}>
                    {notice.writer || notice.authorName}
                </p>
                <p className={styles.date}>
                    {formatCreatedAt(notice.createdAt)}
                </p>
            </div>
        </li>
    );
};

export default NoticeItem;
