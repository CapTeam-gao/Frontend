import { useEffect, useRef, useState } from "react";
import fileIcon from "../../../assets/icons/file.svg";
import styles from "./ChatInput.module.css";

const formatFileSize = (size) => {
    if (!size) return "";

    if (size < 1024 * 1024) {
        return `${Math.ceil(size / 1024)}KB`;
    }

    return `${(size / 1024 / 1024).toFixed(1)}MB`;
};

const isImageFile = (file) => file?.type?.startsWith("image/");

const getFileTypeLabel = (file) => {
    if (isImageFile(file)) return "이미지 파일";

    return "첨부 파일";
};

const ChatInput = ({
    onSend,
    onFileSend,
    disabled = false,
    isSending = false,
    isFileSending = false,
}) => {
    const [message, setMessage] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!selectedFile || !isImageFile(selectedFile)) {
            setPreviewUrl("");
            return undefined;
        }

        const nextPreviewUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(nextPreviewUrl);

        return () => {
            URL.revokeObjectURL(nextPreviewUrl);
        };
    }, [selectedFile]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const trimmedMessage = message.trim();

        if (
            (!trimmedMessage && !selectedFile) ||
            disabled ||
            isSending ||
            isFileSending
        ) {
            return;
        }

        if (selectedFile) {
            await onFileSend?.(selectedFile, trimmedMessage);
            setSelectedFile(null);
            setMessage("");
            inputRef.current?.focus();
            return;
        }

        await onSend(trimmedMessage);
        setMessage("");
        inputRef.current?.focus();
    };

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files?.[0];

        if (!selectedFile || disabled || isFileSending) return;

        setSelectedFile(selectedFile);
        e.target.value = "";
        inputRef.current?.focus();
    };

    const removeSelectedFile = () => {
        setSelectedFile(null);
        inputRef.current?.focus();
    };

    return (
        <form className={styles.inputForm} onSubmit={handleSubmit}>
            {selectedFile && (
                <div className={styles.filePreview}>
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt={selectedFile.name}
                            className={styles.imagePreview}
                        />
                    ) : (
                        <div className={styles.documentPreview}>
                            <span className={styles.documentIcon}>
                                <img src={fileIcon} alt="" />
                            </span>
                        </div>
                    )}

                    <div className={styles.previewInfo}>
                        <strong>{selectedFile.name}</strong>
                        <span>
                            {getFileTypeLabel(selectedFile)}
                            {selectedFile.size
                                ? ` · ${formatFileSize(selectedFile.size)}`
                                : ""}
                        </span>
                    </div>

                    <button
                        type="button"
                        className={styles.removeFileButton}
                        aria-label="선택한 파일 삭제"
                        onClick={removeSelectedFile}
                    >
                        ×
                    </button>
                </div>
            )}

            <div className={styles.inputRow}>
                <button
                    type="button"
                    className={styles.fileButton}
                    aria-label="파일 업로드"
                    disabled={disabled || isFileSending}
                    onClick={() => fileInputRef.current?.click()}
                >
                    +
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    className={styles.fileInput}
                    onChange={handleFileChange}
                />

                <input
                    ref={inputRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={disabled || isFileSending}
                    placeholder={
                        isFileSending
                            ? "파일을 업로드하는 중입니다"
                            : "메시지를 입력하세요"
                    }
                    className={styles.messageInput}
                />

                <button
                    type="submit"
                    disabled={
                        disabled ||
                        isSending ||
                        isFileSending ||
                        (!message.trim() && !selectedFile)
                    }
                    className={styles.sendButton}
                >
                    전송
                </button>
            </div>
        </form>
    );
};

export default ChatInput;
