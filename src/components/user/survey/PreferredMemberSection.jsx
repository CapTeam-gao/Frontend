const PreferredMemberSection = ({
    styles,
    preferredMembers,
    onUpdatePreferredMember,
    onAddPreferredMember,
    onRemovePreferredMember,
}) => {
    return (
        <div className={styles.formSection}>
            <div className={styles.sectionTitleArea}>
                <h3>선호 팀원</h3>
                <p>함께 팀을 하고 싶은 학생을 최대 3명까지 작성할 수 있습니다.</p>
            </div>

            <div className={styles.memberList}>
                {preferredMembers.map((member, index) => (
                    <div key={`member-${index}`} className={styles.memberRow}>
                        <input
                            type="text"
                            value={member}
                            placeholder="예: 2313 허재원"
                            onChange={(e) =>
                                onUpdatePreferredMember(index, e.target.value)
                            }
                        />
                        {preferredMembers.length > 1 && (
                            <button
                                type="button"
                                onClick={() => onRemovePreferredMember(index)}
                            >
                                삭제
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <button
                type="button"
                className={styles.addButton}
                onClick={onAddPreferredMember}
                disabled={preferredMembers.length >= 3}
            >
                선호 팀원 추가
            </button>
        </div>
    );
};

export default PreferredMemberSection;
