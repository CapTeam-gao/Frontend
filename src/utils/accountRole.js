export const normalizeAccountRole = (role) => {
    if (typeof role !== "string") return "";

    return role.trim().toUpperCase().replace(/^ROLE_/, "");
};

export const isAdminRole = (role) => normalizeAccountRole(role) === "ADMIN";

export const isStudentRole = (role) =>
    normalizeAccountRole(role) === "STUDENT";

export const getSupportedAccountRole = (...roles) => {
    for (const role of roles) {
        const normalizedRole = normalizeAccountRole(role);

        if (normalizedRole === "ADMIN" || normalizedRole === "STUDENT") {
            return normalizedRole;
        }
    }

    return "";
};
