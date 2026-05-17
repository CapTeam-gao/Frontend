import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import Button from "../components/common/Button";
import Logo from "../assets/images/logo.png";
import { login, getMe } from "../api/authApi";
import authStore from "../store/authStore";
import Header from "../components/common/Header";
import SearchBar from "../components/common/SearchBar";

const Login = () => {
    const [studentId, setStudentId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const isDisabled = !studentId || !password;
    const nav = useNavigate();
    const setUser = authStore((state) => state.setUser);

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleLogin();
        }
    };

    const handleLogin = async () => {
        try {
            await login(studentId, password);
            const res = await getMe();
            const user = res.data;
            await setUser(user);
            if (user.role === "admin") {
                nav("/admin/dashboard");
            } else {
                nav("/user/dashboard");
            }
        } catch (e) {
            if (e.response?.status === 401) {
                setError("아이디 또는 비밀번호가 올바르지 않습니다.");
            } else {
                setError("서버 오류입니다.");
            }
        }
    };

    return (
        <div className={styles.container}>
            <Header />
            <SearchBar />
            <div className={styles.header}>
                <img className={styles.logo} src={Logo} alt="로고" />
                <p className={styles.title}>로그인</p>
                <p className={styles.subtitle}>
                    서비스를 이용하려면 로그인하세요
                </p>
            </div>
            <div className={styles.form}>
                <div className={styles.field}>
                    <label htmlFor="studentId">학번</label>
                    <input
                        type="text"
                        placeholder="학번을 입력해주세요"
                        id="studentId"
                        onChange={(e) => setStudentId(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>
                <div className={styles.field}>
                    <label htmlFor="password">비밀번호</label>
                    <input
                        type="password"
                        placeholder="비밀번호를 입력해주세요"
                        id="password"
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>
                {error && <p className={styles.error}>{error}</p>}
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
