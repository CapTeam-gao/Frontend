import api from "./api";
import { ACCESS_TOKEN_KEY } from "../store/authStore";

const DASHBOARD_CACHE_TTL = 1000 * 10;
const dashboardCache = new Map();
const dashboardRequestCache = new Map();

const makeAuthHeader = () => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);

    return token
        ? {
              Authorization: `Bearer ${token}`,
          }
        : {};
};

const getDashboardCacheKey = (role) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY) || "";

    return `${role}:${token}`;
};

const requestDashboard = async (role, path, { force = false } = {}) => {
    const cacheKey = getDashboardCacheKey(role);
    const cachedDashboard = dashboardCache.get(cacheKey);

    if (
        !force &&
        cachedDashboard &&
        Date.now() - cachedDashboard.savedAt < DASHBOARD_CACHE_TTL
    ) {
        return cachedDashboard.data;
    }

    const cachedRequest = dashboardRequestCache.get(cacheKey);

    if (!force && cachedRequest) return cachedRequest;

    if (force) {
        dashboardCache.delete(cacheKey);
        dashboardRequestCache.delete(cacheKey);
    }

    const dashboardRequest = api
        .get(path, {
            headers: makeAuthHeader(),
        })
        .then((response) => {
            const dashboard = response.data.data;

            dashboardCache.set(cacheKey, {
                data: dashboard,
                savedAt: Date.now(),
            });

            return dashboard;
        })
        .finally(() => {
            dashboardRequestCache.delete(cacheKey);
        });

    dashboardRequestCache.set(cacheKey, dashboardRequest);

    return dashboardRequest;
};

export const clearDashboardCache = () => {
    dashboardCache.clear();
    dashboardRequestCache.clear();
};

export const requestAdminDashboard = async (options) => {
    return requestDashboard("ADMIN", "/api/admin/dashboard", options);
};

export const requestUserDashboard = async (options) => {
    return requestDashboard("STUDENT", "/api/user/dashboard", options);
};
