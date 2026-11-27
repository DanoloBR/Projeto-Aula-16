import { Route, Routes } from "react-router-dom";

import Navbar from "./componentes/Navbar.jsx";
import Inicio from "./paginas/Inicio.jsx";
import Guildas from "./paginas/Guildas.jsx";
import FormularioGuilda from "./paginas/FormularioGuilda.jsx";
import Membros from "./paginas/Membros.jsx";
import FormularioMembro from "./paginas/FormularioMembro.jsx";
import NaoEncontrado from "./paginas/NaoEncontrado.jsx";

// Ordem não importa aqui: o React Router dá prioridade às rotas mais específicas.
// Por isso "/guildas/nova" (estática) vence "/guildas/:guildaId" (dinâmica).
export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="p-5">
        <Routes>
          <Route path="/" element={<Inicio />} />

          <Route path="/guildas" element={<Guildas />} />
          <Route path="/guildas/nova" element={<FormularioGuilda />} />
          <Route path="/guildas/:guildaId" element={<FormularioGuilda />} />

          <Route path="/membros" element={<Membros />} />
          <Route path="/membros/novo" element={<FormularioMembro />} />
          <Route path="/membros/:membroId" element={<FormularioMembro />} />

          {/* Qualquer endereço que não bateu com as rotas acima */}
          <Route path="*" element={<NaoEncontrado />} />
        </Routes>
      </main>
    </div>
  );
}
