import { fireEvent, screen, waitFor } from "@testing-library/react";

import clienteApi from "../api/clienteApi.js";
import FormularioMembro from "../paginas/FormularioMembro.jsx";
import { renderizarComRotas } from "./utilitarios.jsx";

jest.mock("../api/clienteApi.js", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn() },
}));

const guildas = [{ id: "325c", nome: "Legião dos Dragões" }];

// Configura as respostas da API: a lista de guildas e, opcionalmente, um membro.
function configurarApi(membro) {
  clienteApi.get.mockImplementation((url) => {
    if (url === "/guildas") return Promise.resolve({ data: guildas });
    if (url.startsWith("/membros/")) {
      return membro
        ? Promise.resolve({ data: membro })
        : Promise.reject({ response: { status: 404 } });
    }
    return Promise.reject(new Error(`URL inesperada: ${url}`));
  });
}

// Rotas usadas nos testes. A rota "/membros" mostra um texto para provar que houve navegação.
const rotas = [
  { caminho: "/membros/novo", elemento: <FormularioMembro /> },
  { caminho: "/membros/:membroId", elemento: <FormularioMembro /> },
  { caminho: "/membros", elemento: <p>Lista de membros</p> },
];

describe("FormularioMembro", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("cria um membro, envia os dados corretos e volta para a lista", async () => {
    configurarApi(null);
    clienteApi.post.mockResolvedValue({ data: { id: "9999", nome: "Bruno", guildaId: "325c" } });

    renderizarComRotas("/membros/novo", rotas);

    // Espera a lista de guildas chegar antes de escolher uma opção.
    await screen.findByRole("option", { name: "Legião dos Dragões" });

    fireEvent.change(screen.getByLabelText("Nome do membro"), { target: { value: "Bruno" } });
    fireEvent.change(screen.getByLabelText("Guilda"), { target: { value: "325c" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));

    await waitFor(() =>
      expect(clienteApi.post).toHaveBeenCalledWith("/membros", { nome: "Bruno", guildaId: "325c" })
    );
    expect(await screen.findByText("Lista de membros")).toBeInTheDocument();
  });

  it("carrega o membro pela URL e envia a edição com PATCH", async () => {
    configurarApi({ id: "0ad5", nome: "Selene Nightingale", guildaId: "325c" });
    clienteApi.patch.mockResolvedValue({ data: {} });

    renderizarComRotas("/membros/0ad5", rotas);

    const campoNome = await screen.findByLabelText("Nome do membro");
    expect(campoNome).toHaveValue("Selene Nightingale");
    expect(clienteApi.get).toHaveBeenCalledWith("/membros/0ad5", expect.anything());

    fireEvent.change(campoNome, { target: { value: "Selene N. Ferreira" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));

    await waitFor(() =>
      expect(clienteApi.patch).toHaveBeenCalledWith("/membros/0ad5", {
        nome: "Selene N. Ferreira",
        guildaId: "325c",
      })
    );
  });

  it("mostra mensagem quando o id da URL não existe na API", async () => {
    configurarApi(null);

    renderizarComRotas("/membros/naoexiste", rotas);

    expect(await screen.findByRole("alert")).toHaveTextContent("Membro não encontrado");
    expect(clienteApi.patch).not.toHaveBeenCalled();
  });

  it("não envia o formulário sem o nome do membro", async () => {
    configurarApi(null);

    renderizarComRotas("/membros/novo", rotas);

    await screen.findByRole("option", { name: "Legião dos Dragões" });
    fireEvent.change(screen.getByLabelText("Guilda"), { target: { value: "325c" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Informe o nome do membro");
    expect(clienteApi.post).not.toHaveBeenCalled();
  });
});
