/** @type {import('tailwindcss').Config} */
// JoinTeer brand tokens: see the "JoinTeer — Brand Strategy & Positioning" guide.
module.exports = {
  content: ['./src/**/*.{js,jsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        // Primary: deep brick red with an orange undertone. 700 = buttons and links (6.4:1 on white).
        sambal: {
          50: '#FDF1EA', 100: '#FBE3D6', 200: '#F5C4AC', 300: '#EC9C7C', 400: '#DE7550',
          500: '#D0572C', 600: '#C24A22', 700: '#A83A1B', 800: '#8A2E15', 900: '#6B2410',
        },
        // Accent: warm ochre. Fills only, never text on light backgrounds.
        kaya: {
          50: '#FDF6E7', 100: '#FBEBC9', 200: '#F6D89A', 300: '#F0C06A', 400: '#E8A33D', 500: '#D98B22', 600: '#B96F14',
        },
        // Text and dark bands: warm near-black browns. 600 = secondary text (7.0:1 on white).
        kopi: {
          300: '#C2B3A6', 400: '#9C8676', 600: '#6B5446', 700: '#574235', 800: '#3F2C22', 900: '#2B1D16',
        },
        rice: { 50: '#FBF6EF', 100: '#F6EEE3' },
        sand: { 100: '#F1E8DB', 200: '#E8DCCB', 300: '#D9C8B2' },
        pandan: { 50: '#EEF6EE', 100: '#DDEEDD', 600: '#3A7D4B', 700: '#2F6B3F', 800: '#245431' },
        chilli: { 50: '#FDECEE', 100: '#F9D5D9', 600: '#C62A3C', 700: '#B01E2F', 800: '#8F1826' },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"Atkinson Hyperlegible Next"', 'system-ui', '-apple-system', '"Segoe UI"', '"Noto Sans SC"', '"Noto Sans Tamil"', 'sans-serif'],
      },
      fontSize: {
        // Body text is never smaller than 17px; captions never below 14px.
        sm: ['0.875rem', { lineHeight: '1.4' }],
        base: ['1.0625rem', { lineHeight: '1.6' }],
        lg: ['1.125rem', { lineHeight: '1.55' }],
      },
    },
  },
  plugins: [],
};
