import styles from "./Button.module.css";

const Button = ({
    type = "button",
    buttonSize,
    buttonColor,
    children,
    onClick,
    disabled,
}) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${styles.button} ${styles[buttonSize]} ${styles[buttonColor]}`}
        >
            {children}
        </button>
    );
};

export default Button;
