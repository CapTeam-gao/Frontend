import { useRef, useState } from "react";
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
    placeholder = "메시지를 입력하세요",
}) => {
    const [message, setMessage] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);

    const clearSelectedFile = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        setSelectedFile(null);
        setPreviewUrl("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

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
            try {
                await onFileSend?.(selectedFile, trimmedMessage);
                clearSelectedFile();
                setMessage("");
            } catch {
                inputRef.current?.focus();
            }

            inputRef.current?.focus();
            return;
        }

        await onSend(trimmedMessage);
        setMessage("");
        inputRef.current?.focus();
    };

    const handleFileChange = (event) => {
        const nextFile = event.target.files?.[0];

        if (!nextFile || disabled || isFileSending) return;

        clearSelectedFile();
        setSelectedFile(nextFile);
        setPreviewUrl(
            isImageFile(nextFile) ? URL.createObjectURL(nextFile) : ""
        );
        event.target.value = "";
        inputRef.current?.focus();
    };

    const removeSelectedFile = () => {
        clearSelectedFile();
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
                    type="text"
                    className={styles.messageInput}
                    placeholder={placeholder}
                    value={message}
                    disabled={disabled || isSending || isFileSending}
                    onChange={(event) => setMessage(event.target.value)}
                />

                <button
                    type="submit"
                    className={styles.sendButton}
                    disabled={
                        disabled ||
                        isSending ||
                        isFileSending ||
                        (!message.trim() && !selectedFile)
                    }
                >
                    {isSending || isFileSending ? "전송 중" : "전송"}
                </button>
            </div>
        </form>
    );
};

export default ChatInput;
