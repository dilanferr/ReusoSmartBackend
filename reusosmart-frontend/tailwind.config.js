/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ecoGreen: "#34a853", // Verde reciclaje
        ecoLight: "#e8f5e9", // Fondo ecológico claro
        ecoDark: "#1b5e20",  // Verde profundo
        ecoBlue: "#0b7285",  // Azul sustentable
        ecoGray: "#f5f5f5",  // Gris limpio
      },
    },
  },
  plugins: [],
};
