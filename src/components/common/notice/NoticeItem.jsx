// Design/notice-list-v3.html의 공지 행 구조.
import { formatCreatedAt, stripMarkdown, truncateText } from "../../../utils/format";
import styles from "./NoticeItem.module.css";

const NoticeItem = ({ notice }) => {
    return (
        <div className={styles.item}>
            <div className={styles.main}>
                <div className={styles.titleRow}>
                    {notice.important === "IMPORTANT" && (
                        <span className={styles.tag}>중요</span>
                    )}
                    {notice.noticeType === "TEAM_RESULT" && (
                        <span className={styles.typeTag}>팀 배정 결과</span>
                    )}
                    <h3 className={styles.title}>{notice.title}</h3>
                </div>

                {notice.content && (
                    <p className={styles.content}>
                        {truncateText(stripMarkdown(notice.content), 100)}
                    </p>
                )}
                <p className={styles.meta}>
                    <span>{notice.writer}</span>
                    <i aria-hidden="true">·</i>
                    <time dateTime={notice.createdAt || undefined}>
                        {formatCreatedAt(notice.createdAt)}
                    </time>
                </p>
            </div>

            <span className={styles.chevron} aria-hidden="true">→</span>
        </div>
    );
};

export default NoticeItem;
