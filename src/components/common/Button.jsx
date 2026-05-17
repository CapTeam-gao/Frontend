import styles from "./Button.module.css";

const Button = ({ buttonSize, buttonColor, children, onClick, disabled }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${styles.button} ${styles[buttonSize]} ${styles[buttonColor]}`}
        >
            {children}
        </button>
    );
};

export default Button;
