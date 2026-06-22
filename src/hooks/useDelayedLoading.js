import { useEffect, useState } from "react";

const useDelayedLoading = (isLoading, delay = 300) => {
    const [showLoading, setShowLoading] = useState(false);

    useEffect(() => {
        const timerId = setTimeout(
            () => {
                setShowLoading(isLoading);
            },
            isLoading ? delay : 0
        );

        return () => {
            clearTimeout(timerId);
        };
    }, [delay, isLoading]);

    return showLoading;
};

export default useDelayedLoading;
