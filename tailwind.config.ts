import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          50:  '#EBF5FF',
          100: '#D6EAFF',
          200: '#ADD5FF',
          300: '#85C0FF',
          400: '#5CABFF',
          500: '#1877F2',
          600: '#1877F2',
          700: '#1466D9',
          800: '#0F4FA6',
          900: '#0A3873',
        }
      },
    },
  },
  plugins: [],
};
export default config;
