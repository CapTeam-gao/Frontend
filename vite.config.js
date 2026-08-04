import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    define: {
        global: "globalThis",
    },
    server: {
        // VITE_BASE_URL이 없는 환경(.env.development 미생성 등)에서도
        // /api, /ws 요청이 프론트 서버가 아니라 백엔드로 가도록 하는 안전장치.
        // VITE_BASE_URL이 설정돼 있으면 axios가 절대주소로 바로 요청하므로 이 프록시는 안 쓰임.
        proxy: {
            "/api": {
                target: "http://localhost:8080",
                changeOrigin: true,
            },
            "/ws": {
                target: "http://localhost:8080",
                changeOrigin: true,
                ws: true,
            },
        },
    },
});
