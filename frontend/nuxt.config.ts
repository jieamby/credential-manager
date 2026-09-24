export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  modules: ["@nuxtjs/tailwindcss"],
  typescript: { strict: true },
  css: ["~/assets/css/main.css"],
  app: {
    head: {
      title: "Credential Manager",
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700&family=Instrument+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap",
        },
      ],
    },
  },
  devServer: { port: 3001 },
  runtimeConfig: { public: { apiBase: "https://credential-manager-gqoo9p44x-jieambys-projects.vercel.app/api" } },
});
