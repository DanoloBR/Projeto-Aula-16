import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import clienteApi from "../api/clienteApi.js";

export default function FormularioGuilda() {
  // Rota /guildas/nova        -> useParams() devolve {}              -> modo criação
  // Rota /guildas/:guildaId   -> useParams() devolve { guildaId }    -> modo edição
  const { guildaId } = useParams();
  const navigate = useNavigate();
  const editando = Boolean(guildaId);

  const [nome, setNome] = useState("");
  const [carregando, setCarregando] = useState(editando);
  const [naoEncontrada, setNaoEncontrada] = useState(false);
  const [erro, setErro] = useState(null);

  // Rota dinâmica: quando o id muda na URL, a guilda é buscada de novo.
  useEffect(() => {
    if (!guildaId) return; // modo criação: não há nada para buscar

    const controller = new AbortController();

    async function carregarGuilda() {
      setCarregando(true);
      setNaoEncontrada(false);
      setErro(null);

      try {
        const resposta = await clienteApi.get(`/guildas/${guildaId}`, {
          signal: controller.signal,
        });
        setNome(resposta.data.nome);
      } catch (e) {
        if (controller.signal.aborted) return;
        if (e.response?.status === 404) setNaoEncontrada(true);
        else setErro("Falha ao carregar a guilda.");
      } finally {
        if (!controller.signal.aborted) setCarregando(false);
      }
    }

    carregarGuilda();
    return () => controller.abort();
  }, [guildaId]);

  async function salvar(evento) {
    evento.preventDefault();
    setErro(null);

    const nomeLimpo = nome.trim();
    if (!nomeLimpo) {
      setErro("Dê um nome para a guilda.");
      return;
    }

    try {
      if (editando) {
        await clienteApi.patch(`/guildas/${guildaId}`, { nome: nomeLimpo });
      } else {
        await clienteApi.post("/guildas", { nome: nomeLimpo });
      }
      navigate("/guildas"); // navegação programática: volta para a lista após salvar
    } catch {
      setErro("Não foi possível salvar. Tente novamente.");
    }
  }

  if (carregando) return <p>Carregando guilda...</p>;

  if (naoEncontrada) {
    return (
      <section className="flex flex-col gap-3">
        <p role="alert">Guilda não encontrada. Ela pode ter sido removida.</p>
        <Link to="/guildas" className="text-brasa underline">Voltar para as guildas</Link>
      </section>
    );
  }

  return (
    <form onSubmit={salvar} className="flex max-w-md flex-col gap-4">
      <h2 className="titulo-pagina">{editando ? "Editar guilda" : "Nova guilda"}</h2>

      <div className="flex flex-col gap-1">
        <label htmlFor="nome-guilda">Nome da guilda</label>
        <input
          id="nome-guilda"
          type="text"
          className="campo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
      </div>

      {erro && <p role="alert" className="text-red-700">{erro}</p>}

      <div className="flex gap-3">
        <button type="submit" className="botao">Confirmar</button>
        <Link to="/guildas" className="botao-secundario">Cancelar</Link>
      </div>
    </form>
  );
}
