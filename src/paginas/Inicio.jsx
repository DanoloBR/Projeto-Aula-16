import { Link } from "react-router-dom";

export default function Inicio() {
  return (
    <section className="flex max-w-2xl flex-col gap-4">
      <h2 className="titulo-pagina">Bem-vindo à Guilda RPG! 🐉</h2>
      <p>
        Aqui você funda guildas, recruta aventureiros e mantém tudo organizado.
        Por onde começamos?
      </p>
      <div className="flex gap-4">
        <Link to="/guildas" className="botao">🏰 Guildas</Link>
        <Link to="/membros" className="botao-secundario">🧙 Membros</Link>
      </div>
    </section>
  );
}
