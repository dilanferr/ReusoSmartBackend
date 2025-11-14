/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}", "./node_modules/@radix-ui/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ecoGreen: "#34a853", // Verde reciclaje
        ecoLight: "#e8f5e9", // Fondo ecológico claro
        ecoDark: "#1b5e20",  // Verde profundo
        ecoBlue: "#0b7285",  // Azul sustentable
        ecoGray: "#f5f5f5",  // Gris limpio
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.3s ease-out",
        "accordion-up": "accordion-up 0.3s ease-out",
    },
    },
  },
  plugins: [],
};
