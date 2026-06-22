import styles from "../../../pages/user/chat/UserTeamChat.module.css";

const ChatChannelModal = ({
    mode = "create",
    targetChannel,
    channelName,
    error,
    isCreating,
    onChangeChannelName,
    onClose,
    onSubmit,
}) => {
    const isDeleteMode = mode === "delete";
    const title =
        mode === "edit"
            ? "채널 이름 수정"
            : isDeleteMode
            ? "채널 삭제"
            : "채널 추가";
    const submitLabel =
        mode === "edit" ? "수정" : isDeleteMode ? "삭제" : "추가";
    const loadingLabel =
        mode === "edit" ? "수정 중" : isDeleteMode ? "삭제 중" : "추가 중";

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <section
                className={styles.channelModal}
                onClick={(event) => event.stopPropagation()}
            >
                <div className={styles.channelModalHeader}>
                    <div>
                        <h2>{title}</h2>
                    </div>
                </div>

                {isDeleteMode ? (
                    <p className={styles.channelDeleteText}>
                        <strong>{targetChannel?.channelName}</strong> 채널을
                        삭제할까요? 채널 안의 메시지도 함께 삭제됩니다.
                    </p>
                ) : (
                    <label className={styles.channelModalField}>
                        <span>채널 이름</span>
                        <input
                            type="text"
                            placeholder="예: 프론트엔드, 백엔드, 진행상황"
                            value={channelName}
                            onChange={(event) =>
                                onChangeChannelName(event.target.value)
                            }
                        />
                    </label>
                )}

                <div>
                    {error && (
                        <p className={styles.channelModalError}>{error}</p>
                    )}
                </div>

                <div className={styles.channelModalActions}>
                    <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={onClose}
                    >
                        취소
                    </button>
                    <button
                        type="button"
                        className={`${styles.createButton} ${
                            isDeleteMode ? styles.deleteButton : ""
                        }`}
                        disabled={isCreating}
                        onClick={onSubmit}
                    >
                        {isCreating ? loadingLabel : submitLabel}
                    </button>
                </div>
            </section>
        </div>
    );
};

export default ChatChannelModal;
