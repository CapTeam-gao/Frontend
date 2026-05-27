import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import Button from "../../components/common/Button";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import styles from "./AdminNoticeCreate.module.css";
import { requestCreateNotice } from "../../api/noticeApi";
import authStore from "../../store/authStore";

const AdminNoticeCreate = () => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [important, setImportant] = useState(false);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();
    const accessToken = authStore((state) => state.accessToken);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) return;

        if (!title.trim()) {
            setError("제목을 입력해주세요.");
            return;
        }

        if (!content.trim()) {
            setError("내용을 입력해주세요.");
            return;
        }

        try {
            setError("");
            setIsSubmitting(true);

            await requestCreateNotice(
                {
                    title,
                    content,
                    important,
                },
                accessToken
            );

            navigate("/admin/notice");
        } catch {
            setError("공지 등록에 실패했습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.body}>
                <Link to="/admin/notice" className={styles.backLink}>
                    ← 목록
                </Link>

                <section className={styles.card}>
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.field}>
                            <label htmlFor="title" className={styles.label}>
                                제목
                            </label>
                            <input
                                id="title"
                                type="text"
                                className={styles.input}
                                placeholder="공지 제목을 입력해주세요"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="content" className={styles.label}>
                                내용
                            </label>
                            <MDEditor
                                className={styles.markdownEditor}
                                value={content}
                                onChange={(value) => setContent(value || "")}
                                height={765}
                                visibleDragbar={false}
                                textareaProps={{
                                    id: "content",
                                    placeholder: "공지 내용을 입력해주세요",
                                }}
                                data-color-mode="light"
                            />
                        </div>

                        <label className={styles.checkBoxArea}>
                            <input
                                type="checkbox"
                                className={styles.checkBox}
                                checked={important}
                                onChange={(e) => setImportant(e.target.checked)}
                            />
                            <span className={styles.customCheck}></span>
                            <span className={styles.checkBoxText}>
                                중요 공지로 등록
                            </span>
                        </label>

                        {error && <p className={styles.error}>{error}</p>}

                        <div className={styles.buttonArea}>
                            <Button
                                type="submit"
                                buttonSize="small"
                                buttonColor="primary"
                                disabled={isSubmitting}
                                className={styles.submitButton}
                            >
                                {isSubmitting ? "등록 중..." : "등록"}
                            </Button>
                        </div>
                    </form>
                </section>
            </main>
        </div>
    );
};

export default AdminNoticeCreate;
