import { Link } from "react-router-dom";

// Rota coringa ("*"): aparece quando nenhuma outra rota combina com o endereço.
export default function NaoEncontrado() {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="titulo-pagina">Erro 404</h2>
      <p>Esta masmorra não existe. Confira o endereço digitado.</p>
      <Link to="/" className="text-brasa underline">Voltar ao início</Link>
    </section>
  );
}
