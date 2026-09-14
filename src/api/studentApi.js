import api from "./api";

const ADMIN_STUDENT_CACHE_TTL = 1000 * 10;
const adminStudentListCache = new Map();
const adminStudentListRequests = new Map();

const getAdminStudentCacheKey = () =>
    localStorage.getItem("accessToken") || "anonymous";

export const requestStudentSearch = async (keyword) => {
    const response = await api.get("/api/user/students/search", {
        params: { keyword },
    });

    return response.data?.data ?? [];
};

export const requestAdminStudentList = async ({ force = false } = {}) => {
    const cacheKey = getAdminStudentCacheKey();
    const cached = adminStudentListCache.get(cacheKey);

    if (
        !force &&
        cached &&
        Date.now() - cached.savedAt < ADMIN_STUDENT_CACHE_TTL
    ) {
        return cached.data;
    }

    if (!force && adminStudentListRequests.has(cacheKey)) {
        return adminStudentListRequests.get(cacheKey);
    }

    const request = api
        .get("/api/admin/students")
        .then((response) => {
            const data = response.data;

            adminStudentListCache.set(cacheKey, {
                data,
                savedAt: Date.now(),
            });

            return data;
        })
        .finally(() => {
            adminStudentListRequests.delete(cacheKey);
        });

    adminStudentListRequests.set(cacheKey, request);

    return request;
};

export const clearAdminStudentListCache = () => {
    adminStudentListCache.clear();
    adminStudentListRequests.clear();
};

export const requestAdminStudentDetail = async (userId) => {
    const response = await api.get(`/api/admin/students/${userId}`);

    return response.data;
};
