const MATCHING_JOB_LOCK_KEY = "capteam-matching-job";
const MATCHING_JOB_LOCK_TTL = 30 * 60 * 1000;

export const gradeLabels = {
    GRADE_2: "2학년",
    GRADE_3: "3학년",
};

// 첫 팀 partialTeams를 놓치지 않도록 매칭 작업 중에는 1초마다 상태를 확인한다.
export const MATCHING_POLL_INTERVAL = 1000;
export const WAITING_JOB_STATUSES = ["QUEUED", "RUNNING", "COMPLETING"];

export const wait = (ms) =>
    new Promise((resolve) => {
        setTimeout(resolve, ms);
    });

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
    const currentLock = getActiveMatchingJobLock();
    const shouldKeepStartedAt =
        currentLock &&
        ((lock.jobId && currentLock.jobId === lock.jobId) ||
            (!lock.jobId && currentLock.grade === lock.grade));

    localStorage.setItem(
        MATCHING_JOB_LOCK_KEY,
        JSON.stringify({
            ...lock,
            startedAt:
                lock.startedAt ||
                (shouldKeepStartedAt ? currentLock.startedAt : Date.now()),
        })
    );
};

export const clearMatchingJobLock = () => {
    localStorage.removeItem(MATCHING_JOB_LOCK_KEY);
};
