/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontSize: {
        "16px": "16px",
        "20px": "20px",
        "26px": "26px",
        "36px": "36px",
      },
    },
  },
  plugins: [],
};
