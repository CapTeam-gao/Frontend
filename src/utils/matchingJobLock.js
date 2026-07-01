const MATCHING_JOB_LOCK_KEY = "capteam-matching-job";
const MATCHING_JOB_LOCK_TTL = 30 * 60 * 1000;

export const gradeLabels = {
    GRADE_2: "2학년",
    GRADE_3: "3학년",
};

export const getActiveMatchingJobLock = () => {
    const rawLock = localStorage.getItem(MATCHING_JOB_LOCK_KEY);

    if (!rawLock) {
        return null;
    }

    try {
        const lock = JSON.parse(rawLock);
        const startedAt = Number(lock.startedAt);

        if (!startedAt || Date.now() - startedAt > MATCHING_JOB_LOCK_TTL) {
            localStorage.removeItem(MATCHING_JOB_LOCK_KEY);
            return null;
        }

        return lock;
    } catch {
        localStorage.removeItem(MATCHING_JOB_LOCK_KEY);
        return null;
    }
};

export const setMatchingJobLock = (lock) => {
    localStorage.setItem(
        MATCHING_JOB_LOCK_KEY,
        JSON.stringify({
            ...lock,
            startedAt: lock.startedAt || Date.now(),
        })
    );
};

export const clearMatchingJobLock = () => {
    localStorage.removeItem(MATCHING_JOB_LOCK_KEY);
};
