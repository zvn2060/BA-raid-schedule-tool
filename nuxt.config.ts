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
    "@nuxt/test-utils/module",
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
    resolve: {
      alias: {
        stream: "stream-browserify",
      },
    },
    build: {
      commonjsOptions: {
      // ignore built-in modules in Node.js
        ignore: ["os", "child_process", "worker_threads"],
      },
    },
  },
  postcss: {
    plugins: {
      autoprefixer: {},
    },
  },
  hooks: {
    "vite:extendConfig"(viteInlineConfig, env) {
      if (env.isClient) {
        const importPlugin = viteInlineConfig.plugins?.find(p => p && "name" in p && p.name === "nuxt:imports-transform");
        if (importPlugin) {
          viteInlineConfig.worker ||= {};
          viteInlineConfig.worker.plugins = () => [importPlugin];
        }
      }
    },
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
