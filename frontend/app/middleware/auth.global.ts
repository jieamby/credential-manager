const PUBLIC_PAGES = ["/login", "/register"];

export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie<string | null>("token");
  const isPublic = PUBLIC_PAGES.includes(to.path);
  if (!token.value && !isPublic) return navigateTo("/login");
  if (token.value && isPublic) return navigateTo("/credentials");
});
