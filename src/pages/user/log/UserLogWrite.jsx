import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/common/header/Header";
import UserLogForm from "../../../components/user/log/UserLogForm";
import { requestMyTeam } from "../../../api/teamApi";
import {
    requestCreateUserLog,
    requestUpdateUserLog,
    requestUserLogDetail,
    requestUserLogList,
} from "../../../api/logApi";
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
const getTodayApiDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const date = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${date}`;
};

const UserLogWrite = () => {
    const navigate = useNavigate();
    const [myTeam, setMyTeam] = useState(null);
    const [journalId, setJournalId] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [formData, setFormData] = useState(initialFormData);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoadingTeam, setIsLoadingTeam] = useState(true);
    const [isLoadingJournal, setIsLoadingJournal] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const getMyTeam = async () => {
            try {
                const data = await requestMyTeam();
                setMyTeam(data);
            } catch {
                setError("팀 정보를 불러오지 못했습니다.");
            } finally {
                setIsLoadingTeam(false);
            }
        };

        getMyTeam();
    }, []);

    const teamName =
        myTeam?.project?.teamName || myTeam?.teamName || "팀 정보 확인 중";
    const isLeader = myTeam?.myMember?.leaderRole === "LEADER";

    const handleFieldChange = (fieldName, value) => {
        setSuccessMessage("");
        setFormData((prevFormData) => ({
            ...prevFormData,
            [fieldName]: value,
        }));
    };
    useEffect(() => {
        const getTodayJournal = async () => {
            try {
                const journals = await requestUserLogList();
                const todayApiDate = getTodayApiDate();

                const todayJournal = journals.find(
                    (journal) => journal.date === todayApiDate
                );

                if (!todayJournal) {
                    return;
                }

                const detail = await requestUserLogDetail(
                    todayJournal.journalId
                );

                setJournalId(detail.journalId);
                setIsCompleted(detail.status === "COMPLETED");

                const myEntry = detail.entries?.find(
                    (entry) => entry.writerId === myTeam?.myMember?.userId
                );

                if (myEntry) {
                    setIsEditMode(true);
                    setFormData({
                        activityContent: myEntry.activityContent || "",
                        todayActivityContent: detail.todayActivityContent || "",
                        nextPlanContent: myEntry.nextPlanContent || "",
                        reflectionContent: myEntry.reflectionContent || "",
                    });
                }
            } catch {
                setError("오늘 일지 정보를 불러오지 못했습니다.");
            } finally {
                setIsLoadingJournal(false);
            }
        };

        if (myTeam?.myMember?.userId) {
            getTodayJournal();
        }
    }, [myTeam?.myMember?.userId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isCompleted) {
            setError("팀원 전체 제출이 완료된 일지는 수정할 수 없습니다.");
            return;
        }

        try {
            setError("");
            setSuccessMessage("");
            setIsSubmitting(true);

            if (isEditMode && journalId) {
                await requestUpdateUserLog(journalId, formData);
            } else {
                const savedLog = await requestCreateUserLog(formData);
                setJournalId(savedLog.journalId);
                setIsEditMode(true);
            }

            setIsEditMode(true);
            navigate("/user/dashboard");
        } catch (e) {
            setError(
                e.response?.data?.message ||
                    e.response?.data?.error ||
                    "일지 저장에 실패했습니다."
            );
        } finally {
            setIsSubmitting(false);
        }
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
                    isSubmitting={
                        isSubmitting || isLoadingTeam || isLoadingJournal
                    }
                    isCompleted={isCompleted}
                    submitText={isEditMode ? "수정 완료" : "작성 완료"}
                    successMessage={successMessage}
                    error={error}
                    onFieldChange={handleFieldChange}
                    onSubmit={handleSubmit}
                />
            </main>
        </div>
    );
};

export default UserLogWrite;
