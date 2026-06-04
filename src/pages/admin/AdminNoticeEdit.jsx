import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../../components/common/Header";
import Button from "../../components/common/Button";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import styles from "./AdminNoticeCreate.module.css";
import { requestNoticeDetail, requestUpdateNotice } from "../../api/noticeApi";

const AdminNoticeEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [important, setImportant] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const getNoticeDetail = async () => {
            try {
                const notice = await requestNoticeDetail(id);

                setTitle(notice.title ?? "");
                setContent(notice.content ?? "");
                setImportant(notice.important === "IMPORTANT");
            } catch {
                setError("공지 정보를 불러오지 못했습니다.");
            } finally {
                setIsLoading(false);
            }
        };

        getNoticeDetail();
    }, [id]);

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

            await requestUpdateNotice(id, {
                title,
                content,
                important: important ? "IMPORTANT" : "COMMON",
            });

            navigate(`/admin/notice/${id}`);
        } catch {
            setError("공지 수정에 실패했습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.body}>
                <Link to={`/admin/notice/${id}`} className={styles.backLink}>
                    ← 상세
                </Link>

                <section className={styles.card}>
                    <form className={styles.form} onSubmit={handleSubmit}>
                        {isLoading ? (
                            <p className={styles.error}>
                                공지 정보를 불러오는 중입니다.
                            </p>
                        ) : (
                            <>
                                <div className={styles.field}>
                                    <label
                                        htmlFor="title"
                                        className={styles.label}
                                    >
                                        제목
                                    </label>
                                    <input
                                        id="title"
                                        type="text"
                                        className={styles.input}
                                        placeholder="공지 제목을 입력해주세요"
                                        value={title}
                                        onChange={(e) =>
                                            setTitle(e.target.value)
                                        }
                                    />
                                </div>

                                <div className={styles.field}>
                                    <label
                                        htmlFor="content"
                                        className={styles.label}
                                    >
                                        내용
                                    </label>
                                    <MDEditor
                                        className={styles.markdownEditor}
                                        value={content}
                                        onChange={(value) =>
                                            setContent(value || "")
                                        }
                                        height={765}
                                        visibleDragbar={false}
                                        textareaProps={{
                                            id: "content",
                                            placeholder:
                                                "공지 내용을 입력해주세요",
                                        }}
                                        data-color-mode="light"
                                    />
                                </div>

                                <label className={styles.checkBoxArea}>
                                    <input
                                        type="checkbox"
                                        className={styles.checkBox}
                                        checked={important}
                                        onChange={(e) =>
                                            setImportant(e.target.checked)
                                        }
                                    />
                                    <span className={styles.customCheck}></span>
                                    <span className={styles.checkBoxText}>
                                        중요 공지로 등록
                                    </span>
                                </label>

                                {error && (
                                    <p className={styles.error}>{error}</p>
                                )}

                                <div className={styles.buttonArea}>
                                    <Button
                                        type="submit"
                                        buttonSize="small"
                                        buttonColor="primary"
                                        disabled={isSubmitting}
                                        className={styles.submitButton}
                                    >
                                        {isSubmitting ? "수정 중..." : "완료"}
                                    </Button>
                                </div>
                            </>
                        )}
                    </form>
                </section>
            </main>
        </div>
    );
};

export default AdminNoticeEdit;
