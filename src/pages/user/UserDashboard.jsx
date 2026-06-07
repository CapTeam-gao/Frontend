import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/common/Header";
import { requestUserDashboard } from "../../api/dashboardApi";
import { subscribeNoticeCreated } from "../../api/noticeSocket";
import authStore from "../../store/authStore";

const cardStyle = {
    position: "relative",
    display: "block",
    padding: "28px",
    border: "1px solid #d9dde5",
    borderRadius: "8px",
    color: "#111827",
    textDecoration: "none",
};

const badgeStyle = {
    position: "absolute",
    top: "16px",
    right: "16px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "#ef4444",
    color: "#ffffff",
    fontWeight: 700,
};

const UserDashboard = () => {
    const accessToken = authStore((state) => state.accessToken);
    const [dashboard, setDashboard] = useState({
        teamCreated: false,
        teamChatActiveStudentCount: 0,
        capstoneTime: false,
        todayJournalSubmitted: false,
        hasUnreadNotice: false,
    });
    const [error, setError] = useState("");

    useEffect(() => {
        const getDashboard = async () => {
            try {
                const data = await requestUserDashboard();
                setDashboard((prevDashboard) => ({
                    ...prevDashboard,
                    ...data,
                }));
            } catch {
                setError("대시보드 정보를 불러오지 못했습니다.");
            }
        };

        getDashboard();
    }, []);

    useEffect(() => {
        if (!accessToken) return undefined;

        return subscribeNoticeCreated(accessToken, () => {
            setDashboard((prevDashboard) => ({
                ...prevDashboard,
                hasUnreadNotice: true,
            }));
        });
    }, [accessToken]);

    const featurePath = (path) =>
        dashboard.teamCreated ? path : "/user/dashboard";

    return (
        <div>
            <Header />

            <main style={{ padding: "48px 64px" }}>
                {error && <p style={{ color: "#ef4444" }}>{error}</p>}

                <section
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                        gap: "24px",
                    }}
                >
                    <Link to={featurePath("/user/chat")} style={cardStyle}>
                        <h1>팀 채팅</h1>
                        <p>
                            {dashboard.teamCreated
                                ? `${dashboard.teamChatActiveStudentCount}명 현재 활동중`
                                : "팀 생성 전입니다"}
                        </p>
                    </Link>

                    <Link to={featurePath("/user/project")} style={cardStyle}>
                        <h2>프로젝트</h2>
                        {!dashboard.teamCreated && <p>팀 생성 전입니다</p>}
                    </Link>

                    <Link to={featurePath("/user/log")} style={cardStyle}>
                        <h2>캡스톤 일지</h2>
                        <p>
                            {!dashboard.teamCreated
                                ? "팀 생성 전입니다"
                                : dashboard.capstoneTime &&
                                    !dashboard.todayJournalSubmitted
                                  ? "오늘 일지 미제출"
                                  : ""}
                        </p>
                    </Link>

                    <Link to="/user/notice" style={cardStyle}>
                        {dashboard.hasUnreadNotice && (
                            <span style={badgeStyle}>N</span>
                        )}
                        <h2>공지</h2>
                    </Link>
                </section>
            </main>
        </div>
    );
};

export default UserDashboard;
