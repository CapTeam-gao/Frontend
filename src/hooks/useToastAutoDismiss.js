import { useEffect } from "react";

const useToastAutoDismiss = (toasts, onDismiss, duration) => {
    useEffect(() => {
        const timers = toasts.map((toast) =>
            setTimeout(() => onDismiss(toast.id), duration)
        );

        return () => timers.forEach((timer) => clearTimeout(timer));
    }, [toasts, onDismiss, duration]);
};

export default useToastAutoDismiss;
