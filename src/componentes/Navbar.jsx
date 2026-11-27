import { NavLink } from "react-router-dom";

// NavLink recebe "isActive" e aplica estilo ao link da página atual.
const estiloLink = ({ isActive }) =>
  `text-sm text-carvao hover:text-brasa lg:text-base ${isActive ? "font-bold underline" : ""}`;

export default function Navbar() {
  return (
    <nav className="flex h-[65px] w-full items-center gap-5 bg-areia px-5">
      <h1 className="font-titulo text-lg text-brasa lg:text-xl">⚔️ Guilda RPG</h1>
      <ul className="flex gap-5">
        <li>
          <NavLink to="/" end className={estiloLink}>Início</NavLink>
        </li>
        <li>
          <NavLink to="/guildas" className={estiloLink}>Guildas</NavLink>
        </li>
        <li>
          <NavLink to="/membros" className={estiloLink}>Membros</NavLink>
        </li>
      </ul>
    </nav>
  );
}
