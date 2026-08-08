import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {
    requestAdminDashboard,
    requestUserDashboard,
} from "../api/dashboardApi";
import { getAdminTeamCreationStatus } from "../utils/teamStatus";

const TeamCreatedRoute = ({ children, role, fallbackPath }) => {
    const [isTeamCreated, setIsTeamCreated] = useState(null);
    const [loadError, setLoadError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        let ignore = false;

        const checkTeamCreated = async () => {
            try {
                const dashboard =
                    role === "ADMIN"
                        ? await requestAdminDashboard()
                        : await requestUserDashboard();

                let nextIsTeamCreated;

                if (role === "ADMIN") {
                    const teamStatus = getAdminTeamCreationStatus(dashboard);

                    nextIsTeamCreated = teamStatus.allTeamCreated;
                } else {
                    nextIsTeamCreated = Boolean(dashboard.teamCreated);
                }

                if (!ignore) {
                    setLoadError(false);
                    setIsTeamCreated(nextIsTeamCreated);
                }
            } catch {
                if (!ignore) {
                    setLoadError(true);
                    setIsTeamCreated(null);
                }
            }
        };

        checkTeamCreated();

        return () => {
            ignore = true;
        };
    }, [role, retryCount]);

    if (loadError) {
        return (
            <div style={{ padding: 40, textAlign: "center" }}>
                <p>페이지 정보를 불러오지 못했습니다. 네트워크 상태를 확인해주세요.</p>
                <button type="button" onClick={() => setRetryCount((count) => count + 1)}>
                    다시 시도
                </button>
            </div>
        );
    }

    if (isTeamCreated === null) {
        return null;
    }

    if (!isTeamCreated) {
        return <Navigate to={fallbackPath} replace />;
    }

    return children;
};

export default TeamCreatedRoute;
