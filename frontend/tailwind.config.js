/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"] ,
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          700: "#1d4ed8"
        }
      },
      borderRadius: {
        xl: "16px"
      }
    }
  },
  darkMode: "class",
  plugins: []
};
