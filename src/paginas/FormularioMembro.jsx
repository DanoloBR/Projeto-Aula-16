import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import clienteApi from "../api/clienteApi.js";

export default function FormularioMembro() {
  // Rota /membros/novo          -> useParams() devolve {}             -> modo criação
  // Rota /membros/:membroId     -> useParams() devolve { membroId }   -> modo edição
  const { membroId } = useParams();
  const navigate = useNavigate();
  const editando = Boolean(membroId);

  // Um único objeto guarda os dois campos do formulário.
  const [dados, setDados] = useState({ nome: "", guildaId: "" });
  const [guildas, setGuildas] = useState([]);
  const [carregando, setCarregando] = useState(editando);
  const [naoEncontrado, setNaoEncontrado] = useState(false);
  const [erro, setErro] = useState(null);

  // Efeito 1: lista de guildas para preencher o <select>.
  useEffect(() => {
    const controller = new AbortController();

    async function carregarGuildas() {
      try {
        const resposta = await clienteApi.get("/guildas", { signal: controller.signal });
        setGuildas(resposta.data);
      } catch {
        if (!controller.signal.aborted) setErro("Não foi possível carregar as guildas.");
      }
    }

    carregarGuildas();
    return () => controller.abort();
  }, []);

  // Efeito 2: rota dinâmica. Busca o membro pelo id que veio na URL.
  useEffect(() => {
    if (!membroId) return;

    const controller = new AbortController();

    async function carregarMembro() {
      setCarregando(true);
      setNaoEncontrado(false);
      setErro(null);

      try {
        const resposta = await clienteApi.get(`/membros/${membroId}`, {
          signal: controller.signal,
        });
        setDados({ nome: resposta.data.nome, guildaId: resposta.data.guildaId });
      } catch (e) {
        if (controller.signal.aborted) return;
        if (e.response?.status === 404) setNaoEncontrado(true);
        else setErro("Falha ao carregar o membro.");
      } finally {
        if (!controller.signal.aborted) setCarregando(false);
      }
    }

    carregarMembro();
    return () => controller.abort();
  }, [membroId]);

  async function salvar(evento) {
    evento.preventDefault();
    setErro(null);

    const nome = dados.nome.trim();
    if (!nome) {
      setErro("Informe o nome do membro.");
      return;
    }
    if (!dados.guildaId) {
      setErro("Escolha uma guilda para o membro.");
      return;
    }

    const corpo = { nome, guildaId: dados.guildaId };

    try {
      if (editando) {
        await clienteApi.patch(`/membros/${membroId}`, corpo);
      } else {
        await clienteApi.post("/membros", corpo);
      }
      navigate("/membros"); // volta para a lista após salvar
    } catch {
      setErro("Não foi possível salvar o membro. Tente novamente.");
    }
  }

  if (carregando) return <p>Carregando membro...</p>;

  if (naoEncontrado) {
    return (
      <section className="flex flex-col gap-3">
        <p role="alert">Membro não encontrado. Ele pode ter sido removido.</p>
        <Link to="/membros" className="text-brasa underline">Voltar para os membros</Link>
      </section>
    );
  }

  return (
    <form onSubmit={salvar} className="flex max-w-md flex-col gap-4">
      <h2 className="titulo-pagina">{editando ? "Editar membro" : "Novo membro"}</h2>

      <div className="flex flex-col gap-1">
        <label htmlFor="nome-membro">Nome do membro</label>
        <input
          id="nome-membro"
          type="text"
          className="campo"
          value={dados.nome}
          onChange={(e) => setDados((atual) => ({ ...atual, nome: e.target.value }))}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="guilda">Guilda</label>
        <select
          id="guilda"
          className="campo"
          value={dados.guildaId}
          onChange={(e) => setDados((atual) => ({ ...atual, guildaId: e.target.value }))}
        >
          <option value="">Selecione uma guilda</option>
          {guildas.map((guilda) => (
            <option key={guilda.id} value={guilda.id}>
              {guilda.nome}
            </option>
          ))}
        </select>
      </div>

      {erro && <p role="alert" className="text-red-700">{erro}</p>}

      <div className="flex gap-3">
        <button type="submit" className="botao">Confirmar</button>
        <Link to="/membros" className="botao-secundario">Cancelar</Link>
      </div>
    </form>
  );
}
