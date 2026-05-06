import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import Button from "../components/common/Button";
import Logo from "../assets/images/logo.png";
import { login } from "../api/authApi";
// import authStore from "../store/authStore";

// const { setToken } = authStore();

const Login = () => {
    const [studentId, setStudentId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const isDisabled = !studentId || !password;
    const nav = useNavigate();

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleLogin();
        }
    };

    const handleLogin = async () => {
        try {
            await login(studentId, password);

            nav("/main");
        } catch (e) {
            setError("아이디 또는 비밀번호가 올바르지 않습니다.");
        }
    };
    return (
        <div className="login-container">
            <div className="login-header">
                <img className="logo" src={Logo} alt="로고" />
                <p className="login-title">로그인</p>
                <p className="login-subtitle">
                    서비스를 이용하려면 로그인하세요
                </p>
            </div>
            <div className="login-form">
                <div className="studentId">
                    <label htmlFor="studentId">학번</label>
                    <input
                        type="text"
                        placeholder="학번을 입력해주세요"
                        id="studentId"
                        onChange={(e) => setStudentId(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>
                <div className="password">
                    <label htmlFor="password">비밀번호</label>
                    <input
                        type="password"
                        placeholder="비밀번호를 입력해주세요"
                        id="password"
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>
                {error && (
                    <p style={{ color: "red", fontSize: "15px" }}>{error}</p>
                )}
                <Button
                    buttonSize="large"
                    buttonColor="primary"
                    disabled={isDisabled}
                    onClick={handleLogin}
                >
                    로그인
                </Button>
            </div>
        </div>
    );
};

export default Login;
