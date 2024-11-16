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
  plugins: [PrimeVuePlugin],
} satisfies Config

