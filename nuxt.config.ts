import tailwindcss from "@tailwindcss/vite";
import { defineNuxtConfig } from "nuxt/config";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@hebilicious/vue-query-nuxt",
    "@morev/vue-transitions/nuxt",
    "@primevue/nuxt-module",
    "@vueuse/nuxt",
    "@pinia/nuxt",
    "@nuxt/icon",
    "@nuxt/eslint",
  ],
  ssr: false,
  components: [
    { path: "~/components", pathPrefix: false },
  ],
  devtools: { enabled: true },
  css: ["~/assets/main.css", "~/assets/index.scss", "primeicons/primeicons.css"],
  srcDir: "src/",
  experimental: {
    typedPages: true,
  },
  compatibilityDate: "2024-11-01",
  vite: {
    plugins: [tailwindcss()],
  },
  postcss: {
    plugins: {
      autoprefixer: {},
    },
  },
  hooks: {
    "prerender:routes"({ routes }) {
      routes.clear(); // Do not generate any routes (except the defaults)
    },
  },
  eslint: {
    config: {
      stylistic: {
        semi: true,
        quotes: "double",
      },
    },
  },
  primevue: {
    importTheme: { from: "@/primevue/mytheme.ts" },
    components: {
      exclude: ["Form", "FormField", "Editor", "Chart"],
    },
    directives: {
      include: ["Tooltip"],
    },
  },
  vueQuery: {
    vueQueryPluginOptions: {
      enableDevtoolsV6Plugin: true,
    },
  },
});
