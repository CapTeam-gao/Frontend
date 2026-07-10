import { useCallback, useEffect, useState } from "react";
import api from "../../../api/api";
import { getAssetUrl } from "../../../api/baseUrl";
import { formatChatTime, parseMessageTextWithLinks } from "../../../utils/chat";
import fileIcon from "../../../assets/icons/file.svg";
import styles from "./ChatMessage.module.css";

const formatFileSize = (size) => {
    if (!size) return "";

    if (size < 1024 * 1024) {
        return `${Math.ceil(size / 1024)}KB`;
    }

    return `${(size / 1024 / 1024).toFixed(1)}MB`;
};

const getFileUrl = (fileUrl) => {
    if (!fileUrl) return "";

    return getAssetUrl(fileUrl);
};

const isImageMessage = (message) => message.fileType?.startsWith("image/");

const getFileExtension = (fileName = "") => {
    const extension = fileName.split(".").pop();

    if (!extension || extension === fileName) return "FILE";

    return extension.toUpperCase();
};

const ChatMessage = ({ message, mine, showTime, onEdit, onDelete }) => {
    const [actionMode, setActionMode] = useState("");
    const [editText, setEditText] = useState(message.message ?? "");
    const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [actionError, setActionError] = useState("");
    const [imageSrc, setImageSrc] = useState("");
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [imageError, setImageError] = useState("");
    const fileUrl = getFileUrl(message.fileUrl);
    const isImage = isImageMessage(message);
    const messageParts = parseMessageTextWithLinks(message.message ?? "");

    const fetchFileBlob = useCallback(async () => {
        const response = await api.get(fileUrl, {
            responseType: "blob",
        });
        const blob = response.data;

        return new Blob([blob], {
            type: message.fileType || blob.type || "application/octet-stream",
        });
    }, [fileUrl, message.fileType]);

    useEffect(() => {
        if (!fileUrl || !isImage) {
            setImageSrc("");
            setImageError("");
            setIsImageLoading(false);
            return undefined;
        }

        let isMounted = true;
        let objectUrl = "";

        const loadImage = async () => {
            try {
                setIsImageLoading(true);
                setImageError("");

                const blob = await fetchFileBlob();

                if (!isMounted) return;

                objectUrl = URL.createObjectURL(blob);
                setImageSrc(objectUrl);
            } catch {
                if (!isMounted) return;

                setImageSrc("");
                setImageError("이미지를 불러오지 못했습니다.");
            } finally {
                if (isMounted) {
                    setIsImageLoading(false);
                }
            }
        };

        loadImage();

        return () => {
            isMounted = false;
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [fetchFileBlob, fileUrl, isImage]);

    const handleDownloadFile = async () => {
        try {
            setActionError("");

            const blob = await fetchFileBlob();
            const objectUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = objectUrl;
            link.download = message.fileName || "download";
            document.body.appendChild(link);
            link.click();
            link.remove();

            window.setTimeout(() => {
                URL.revokeObjectURL(objectUrl);
            }, 1000);
        } catch {
            setActionError("파일 다운로드에 실패했습니다.");
        }
    };

    const handleOpenOriginalImage = async () => {
        const imageWindow = window.open("", "_blank");

        try {
            setActionError("");

            const blob = await fetchFileBlob();
            const objectUrl = URL.createObjectURL(blob);

            if (imageWindow) {
                imageWindow.location.href = objectUrl;
            } else {
                window.location.href = objectUrl;
            }

            window.setTimeout(() => {
                URL.revokeObjectURL(objectUrl);
            }, 60 * 1000);
        } catch {
            imageWindow?.close();
            setActionError("원본 이미지를 열지 못했습니다.");
        }
    };

    const closeActionPanel = () => {
        setActionMode("");
        setEditText(message.message ?? "");
        setActionError("");
    };

    const handleEditSubmit = async () => {
        const trimmedText = editText.trim();

        if (!trimmedText) {
            setActionError("수정할 메시지를 입력해주세요.");
            return;
        }

        if (trimmedText === message.message) {
            setActionError("수정된 내용이 없습니다.");
            return;
        }

        try {
            setIsProcessing(true);
            setActionError("");

            await onEdit(message.id, trimmedText);
            closeActionPanel();
        } catch {
            setActionError("메시지 수정에 실패했습니다.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeleteSubmit = async () => {
        try {
            setIsProcessing(true);
            setActionError("");

            await onDelete(message.id);
            closeActionPanel();
        } catch {
            setActionError("메시지 삭제에 실패했습니다.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <li
            className={`${styles.messageItem} ${mine ? styles.mine : ""} ${
                showTime ? styles.timeSeparated : ""
            }`}
        >
            {showTime && (
                <div className={styles.messageMeta}>
                    {!mine && (
                        <strong className={styles.senderName}>
                            {message.senderName}
                        </strong>
                    )}
                    <span>{formatChatTime(message.createdAt)}</span>
                </div>
            )}

            <div className={styles.messageBody}>
                {actionMode === "edit" ? (
                    <div className={styles.inlineEditBox}>
                        <textarea
                            value={editText}
                            onChange={(event) =>
                                setEditText(event.target.value)
                            }
                            aria-label="메시지 수정 내용"
                            autoFocus
                        />

                        {actionError && (
                            <p className={styles.actionError}>
                                {actionError}
                            </p>
                        )}

                        <div className={styles.panelActions}>
                            <button
                                type="button"
                                onClick={closeActionPanel}
                                disabled={isProcessing}
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                className={styles.primaryButton}
                                onClick={handleEditSubmit}
                                disabled={isProcessing}
                            >
                                {isProcessing ? "수정 중" : "수정 완료"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className={styles.messageStack}>
                        {message.message && (
                            <div className={styles.messageBubble}>
                                {messageParts.map((part, index) =>
                                    part.type === "link" ? (
                                        <a
                                            key={`${part.value}-${index}`}
                                            className={styles.messageLink}
                                            href={part.value}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            {part.value}
                                        </a>
                                    ) : (
                                        <span key={`${part.value}-${index}`}>
                                            {part.value}
                                        </span>
                                    )
                                )}
                            </div>
                        )}

                        {message.fileUrl &&
                            (isImage ? (
                                <button
                                    type="button"
                                    className={styles.imageMessage}
                                    onClick={() =>
                                        imageSrc &&
                                        setIsImagePreviewOpen(true)
                                    }
                                    disabled={!imageSrc}
                                >
                                    {imageSrc ? (
                                        <img
                                            src={imageSrc}
                                            alt={
                                                message.fileName ??
                                                "첨부 이미지"
                                            }
                                        />
                                    ) : (
                                        <span className={styles.imageFallback}>
                                            {isImageLoading
                                                ? "이미지를 불러오는 중"
                                                : imageError}
                                        </span>
                                    )}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className={styles.fileMessage}
                                    onClick={handleDownloadFile}
                                >
                                    <span className={styles.fileIcon}>
                                        <img src={fileIcon} alt="" />
                                    </span>
                                    <span className={styles.fileInfo}>
                                        <strong>
                                            {message.fileName ?? "첨부 파일"}
                                        </strong>
                                        <small>
                                            {getFileExtension(message.fileName)}
                                            {message.fileSize
                                                ? ` · ${formatFileSize(
                                                      message.fileSize
                                                  )}`
                                            : ""}
                                        </small>
                                    </span>
                                </button>
                            ))}
                    </div>
                )}

                {mine && actionMode !== "edit" && (
                    <div className={styles.messageActions}>
                        {message.message && (
                            <button
                                type="button"
                                onClick={() => setActionMode("edit")}
                            >
                                수정
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setActionMode("delete")}
                        >
                            삭제
                        </button>
                    </div>
                )}
            </div>

            {actionError && !actionMode && (
                <p className={styles.actionError}>{actionError}</p>
            )}

            {actionMode === "delete" && (
                <div
                    className={styles.deleteOverlay}
                    onClick={closeActionPanel}
                >
                    <section
                        className={styles.deleteModal}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div>
                            <strong>메시지를 삭제할까요?</strong>
                            <p>
                                삭제하면 이 대화에서 메시지가 보이지
                                않습니다.
                            </p>
                        </div>

                        {actionError && (
                            <p className={styles.actionError}>
                                {actionError}
                            </p>
                        )}

                        <div className={styles.panelActions}>
                            <button
                                type="button"
                                onClick={closeActionPanel}
                                disabled={isProcessing}
                            >
                                취소
                            </button>
                            <button
                                type="button"
                                className={styles.dangerButton}
                                onClick={handleDeleteSubmit}
                                disabled={isProcessing}
                            >
                                {isProcessing ? "삭제 중" : "삭제"}
                            </button>
                        </div>
                    </section>
                </div>
            )}

            {isImagePreviewOpen && imageSrc && (
                <div
                    className={styles.imagePreviewOverlay}
                    onClick={() => setIsImagePreviewOpen(false)}
                >
                    <section
                        className={styles.imagePreviewModal}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            className={styles.imagePreviewClose}
                            aria-label="이미지 미리보기 닫기"
                            onClick={() => setIsImagePreviewOpen(false)}
                        >
                            ×
                        </button>
                        <img
                            src={imageSrc}
                            alt={message.fileName ?? "첨부 이미지"}
                        />
                        <button
                            type="button"
                            className={styles.imagePreviewAction}
                            onClick={handleOpenOriginalImage}
                        >
                            원본 보기
                        </button>
                    </section>
                </div>
            )}
        </li>
    );
};

export default ChatMessage;
