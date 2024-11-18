import {PrimeVueResolver} from '@primevue/auto-import-resolver';
import Vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import {VueRouterAutoImports} from 'unplugin-vue-router';
import VueRouter from 'unplugin-vue-router/vite';
import {defineConfig} from 'vite';
import RemoveConsole from "vite-plugin-remove-console";
import VueDevTools from 'vite-plugin-vue-devtools';
import Layouts from 'vite-plugin-vue-layouts';

export default defineConfig({
    plugins: [
        VueRouter({
            dts: 'dts/typed-router.d.ts',
        }),
        Vue(),
        RemoveConsole(),
        VueDevTools(),
        Layouts(),
        AutoImport({
            dts: "dts/auto-imports.d.ts",
            imports: ["vue", "@vueuse/core", "pinia", VueRouterAutoImports],
            dirs: ["src/api", "src/libs"],
            vueTemplate: true,
        }),
        Components({
            dts: "dts/components.d.ts",
            resolvers: [PrimeVueResolver()],
        })
    ],
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern'
            },
        }
    }
})
