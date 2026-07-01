import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { requestAdminDashboard, requestUserDashboard } from "../api/dashboardApi";
import { getAdminTeamCreationStatus } from "../utils/teamStatus";

const TeamCreatedRoute = ({ children, role, fallbackPath }) => {
    const [isTeamCreated, setIsTeamCreated] = useState(null);

    useEffect(() => {
        let ignore = false;

        const checkTeamCreated = async () => {
            try {
                const dashboard =
                    role === "ADMIN"
                        ? await requestAdminDashboard()
                        : await requestUserDashboard();
                const nextIsTeamCreated =
                    role === "ADMIN"
                        ? getAdminTeamCreationStatus(dashboard).allTeamCreated
                        : Boolean(dashboard.teamCreated);

                if (!ignore) {
                    setIsTeamCreated(nextIsTeamCreated);
                }
            } catch {
                if (!ignore) {
                    setIsTeamCreated(false);
                }
            }
        };

        checkTeamCreated();

        return () => {
            ignore = true;
        };
    }, [role]);

    if (isTeamCreated === null) return null;

    if (!isTeamCreated) {
        return <Navigate to={fallbackPath} replace />;
    }

    return children;
};

export default TeamCreatedRoute;
