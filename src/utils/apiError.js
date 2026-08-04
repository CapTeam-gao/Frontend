// 백엔드 GlobalExceptionHandler가 처리한 에러는 { error: "한글 메시지" } 형태로 내려온다.
// 근데 405처럼 GlobalExceptionHandler가 못 잡는 예외는 스프링 기본 에러 응답으로 빠지는데,
// 그 응답도 우연히 { error: "Method Not Allowed" } 같은 영문 필드를 갖고 있어서
// 그대로 화면에 노출되는 문제가 있었다. GlobalExceptionHandler가 실제로 내려주는
// 상태코드에서만 서버 메시지를 믿고, 그 외에는 항상 한글 fallback을 쓴다.
const HANDLED_ERROR_STATUS_CODES = new Set([400, 401, 403, 404, 503]);

export const getApiErrorMessage = (error, fallback) => {
    const status = error?.response?.status;
    const serverMessage = error?.response?.data?.error;

    if (
        HANDLED_ERROR_STATUS_CODES.has(status) &&
        typeof serverMessage === "string" &&
        serverMessage.trim()
    ) {
        return serverMessage;
    }

    return fallback;
};
