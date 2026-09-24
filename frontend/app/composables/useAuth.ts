import type { AuthResponse, AuthUser } from "~/types";

export const useAuth = () => {
  const token = useCookie<string | null>("token", { maxAge: 60 * 60 * 24 });
  const user = useState<AuthUser | null>("auth-user", () => null);
  const api = useApi();

  const setSession = (res: AuthResponse) => {
    token.value = res.accessToken;
    user.value = res.user;
  };

  const login = async (email: string, password: string) =>
    setSession(
      await api<AuthResponse>("/auth/login", {
        method: "POST",
        body: { email, password },
      }),
    );

  const register = async (
    name: string | undefined,
    email: string,
    password: string,
  ) =>
    setSession(
      await api<AuthResponse>("/auth/register", {
        method: "POST",
        body: { name, email, password },
      }),
    );

  const fetchUser = async () => {
    if (!token.value || user.value) return;
    try {
      user.value = await api<AuthUser>("/auth/me");
    } catch {
      user.value = null;
    }
  };

  const logout = async () => {
    token.value = null;
    user.value = null;
    await navigateTo("/login");
  };

  return {
    token,
    user,
    login,
    register,
    fetchUser,
    logout,
    isLoggedIn: computed(() => !!token.value),
  };
};
