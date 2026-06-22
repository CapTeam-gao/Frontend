const ADMIN_TEAM_CREATED_STORAGE_KEY = "capteam-admin-team-created";
export const ADMIN_TEAM_CREATED_CHANGE_EVENT = "admin-team-created-change";

export const getStoredAdminTeamCreated = () => {
    const storedValue = localStorage.getItem(ADMIN_TEAM_CREATED_STORAGE_KEY);

    if (storedValue === "true") return true;
    if (storedValue === "false") return false;

    return null;
};

export const setStoredAdminTeamCreated = (teamCreated) => {
    const nextTeamCreated = Boolean(teamCreated);

    localStorage.setItem(
        ADMIN_TEAM_CREATED_STORAGE_KEY,
        String(nextTeamCreated)
    );

    window.dispatchEvent(
        new CustomEvent(ADMIN_TEAM_CREATED_CHANGE_EVENT, {
            detail: nextTeamCreated,
        })
    );
};
