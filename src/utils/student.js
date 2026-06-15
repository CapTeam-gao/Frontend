import { roleLabels } from "../constants/student";

export const getStudentNumberInfo = (userId = "") => {
    const number = userId.replace("stu", "");

    if (number.length !== 4) {
        return {
            number,
            classText: "-",
        };
    }

    return {
        number,
        classText: `${number[0]}학년 ${number[1]}반 ${Number(
            number.slice(2)
        )}번`,
    };
};

export const normalizeSearchText = (value = "") =>
    String(value).toLowerCase().replace(/\s/g, "");

export const getStudentSearchText = (student) => {
    const numberInfo = getStudentNumberInfo(student.userId);
    const roleText = roleLabels[student.studentRole] || student.studentRole;

    return [
        student.name,
        student.userId,
        numberInfo.number,
        numberInfo.classText,
        roleText,
    ]
        .filter(Boolean)
        .map(normalizeSearchText)
        .join(" ");
};
