/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary" : "#141414",
        "blue" : "#3575E2",
        "green" : "#3cb043",
        "gold" : "#fdd700",
        "orange" : "#E56020"
      }
    },
  },
  plugins: [],
}

