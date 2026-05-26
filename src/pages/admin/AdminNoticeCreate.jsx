import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/common/Header";
import Button from "../../components/common/Button";
import styles from "./AdminNoticeCreate.module.css";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const AdminNoticeCreate = () => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [important, setImportant] = useState(false);
    const [error, serError] = useState("");

    const onClick = () => {
        console.log(title, content, important);
    };
    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.body}>
                <Link to="/admin/notice" className={styles.backLink}>
                    ← 목록
                </Link>

                <section className={styles.card}>
                    <form className={styles.form}>
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
                            <span>중요 공지로 등록</span>
                        </label>

                        <div className={styles.buttonArea}>
                            <Link to={"/admin/notice"}>
                                <Button
                                    type="submit"
                                    buttonSize="small"
                                    buttonColor="primary"
                                    onClick={onClick}
                                >
                                    등록
                                </Button>
                            </Link>
                        </div>
                    </form>
                </section>
            </main>
        </div>
    );
};

export default AdminNoticeCreate;
