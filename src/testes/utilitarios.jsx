import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import App from "../App.jsx";
import { FLAGS_FUTURO } from "../configuracao.js";

// MemoryRouter simula a barra de endereço sem precisar de um navegador.
// Ideal para testar rotas: basta escolher a URL inicial.
export function renderizarApp(caminho) {
  return render(
    <MemoryRouter initialEntries={[caminho]} future={FLAGS_FUTURO}>
      <App />
    </MemoryRouter>
  );
}

// Renderiza apenas as rotas indicadas. Útil para testar o que acontece
// depois de uma navegação (ex.: navigate("/membros") após salvar).
export function renderizarComRotas(caminho, rotas) {
  return render(
    <MemoryRouter initialEntries={[caminho]} future={FLAGS_FUTURO}>
      <Routes>
        {rotas.map(({ caminho: rota, elemento }) => (
          <Route key={rota} path={rota} element={elemento} />
        ))}
      </Routes>
    </MemoryRouter>
  );
}
