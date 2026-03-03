/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts}'],
  theme: {
    extend: {
      colors: {
        coffee: '#1c0f0a',
        espresso: '#4b2e1f',
        latte: '#ffc38f',
        neon: '#9ef1ff',
      },
      backgroundImage: {
        'coffee-gradient': 'linear-gradient(180deg, #1c0f0a 0%, #4b2e1f 100%)',
      },
    },
  },
  plugins: [],
}
