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
import {
    getCapstoneLogUnavailableText,
    isCapstoneLogTime,
} from "../../../utils/capstoneLogTime";
import { getFilledFieldCount, getLogFields } from "../../../utils/log";
import styles from "./UserLogWrite.module.css";

const initialFormData = {
    activityContent: "",
    todayActivityContent: "",
    nextPlanContent: "",
    reflectionContent: "",
};

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

const getTodayText = () => {
    const today = new Date();

    return `${today.getMonth() + 1}월 ${today.getDate()}일(${
        DAY_LABELS[today.getDay()]
    })`;
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
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const getMyTeam = async () => {
            try {
                const data = await requestMyTeam();
                setMyTeam(data);

                if (!data?.myMember?.userId) {
                    setIsLoadingJournal(false);
                }
            } catch {
                setError("팀 정보를 불러오지 못했습니다.");
                setIsLoadingJournal(false);
            } finally {
                setIsLoadingTeam(false);
            }
        };

        getMyTeam();
    }, []);

    useEffect(() => {
        const timerId = window.setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => window.clearInterval(timerId);
    }, []);

    const isInitialLoading = isLoadingTeam || isLoadingJournal;
    const teamName = myTeam?.project?.teamName || myTeam?.teamName || "";
    const isLeader = myTeam?.myMember?.leaderRole === "LEADER";
    const canWriteLog = isCapstoneLogTime(currentTime);
    const logUnavailableText = getCapstoneLogUnavailableText(currentTime);
    const fields = getLogFields(isLeader);
    const filledCount = getFilledFieldCount(formData, fields);
    const progressPercent = fields.length
        ? Math.round((filledCount / fields.length) * 100)
        : 0;

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

        if (!canWriteLog) {
            setError(`현재는 일지 작성 시간이 아닙니다. ${logUnavailableText}`);
            return;
        }

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
                e.response?.data?.error || "일지 저장에 실패했습니다."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.content}>
                <section className={styles.pageHead}>
                    <div>
                        <h1
                            className={
                                isInitialLoading ? styles.hiddenTitle : ""
                            }
                        >
                            오늘 캡스톤 일지 작성
                        </h1>
                        <p className={styles.pageSub}>
                            {teamName && `${teamName} · `}
                            {getTodayText()}
                        </p>

                        {!isInitialLoading && canWriteLog && (
                            <div className={styles.progressLine}>
                                <div className={styles.progressTrack}>
                                    <div
                                        className={styles.progressFill}
                                        style={{
                                            width: `${progressPercent}%`,
                                        }}
                                    />
                                </div>
                                <p className={styles.progressLabel}>
                                    작성 완료 <b>{filledCount}</b> /{" "}
                                    {fields.length}
                                </p>
                            </div>
                        )}
                    </div>

                    {!isInitialLoading && canWriteLog && (
                        <span className={styles.roleTag}>
                            {isLeader ? "팀장 작성" : "팀원 작성"} ·{" "}
                            {fields.length}개 항목
                        </span>
                    )}
                </section>

                {!canWriteLog && (
                    <p className={styles.errorText}>
                        현재는 일지 작성 시간이 아닙니다. {logUnavailableText}
                    </p>
                )}

                {!isInitialLoading && canWriteLog && (
                    <UserLogForm
                        formData={formData}
                        isLeader={isLeader}
                        isSubmitting={isSubmitting}
                        isCompleted={isCompleted}
                        submitText={isEditMode ? "수정 완료" : "작성 완료"}
                        successMessage={successMessage}
                        error={error}
                        onFieldChange={handleFieldChange}
                        onSubmit={handleSubmit}
                    />
                )}
            </main>
        </div>
    );
};

export default UserLogWrite;
