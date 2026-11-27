import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import clienteApi from "../api/clienteApi.js";

export default function Membros() {
  const [membros, setMembros] = useState([]);
  const [guildas, setGuildas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function carregarDados() {
      try {
        // Duas requisições em paralelo: os membros e as guildas (para mostrar o nome da guilda).
        const [respostaMembros, respostaGuildas] = await Promise.all([
          clienteApi.get("/membros", { signal: controller.signal }),
          clienteApi.get("/guildas", { signal: controller.signal }),
        ]);
        setMembros(respostaMembros.data);
        setGuildas(respostaGuildas.data);
      } catch {
        if (!controller.signal.aborted) setErro("Não foi possível carregar os membros.");
      } finally {
        if (!controller.signal.aborted) setCarregando(false);
      }
    }

    carregarDados();
    return () => controller.abort();
  }, []);

  const nomeDaGuilda = (guildaId) =>
    guildas.find((guilda) => guilda.id === guildaId)?.nome ?? "Sem guilda";

  async function excluirMembro(membro) {
    if (!window.confirm(`Excluir ${membro.nome}?`)) return;

    try {
      await clienteApi.delete(`/membros/${membro.id}`);
      setMembros((atuais) => atuais.filter((item) => item.id !== membro.id));
    } catch {
      setErro("Não foi possível excluir o membro.");
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <h2 className="titulo-pagina">Membros</h2>
        <Link to="/membros/novo" className="botao">+ Novo membro</Link>
      </header>

      {carregando && <p>Carregando membros...</p>}
      {erro && <p role="alert" className="text-red-700">{erro}</p>}
      {!carregando && !erro && membros.length === 0 && (
        <p>Nenhum aventureiro cadastrado ainda.</p>
      )}

      <ul className="flex flex-col gap-2">
        {membros.map((membro) => (
          <li key={membro.id} className="flex items-center gap-4 rounded bg-white p-3">
            <span className="flex-1 text-lg">
              🧙 {membro.nome}
              <span className="ml-2 text-sm text-ferro">— {nomeDaGuilda(membro.guildaId)}</span>
            </span>
            <Link to={`/membros/${membro.id}`} className="botao-secundario">Editar</Link>
            <button type="button" onClick={() => excluirMembro(membro)} className="botao-perigo">
              Excluir
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
