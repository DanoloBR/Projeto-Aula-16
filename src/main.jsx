import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import { FLAGS_FUTURO } from "./configuracao.js";
import "./index.css";

// O BrowserRouter envolve a aplicação inteira: ele conecta as rotas
// ao endereço (URL) do navegador e ao histórico (voltar/avançar).
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter future={FLAGS_FUTURO}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
