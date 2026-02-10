import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // NexAgua brand colors
        navy: {
          50: '#f0f4ff',
          100: '#dde5ff',
          200: '#bacbff',
          300: '#91a7ff',
          400: '#647dff',
          500: '#3b5eff',
          600: '#1a4bff',
          700: '#0a2540',
          800: '#081a2e',
          900: '#04101f',
        },
        orange: {
          50: '#fff0e5',
          100: '#ffdcc8',
          200: '#ffb896',
          300: '#ff8b64',
          400: '#ff6b35',
          500: '#ff480a',
          600: '#e63a00',
          700: '#bd2d00',
          800: '#942300',
          900: '#7a1d00',
        },
        // Dark theme colors
        dark: '#0a2540',
        'dark-light': '#1e293b',
        'dark-lighter': '#334155',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
export default config