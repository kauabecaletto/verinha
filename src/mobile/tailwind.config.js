/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      sans: ['Poppins', 'sans-serif'],
    },
    extend: {
      colors: {
        'bg-page': '#f9f7f2',
        'primary': '#6b433b',
        'text-dark': '#341d21',
        'text-light': '#f9f7f2',
        'black': '#000000',
        'white': '#ffffff',
        'border': '#d0d4df',
      },
      borderRadius: {
        'sm': '4px',
        'md': '10px',
        'lg': '20px',
        'xl': '24px',
      },
      boxShadow: {
        'sm': '0 2px 4px rgba(0,0,0,0.1)',
        'md': '0 2px 10px rgba(0,0,0,0.08)',
        'lg': '0 4px 12px rgba(0,0,0,0.15)',
      },
      animation: {
        'float': 'floatAnimation 3s ease-in-out infinite',
      },
      keyframes: {
        floatAnimation: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
      },
    },
  },
  plugins: [],
};
