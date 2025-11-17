import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2EFF9D',
        background: '#0A0A0F',
        panel: '#1A1A23',
        slate: '#2F3140',
        accent: '#3FD7FF',
        alert: '#FF4D4D',
        warning: '#FFC857',
        textPrimary: '#F7F9FA',
        textSecondary: '#A4A6B3',
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 12px 30px rgba(10, 10, 15, 0.35)',
      },
      borderRadius: {
        md: '12px',
        lg: '20px',
      },
    },
  },
  plugins: [],
};

export default config;
