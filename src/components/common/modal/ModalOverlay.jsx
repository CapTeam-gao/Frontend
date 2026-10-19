import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ModalCloseContext } from "./modalCloseContext";
import styles from "./ModalOverlay.module.css";

// 퇴장 모션이 끝난 뒤에 onClose를 부른다 — 부모가 바로 언마운트하면 나가는 모션이 안 보인다
const CLOSE_DURATION = 300;

const ModalOverlay = ({
    onClose,
    overlayClassName = "",
    modalClassName = "",
    ariaLabelledby,
    children,
}) => {
    const [isClosing, setIsClosing] = useState(false);
    const closeTimerRef = useRef(null);
    const panelRef = useRef(null);
    const previousFocusRef = useRef(null);

    useEffect(() => {
        return () => clearTimeout(closeTimerRef.current);
    }, []);

    const handleClose = useCallback(() => {
        if (closeTimerRef.current) return;

        setIsClosing(true);
        closeTimerRef.current = setTimeout(onClose, CLOSE_DURATION);
    }, [onClose]);

    useEffect(() => {
        previousFocusRef.current = document.activeElement;
        const panel = panelRef.current;
        const focusableSelector =
            'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';
        const getFocusableElements = () =>
            Array.from(panel?.querySelectorAll(focusableSelector) || []).filter(
                (element) =>
                    !element.closest('[aria-hidden="true"]') &&
                    getComputedStyle(element).visibility !== "hidden" &&
                    element.getClientRects().length > 0
            );

        (getFocusableElements()[0] || panel)?.focus();

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                handleClose();
                return;
            }

            if (event.key !== "Tab") return;

            const focusableElements = getFocusableElements();
            if (focusableElements.length === 0) {
                event.preventDefault();
                panel?.focus();
                return;
            }

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.shiftKey && document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            } else if (
                !event.shiftKey &&
                document.activeElement === lastElement
            ) {
                event.preventDefault();
                firstElement.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        const previousOverflow = document.body.style.overflow;
        const previousHtmlOverflow = document.documentElement.style.overflow;
        const previousScrollbarGutter = document.documentElement.style.scrollbarGutter;
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
        document.documentElement.style.scrollbarGutter = "stable";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = previousOverflow;
            document.documentElement.style.overflow = previousHtmlOverflow;
            document.documentElement.style.scrollbarGutter = previousScrollbarGutter;
            if (previousFocusRef.current instanceof HTMLElement) {
                previousFocusRef.current.focus();
            }
        };
    }, [handleClose]);

    // 헤더의 backdrop-filter 등 transform/filter가 걸린 조상 안에서 렌더되면
    // position: fixed가 그 조상 기준으로 잡혀 오버레이가 화면 전체를 덮지 못한다.
    // body로 포털해서 항상 뷰포트 기준으로 고정되게 한다.
    return createPortal(
        <ModalCloseContext.Provider value={handleClose}>
            <div
                className={`${overlayClassName} ${styles.overlay} ${
                    isClosing ? styles.overlayClosing : ""
                }`}
                role="presentation"
                onClick={handleClose}
            >
                <section
                    ref={panelRef}
                    className={`${modalClassName} ${styles.panel} ${isClosing ? styles.panelClosing : ""}`}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={ariaLabelledby}
                    tabIndex={-1}
                    onClick={(event) => event.stopPropagation()}
                >
                    {children}
                </section>
            </div>
        </ModalCloseContext.Provider>,
        document.body
    );
};

export default ModalOverlay;
