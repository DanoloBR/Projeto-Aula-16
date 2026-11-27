/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      // Paleta da aventura: altere os valores aqui para mudar as cores do sistema inteiro.
      colors: {
        pergaminho: "#ECEAE0",
        areia: "#E9E0D5",
        brasa: "#EA580C",
        carvao: "#2B2620",
        ferro: "#8A7F72",
      },
      // Tipografia: "titulo" é usada nos cabeçalhos, "corpo" no restante do texto.
      fontFamily: {
        titulo: ["Georgia", "serif"],
        corpo: ["system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
