import { useEffect, useState } from "react";

const useDelayedLoading = (isLoading, delay = 300) => {
    const [showLoading, setShowLoading] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            setShowLoading(false);
            return undefined;
        }

        const timerId = setTimeout(() => {
            setShowLoading(true);
        }, delay);

        return () => {
            clearTimeout(timerId);
        };
    }, [delay, isLoading]);

    return showLoading;
};

export default useDelayedLoading;
