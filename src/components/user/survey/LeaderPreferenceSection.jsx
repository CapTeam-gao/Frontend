const LeaderPreferenceSection = ({
    styles,
    leaderPreference,
    onSelectLeaderPreference,
}) => {
    return (
        <div className={styles.formSection}>
            <div className={styles.sectionTitleArea}>
                <h3>팀장 선호 여부</h3>
                <p>팀장 역할을 맡고 싶은지 선택해주세요.</p>
            </div>

            <div className={styles.binaryGroup}>
                {["O", "X"].map((value) => (
                    <button
                        key={value}
                        type="button"
                        className={`${styles.binaryButton} ${
                            leaderPreference === value
                                ? styles.selectedOption
                                : ""
                        }`}
                        onClick={() => onSelectLeaderPreference(value)}
                    >
                        {value}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default LeaderPreferenceSection;
