export function useAuth() {
    const token = localStorage.getItem("ma_token") ?? "";

    const authHeader: Record<string, string> = token
        ? {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        }
        : {
            "Content-Type": "application/json",
        };

    return { token, authHeader };
}