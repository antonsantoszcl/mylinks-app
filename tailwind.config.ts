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
          50:  '#F0F4FA',
          100: '#E1E9F4',
          200: '#C3D3E9',
          300: '#9BB4D8',
          400: '#7399CA',
          500: '#5686C8',
          600: '#4C78D4',
          700: '#3A6FD8',
          800: '#2E5AAF',
          900: '#234580',
        }
      },
    },
  },
  plugins: [],
};
export default config;
