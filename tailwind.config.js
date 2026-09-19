/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "#17171A",
        accent: "#4F46E5",
        "accent-soft": "#EEF0FF",
        "accent-dark": "#3730A3",
        paper: "#FFFFFF",
        border: "#E7E7EA",
      },
    },
  },
  plugins: [],
};
