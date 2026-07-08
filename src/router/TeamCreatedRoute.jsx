import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
    requestAdminDashboard,
    requestUserDashboard,
} from "../api/dashboardApi";
import { getAdminTeamCreationStatus } from "../utils/teamStatus";

const TeamCreatedRoute = ({
    children,
    role,
    fallbackPath,
    allowPartialAccess = false,
}) => {
    const location = useLocation();
    const navigate = useNavigate();

    /*
     * 첫 번째 학년 승인 직후 전달된 임시 접근권한입니다.
     *
     * useRef에 최초 접근 여부를 보관하기 때문에 현재 팀 관리
     * 화면에서는 유지되지만, 화면을 벗어나 컴포넌트가 종료되면
     * 임시 접근권한도 사라집니다.
     */
    const partialAccessRef = useRef(
        role === "ADMIN" &&
            allowPartialAccess &&
            location.state?.allowPartialTeamAccess === true
    );

    const [isTeamCreated, setIsTeamCreated] = useState(null);

    /*
     * 현재 브라우저 히스토리에 남아 있는 임시 접근 state를 제거합니다.
     *
     * 따라서 다른 페이지로 이동했다가 뒤로 가거나 직접 주소를
     * 입력해도 임시 접근권한을 다시 사용할 수 없습니다.
     */
    useEffect(() => {
        if (
            partialAccessRef.current &&
            location.state?.allowPartialTeamAccess === true
        ) {
            navigate(
                {
                    pathname: location.pathname,
                    search: location.search,
                },
                {
                    replace: true,
                    state: null,
                }
            );
        }
    }, [location.pathname, location.search, location.state, navigate]);

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

                    nextIsTeamCreated =
                        (allowPartialAccess
                            ? teamStatus.teamManageAccessible
                            : teamStatus.allTeamCreated) ||
                        partialAccessRef.current;
                } else {
                    nextIsTeamCreated = Boolean(dashboard.teamCreated);
                }

                if (!ignore) {
                    setIsTeamCreated(nextIsTeamCreated);
                }
            } catch {
                /*
                 * 대시보드 API 확인이 실패해도 승인 직후 임시 접근은
                 * 허용합니다. 일반적인 재진입은 차단됩니다.
                 */
                if (!ignore) {
                    setIsTeamCreated(partialAccessRef.current);
                }
            }
        };

        checkTeamCreated();

        return () => {
            ignore = true;
        };
    }, [allowPartialAccess, role]);

    if (isTeamCreated === null) {
        return null;
    }

    if (!isTeamCreated) {
        return <Navigate to={fallbackPath} replace />;
    }

    return children;
};

export default TeamCreatedRoute;
