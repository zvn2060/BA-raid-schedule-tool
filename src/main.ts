import { definePreset } from '@primevue/themes';
import Aura from '@primevue/themes/aura';
import { BlockUIDesignTokens } from '@primevue/themes/aura/blockui';
import { MenubarDesignTokens } from '@primevue/themes/aura/menubar';
import { VueQueryPlugin } from '@tanstack/vue-query';
import "primeicons/primeicons.css";
import { Tooltip } from 'primevue';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import { setupLayouts } from 'virtual:generated-layouts';
import { createApp } from 'vue';
import { createRouter, createWebHistory } from "vue-router";
import { routes } from 'vue-router/auto-routes';
import App from './App.vue';
import "./assets/index.scss";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: setupLayouts(routes),
});

const MyPreset = definePreset(Aura, {
    components: {
        blockui: {
            root: { borderRadius: "0" }
        } satisfies BlockUIDesignTokens,
        menubar: {
            root: { background: "{primary.600}", color: "{surface.0}", borderRadius: "0", borderColor: "none" },
            item: { focusBackground: '{primary.700}', color: "{surface.0}", focusColor: "{surface.0}" },
            mobileButton: { hoverBackground: '{primary.700}', color: "{surface.0}", hoverColor: "{surface.0}" },
            submenu: { background: "{primary.800}", borderRadius: "0", borderColor: "none" }
        } satisfies MenubarDesignTokens,

    }
})

const pinia = createPinia();

createApp(App)
    .use(VueQueryPlugin)
    .use(router)
    .use(pinia)
    .use(ToastService)
    .use(PrimeVue, { theme: { preset: MyPreset, options: { darkModeSelector: '' } } })
    .directive("tooltip", Tooltip)
    .mount('#app');


