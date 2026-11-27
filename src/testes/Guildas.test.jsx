import { fireEvent, screen, waitFor } from "@testing-library/react";

import clienteApi from "../api/clienteApi.js";
import Guildas from "../paginas/Guildas.jsx";
import { renderizarComRotas } from "./utilitarios.jsx";

jest.mock("../api/clienteApi.js", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn() },
}));

const rotas = [{ caminho: "/guildas", elemento: <Guildas /> }];

describe("Página de guildas", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.confirm = jest.fn(() => true); // simula o clique em "OK" no confirm
  });

  it("lista as guildas vindas da API", async () => {
    clienteApi.get.mockResolvedValue({ data: [{ id: "2511", nome: "Sentinelas" }] });

    renderizarComRotas("/guildas", rotas);

    expect(await screen.findByText(/Sentinelas/)).toBeInTheDocument();
  });

  it("mostra uma mensagem quando não há guildas", async () => {
    clienteApi.get.mockResolvedValue({ data: [] });

    renderizarComRotas("/guildas", rotas);

    expect(await screen.findByText(/Nenhuma guilda por aqui/)).toBeInTheDocument();
  });

  it("exclui uma guilda depois da confirmação e remove da tela", async () => {
    clienteApi.get.mockResolvedValue({ data: [{ id: "2511", nome: "Sentinelas" }] });
    clienteApi.delete.mockResolvedValue({});

    renderizarComRotas("/guildas", rotas);

    fireEvent.click(await screen.findByRole("button", { name: "Excluir" }));

    await waitFor(() => expect(clienteApi.delete).toHaveBeenCalledWith("/guildas/2511"));
    await waitFor(() => expect(screen.queryByText(/Sentinelas/)).not.toBeInTheDocument());
  });

  it("não exclui quando o usuário cancela a confirmação", async () => {
    window.confirm = jest.fn(() => false);
    clienteApi.get.mockResolvedValue({ data: [{ id: "2511", nome: "Sentinelas" }] });

    renderizarComRotas("/guildas", rotas);

    fireEvent.click(await screen.findByRole("button", { name: "Excluir" }));

    expect(clienteApi.delete).not.toHaveBeenCalled();
  });
});
