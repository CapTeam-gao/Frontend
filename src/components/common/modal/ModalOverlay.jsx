const ModalOverlay = ({
    onClose,
    overlayClassName,
    modalClassName,
    ariaLabelledby,
    children,
}) => (
    <div className={overlayClassName} role="presentation" onClick={onClose}>
        <section
            className={modalClassName}
            role="dialog"
            aria-modal="true"
            aria-labelledby={ariaLabelledby}
            onClick={(event) => event.stopPropagation()}
        >
            {children}
        </section>
    </div>
);

export default ModalOverlay;
