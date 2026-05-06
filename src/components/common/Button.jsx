import "./Button.css";

const Button = ({ buttonSize, buttonColor, children, onClick, disabled }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`Button ${buttonSize} ${buttonColor}`}
        >
            {children}
        </button>
    );
};

export default Button;
