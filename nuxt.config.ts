// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  css: ['~/assets/index.scss', 'primeicons/primeicons.css'],
  hooks: {
    'prerender:routes'({ routes }) {
      routes.clear() // Do not generate any routes (except the defaults)
    }
  },
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  experimental: {
    typedPages: true
  },
  modules: [
    "@hebilicious/vue-query-nuxt",
    "@morev/vue-transitions/nuxt",
    "@primevue/nuxt-module",
    "@vueuse/nuxt",
    "@pinia/nuxt",
    "@nuxt/icon"
  ],
  primevue: {
    importTheme: { from: "@/primevue/mytheme.ts" },
    components: {
      exclude: ["Form", "FormField", "Editor", "Chart"],
    },
    directives: {
      include: ['Tooltip']
    }
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    }
  }
})