import axios from "axios";

// Cliente HTTP central: todas as requisições do sistema passam por aqui.
// A URL base vem do arquivo .env (VITE_API_URL). Trocar de API não exige mudar o código.
const clienteApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000",
});

export default clienteApi;
