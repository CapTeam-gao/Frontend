import { useState } from "react";

const useNoticeForm = ({
    initialTitle = "",
    initialContent = "",
    initialImportant = false,
    onSubmit,
    submitErrorMessage,
}) => {
    const [title, setTitle] = useState(initialTitle);
    const [content, setContent] = useState(initialContent);
    const [important, setImportant] = useState(initialImportant);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

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

            await onSubmit({
                title,
                content,
                important: important ? "IMPORTANT" : "COMMON",
            });
        } catch {
            setError(submitErrorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        title,
        setTitle,
        content,
        setContent,
        important,
        setImportant,
        error,
        setError,
        isSubmitting,
        handleSubmit,
    };
};

export default useNoticeForm;
