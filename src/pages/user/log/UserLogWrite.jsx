import { useState } from "react";
import Header from "../../../components/common/header/Header";
import UserLogForm from "../../../components/user/log/UserLogForm";
import authStore from "../../../store/authStore";
import styles from "./UserLogWrite.module.css";

const initialFormData = {
    activityContent: "",
    todayActivityContent: "",
    nextPlanContent: "",
    reflectionContent: "",
};

const getTodayText = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const date = String(today.getDate()).padStart(2, "0");

    return `${year}.${month}.${date}`;
};

const UserLogWrite = () => {
    const user = authStore((state) => state.user);
    const [formData, setFormData] = useState(initialFormData);
    const [error, setError] = useState("");
    const [isSubmitting] = useState(false);

    const teamName = user?.teamName || "Team Gao";
    const isLeader =
        user?.leaderRole === "LEADER" ||
        user?.teamRole === "LEADER" ||
        user?.roleInTeam === "LEADER";

    const handleFieldChange = (fieldName, value) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            [fieldName]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("API 연결 후 저장 기능이 동작합니다.");
    };

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.content}>
                <section className={styles.hero}>
                    <p className={styles.eyebrow}>캡스톤 일지</p>
                    <h1>{teamName} 캡스톤 일지</h1>
                    <span>{getTodayText()}</span>
                </section>

                <UserLogForm
                    formData={formData}
                    isLeader={isLeader}
                    isSubmitting={isSubmitting}
                    error={error}
                    onFieldChange={handleFieldChange}
                    onSubmit={handleSubmit}
                />
            </main>
        </div>
    );
};

export default UserLogWrite;
