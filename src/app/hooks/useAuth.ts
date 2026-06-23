export function useAuth() {
    const token = localStorage.getItem("ma_token") ?? "";

    const authHeader: HeadersInit = token
        ? {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        }
        : {
            "Content-Type": "application/json",
        };

    return { token, authHeader };
}