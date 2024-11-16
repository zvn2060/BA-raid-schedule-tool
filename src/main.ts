import Aura from '@primevue/themes/aura';
import { VueQueryPlugin } from '@tanstack/vue-query';
import "primeicons/primeicons.css";
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import { setupLayouts } from 'virtual:generated-layouts';
import { createApp } from 'vue';
import { createMemoryHistory, createRouter } from "vue-router";
import { routes } from 'vue-router/auto-routes';
import App from './App.vue';
import "./assets/index.scss";

const router = createRouter({
    history: createMemoryHistory(),
    routes: setupLayouts(routes),
});

const pinia = createPinia();

createApp(App)
    .use(VueQueryPlugin)
    .use(router)
    .use(pinia)
    .use(ToastService)
    .use(PrimeVue, { theme: { preset: Aura, options: { darkModeSelector: '' } } })
    .mount('#app');
