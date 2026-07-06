export const normalizeAccountRole = (role) => {
    if (typeof role !== "string") return "";

    return role.trim().replace(/^ROLE_/, "");
};

export const isAdminRole = (role) => normalizeAccountRole(role) === "ADMIN";

export const isStudentRole = (role) =>
    normalizeAccountRole(role) === "STUDENT";
