import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ModalCloseContext } from "./modalCloseContext";
import styles from "./ModalOverlay.module.css";

// 퇴장 모션이 끝난 뒤에 onClose를 부른다 — 부모가 바로 언마운트하면 나가는 모션이 안 보인다
const CLOSE_DURATION = 240;

const ModalOverlay = ({
    onClose,
    overlayClassName = "",
    modalClassName = "",
    ariaLabelledby,
    children,
}) => {
    const [isShown, setIsShown] = useState(false);
    const closeTimerRef = useRef(null);

    // 마운트된 다음 프레임에 클래스를 붙여야 transition이 시작점부터 실행된다
    useEffect(() => {
        const frameId = requestAnimationFrame(() =>
            requestAnimationFrame(() => setIsShown(true))
        );

        return () => cancelAnimationFrame(frameId);
    }, []);

    useEffect(() => {
        return () => clearTimeout(closeTimerRef.current);
    }, []);

    const handleClose = useCallback(() => {
        if (closeTimerRef.current) return;

        setIsShown(false);
        closeTimerRef.current = setTimeout(onClose, CLOSE_DURATION);
    }, [onClose]);

    useEffect(() => {
        const closeOnEscape = (event) => {
            if (event.key === "Escape") handleClose();
        };

        document.addEventListener("keydown", closeOnEscape);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", closeOnEscape);
            document.body.style.overflow = previousOverflow;
        };
    }, [handleClose]);

    // 헤더의 backdrop-filter 등 transform/filter가 걸린 조상 안에서 렌더되면
    // position: fixed가 그 조상 기준으로 잡혀 오버레이가 화면 전체를 덮지 못한다.
    // body로 포털해서 항상 뷰포트 기준으로 고정되게 한다.
    return createPortal(
        <ModalCloseContext.Provider value={handleClose}>
            <div
                className={`${overlayClassName} ${styles.overlay} ${
                    isShown ? styles.overlayShown : ""
                }`}
                role="presentation"
                onClick={handleClose}
            >
                <section
                    className={`${modalClassName} ${styles.panel} ${
                        isShown ? styles.panelShown : ""
                    }`}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={ariaLabelledby}
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
