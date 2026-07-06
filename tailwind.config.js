/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1B2430",
        turf: "#2F5233",
        turfLight: "#3E6B44",
        paper: "#EDE6D6",
        paperDim: "#DED4BC",
        gold: "#C08A3E",
        rust: "#8C2F2F",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  plugins: [],
};
