import { screen, waitFor } from "@testing-library/react";

import clienteApi from "../api/clienteApi.js";
import { renderizarApp } from "./utilitarios.jsx";

// Substitui o cliente HTTP real por funções falsas: o teste não depende da API rodando.
jest.mock("../api/clienteApi.js", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn() },
}));

describe("Rotas da aplicação", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clienteApi.get.mockImplementation((url) => {
      if (url === "/guildas") return Promise.resolve({ data: [] });
      if (url === "/membros/0ad5") {
        return Promise.resolve({ data: { id: "0ad5", nome: "Selene Nightingale", guildaId: "2511" } });
      }
      return Promise.reject({ response: { status: 404 } });
    });
  });

  it("mostra a página inicial na rota /", () => {
    renderizarApp("/");
    expect(screen.getByRole("heading", { name: /bem-vindo/i })).toBeInTheDocument();
  });

  it("mostra a página de erro 404 para endereços que não existem", () => {
    renderizarApp("/rota/inexistente");
    expect(screen.getByText(/erro 404/i)).toBeInTheDocument();
  });

  it("rota dinâmica /membros/:membroId usa o id da URL para buscar na API", async () => {
    renderizarApp("/membros/0ad5");

    await waitFor(() =>
      expect(clienteApi.get).toHaveBeenCalledWith("/membros/0ad5", expect.anything())
    );
    expect(await screen.findByDisplayValue("Selene Nightingale")).toBeInTheDocument();
  });

  it("/guildas/nova é rota estática: não tenta buscar 'nova' na API", async () => {
    renderizarApp("/guildas/nova");

    expect(await screen.findByRole("heading", { name: "Nova guilda" })).toBeInTheDocument();
    expect(clienteApi.get).not.toHaveBeenCalledWith("/guildas/nova", expect.anything());
  });
});
