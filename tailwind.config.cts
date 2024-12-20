import { default as TextStrokePlugin } from '@designbycode/tailwindcss-text-stroke'
import ContainerQueryPlugin from '@tailwindcss/container-queries'
import type { Config } from 'tailwindcss'
import PrimeVuePlugin from 'tailwindcss-primeui'
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,vue}",
  ],
  theme: {
    extend: {},
  },
  plugins: [PrimeVuePlugin, ContainerQueryPlugin, TextStrokePlugin],
} satisfies Config

