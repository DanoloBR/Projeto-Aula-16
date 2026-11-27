import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import clienteApi from "../api/clienteApi.js";

export default function Guildas() {
  const [guildas, setGuildas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    // AbortController cancela a requisição se o usuário sair da página antes da resposta.
    const controller = new AbortController();

    async function carregarGuildas() {
      try {
        const resposta = await clienteApi.get("/guildas", { signal: controller.signal });
        setGuildas(resposta.data);
      } catch {
        if (!controller.signal.aborted) setErro("Não foi possível carregar as guildas.");
      } finally {
        if (!controller.signal.aborted) setCarregando(false);
      }
    }

    carregarGuildas();
    return () => controller.abort();
  }, []); // [] = busca uma vez, ao abrir a página

  async function excluirGuilda(guilda) {
    if (!window.confirm(`Excluir a guilda "${guilda.nome}"?`)) return;

    try {
      await clienteApi.delete(`/guildas/${guilda.id}`);
      setGuildas((atuais) => atuais.filter((item) => item.id !== guilda.id));
    } catch {
      setErro("Não foi possível excluir a guilda.");
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <h2 className="titulo-pagina">Guildas</h2>
        <Link to="/guildas/nova" className="botao">+ Nova guilda</Link>
      </header>

      {carregando && <p>Carregando guildas...</p>}
      {erro && <p role="alert" className="text-red-700">{erro}</p>}
      {!carregando && !erro && guildas.length === 0 && (
        <p>Nenhuma guilda por aqui. Que tal fundar a primeira?</p>
      )}

      <ul className="flex flex-col gap-2">
        {guildas.map((guilda) => (
          <li key={guilda.id} className="flex items-center gap-4 rounded bg-white p-3">
            <span className="flex-1 text-lg">🏰 {guilda.nome}</span>
            {/* Rota dinâmica: o id da guilda vai dentro do endereço */}
            <Link to={`/guildas/${guilda.id}`} className="botao-secundario">Editar</Link>
            <button type="button" onClick={() => excluirGuilda(guilda)} className="botao-perigo">
              Excluir
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
