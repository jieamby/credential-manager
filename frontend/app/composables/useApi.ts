import type { AuthUser } from "~/types";

type FetchOpts = Parameters<typeof $fetch>[1];

export const useApi = () => {
  const config = useRuntimeConfig();
  const token = useCookie<string | null>("token");

  return async <T>(path: string, opts: FetchOpts = {}): Promise<T> => {
    try {
      return (await $fetch(path, {
        baseURL: config.public.apiBase,
        ...opts,
        headers: token.value ? { Authorization: `Bearer ${token.value}` } : {},
      })) as T;
    } catch (e) {
      if ((e as { status?: number }).status === 401) {
        token.value = null;
        useState<AuthUser | null>("auth-user").value = null;
        await navigateTo("/login");
      }
      throw e;
    }
  };
};
