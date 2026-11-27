# Aula: Roteamento e rotas dinâmicas com React

**Projeto:** Guilda RPG (gerenciamento de guildas e aventureiros)

## Objetivos

Ao final desta aula, você deve saber:

- Configurar o React Router em uma aplicação React com Vite
- Criar rotas estáticas, rotas dinâmicas (com parâmetro na URL) e uma rota coringa para 404
- Ler o parâmetro da rota com `useParams` e buscar os dados na API a partir dele
- Navegar por código com `useNavigate`
- Testar rotas com Jest e com um teste ponta a ponta que simula um uso real
- Trazer mudanças visuais e de comportamento para o sistema

## Pré-requisitos

Conhecimento básico de componentes, props, `useState` e `useEffect`. Node.js 18 ou superior.

---

## 1. Conceitos fundamentais

Em uma **SPA (Single Page Application)**, o navegador carrega uma única página HTML. Quando a URL muda, o JavaScript do React troca os componentes na tela, sem recarregar a página. Esse processo é o **roteamento client-side**.

As peças principais do React Router são:

| Peça | Para que serve |
|---|---|
| `BrowserRouter` | Liga as rotas à barra de endereço e ao histórico do navegador |
| `Routes` e `Route` | Associam um caminho (`path`) a um componente (`element`) |
| `Link` e `NavLink` | Criam links que trocam de página sem recarregar. O `NavLink` ainda marca o link da página atual |
| `useParams` | Lê os parâmetros dinâmicos da URL, como o `:guildaId` |
| `useNavigate` | Navega por código, por exemplo depois de salvar um formulário |

## 2. Estrutura do projeto

```
src/
├── main.jsx              # BrowserRouter envolve a aplicação
├── App.jsx               # Declaração das rotas
├── configuracao.js       # Flags de configuração do React Router
├── index.css             # Estilos base e classes reutilizáveis
├── api/clienteApi.js     # Cliente HTTP (axios)
├── componentes/Navbar.jsx
├── paginas/
│   ├── Inicio.jsx
│   ├── Guildas.jsx             # Lista de guildas
│   ├── FormularioGuilda.jsx    # Nova guilda e edição (rota dinâmica)
│   ├── Membros.jsx             # Lista de membros
│   ├── FormularioMembro.jsx    # Novo membro e edição (rota dinâmica)
│   └── NaoEncontrado.jsx       # Página 404
└── testes/                     # Testes com Jest
e2e/caso-real.spec.js           # Teste ponta a ponta com Playwright
db.json                         # Dados da API falsa
```

## 3. Instalação e execução

```bash
npm install
```

Abra dois terminais:

```bash
# Terminal 1: a API (porta 8000)
npm run api

# Terminal 2: a aplicação (porta 5173)
npm run dev
```

Acesse `http://localhost:5173`. Sem o terminal 1 rodando, as listas exibem a mensagem de erro em vez dos dados.

## 4. Envolvendo a aplicação com o Router

O `BrowserRouter` precisa envolver toda a aplicação. Ele fica em `src/main.jsx`:

```jsx
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter future={FLAGS_FUTURO}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

A prop `future` ativa comportamentos da próxima versão do React Router. Ativar agora evita avisos no console e facilita uma atualização futura.

## 5. Definindo as rotas

Em `src/App.jsx`, declaramos todas as rotas do sistema:

```jsx
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
```

Três pontos importantes:

- `/guildas/:guildaId` é uma **rota dinâmica**. O `:guildaId` aceita qualquer valor: `/guildas/2511`, `/guildas/7a3e` ou `/guildas/abc`.
- `/guildas/nova` é uma **rota estática**. Quando o endereço é `/guildas/nova`, ela vence a rota dinâmica `/guildas/:guildaId`. O React Router dá prioridade à rota mais específica, independentemente da ordem em que as rotas foram declaradas.
- `path="*"` é a **rota coringa**, usada para a página de erro 404.

## 6. Rota estática com lista e links para a rota dinâmica

A página `Guildas` mostra a lista e cria um link para a rota de edição de cada guilda:

```jsx
<Link to="/guildas/nova" className="botao">+ Nova guilda</Link>

<ul>
  {guildas.map((guilda) => (
    <li key={guilda.id}>
      <span>🏰 {guilda.nome}</span>
      <Link to={`/guildas/${guilda.id}`}>Editar</Link>
    </li>
  ))}
</ul>
```

O `id` vai dentro do endereço. Ao clicar em "Editar" na guilda `2511`, a URL muda para `/guildas/2511`, e a rota dinâmica é ativada.

## 7. Rota dinâmica: lendo o parâmetro e buscando na API

Esse é o núcleo da aula. A página `FormularioGuilda` serve para criar e para editar. A diferença está no parâmetro da URL:

```jsx
export default function FormularioGuilda() {
  // /guildas/nova      -> useParams() devolve {}             -> modo criação
  // /guildas/:guildaId -> useParams() devolve { guildaId }   -> modo edição
  const { guildaId } = useParams();
  const editando = Boolean(guildaId);

  const [nome, setNome] = useState("");
  const [carregando, setCarregando] = useState(editando);
  const [naoEncontrada, setNaoEncontrada] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (!guildaId) return; // modo criação: não há nada para buscar

    const controller = new AbortController();

    async function carregarGuilda() {
      setCarregando(true);
      setNaoEncontrada(false);

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
  }, [guildaId]); // refaz a busca quando o id muda

  // ... formulário e tratamento de loading e 404
}
```

### Por que `[guildaId]` é a dependência do `useEffect`?

Ao navegar de `/guildas/2511` para `/guildas/7a3e`, o React Router **reaproveita o mesmo componente**. Ele não é desmontado e montado de novo: só recebe um `guildaId` diferente. Sem o `guildaId` na lista de dependências, o efeito não rodaria de novo, e a tela continuaria mostrando a primeira guilda.

Para ver o problema na prática, troque a dependência por `[]`, rode a aplicação e alterne entre duas guildas usando a barra de endereço.

### Por que o `AbortController`?

Se o usuário sai da página antes da resposta chegar, a requisição continua em andamento. Sem cancelamento, a resposta antiga pode sobrescrever o estado de uma página que já não está mais na tela. O `return () => controller.abort()` cancela a requisição quando o componente sai da tela ou quando o `guildaId` muda.

### Três estados em toda chamada à API

Toda busca deve prever três situações: **carregando**, **erro** e **sucesso**. O código acima trata o 404 de forma específica, porque um id inexistente é diferente de uma falha de rede:

```jsx
if (carregando) return <p>Carregando guilda...</p>;

if (naoEncontrada) {
  return (
    <section>
      <p role="alert">Guilda não encontrada. Ela pode ter sido removida.</p>
      <Link to="/guildas">Voltar para as guildas</Link>
    </section>
  );
}
```

## 8. Navegação programática com `useNavigate`

Depois de salvar, o sistema volta para a lista. Isso não é um clique em link, é uma ação do código:

```jsx
const navigate = useNavigate();

async function salvar(evento) {
  evento.preventDefault();

  try {
    if (editando) {
      await clienteApi.patch(`/guildas/${guildaId}`, { nome: nome.trim() });
    } else {
      await clienteApi.post("/guildas", { nome: nome.trim() });
    }
    navigate("/guildas");
  } catch {
    setErro("Não foi possível salvar. Tente novamente.");
  }
}
```

**Atenção:** use sempre caminhos completos, como `` `/guildas/${id}` ``. Um número passado para `navigate(3)` não navega para uma rota: ele volta ou avança no histórico do navegador.

## 9. Rota dinâmica com mais de uma busca: o formulário de membros

`FormularioMembro` combina duas buscas: a lista de guildas (para o `<select>`) e o membro da URL (para edição). Cada uma tem seu próprio `useEffect`:

```jsx
// Efeito 1: lista de guildas, sempre que a página abre
useEffect(() => {
  const controller = new AbortController();
  // ... carrega /guildas
  return () => controller.abort();
}, []);

// Efeito 2: membro da URL, refeito quando o membroId muda
useEffect(() => {
  if (!membroId) return;
  const controller = new AbortController();
  // ... carrega /membros/:membroId e preenche o formulário
  return () => controller.abort();
}, [membroId]);
```

O formulário é **controlado**: o valor de cada campo vem do estado, e cada digitação atualiza esse estado. Isso permite validar os dados antes de enviar.

## 10. Pontos de atenção

- **O parâmetro é sempre texto.** `useParams` devolve string, mesmo quando o id parece número. Use `Number(id)` se precisar fazer contas.
- **Dependências do `useEffect`.** Todo parâmetro que muda a busca precisa estar no array de dependências.
- **Cancelamento.** Use `AbortController` em toda busca dentro de `useEffect`.
- **StrictMode.** Em desenvolvimento, o React executa o efeito duas vezes para detectar efeitos mal feitos. Por isso a primeira requisição é enviada e cancelada logo em seguida pelo cleanup. Sem o `AbortController`, a primeira resposta poderia chegar depois da segunda e deixar a tela com dados antigos.
- **Erros de rota e de API são diferentes.** Um 404 da API (id inexistente) tem mensagem própria. Uma falha de rede tem outra.
- **A API grava no arquivo.** O `json-server` altera o `db.json` a cada `POST`, `PATCH` ou `DELETE`. Por isso os testes ponta a ponta usam um banco separado.
- **Deploy de SPAs.** Ao publicar, o servidor precisa devolver o `index.html` para qualquer endereço. Sem isso, acessar `/membros/0ad5` diretamente resulta em 404 do servidor. Netlify e Vercel têm configurações simples para isso.

---

## 11. Testes automatizados (Jest)

Os testes unitários e de rotas ficam em `src/testes/`. Eles não precisam da API nem do navegador: o cliente HTTP é substituído por funções falsas.

```bash
npm test
```

Resultado esperado: **3 suítes e 12 testes passando**.

| Arquivo | O que verifica |
|---|---|
| `rotas.test.jsx` | Rota inicial, rota 404, rota dinâmica que busca o id certo, rota estática `/guildas/nova` que não busca "nova" na API |
| `Guildas.test.jsx` | Listagem, lista vazia, exclusão com confirmação e cancelamento |
| `FormularioMembro.test.jsx` | Criação com envio correto e redirecionamento, edição carregada pela URL, id inexistente, validação de campos vazios |

Exemplo de teste de rota dinâmica:

```jsx
it("rota dinâmica /membros/:membroId usa o id da URL para buscar na API", async () => {
  renderizarApp("/membros/0ad5");

  await waitFor(() =>
    expect(clienteApi.get).toHaveBeenCalledWith("/membros/0ad5", expect.anything())
  );
  expect(await screen.findByDisplayValue("Selene Nightingale")).toBeInTheDocument();
});
```

O `MemoryRouter` simula a barra de endereço. Basta escolher a URL inicial: `renderizarApp("/membros/0ad5")`.

## 12. Teste ponta a ponta: o caso real

O arquivo `e2e/caso-real.spec.js` executa um navegador de verdade e segue uma história completa:

> A mestre Ana funda a guilda **"Legião dos Dragões"**, recruta o aventureiro **"Bruno Ferreira"**, corrige o nome dele, abre a ficha digitando o endereço direto, testa dois erros de rota e, por fim, remove os dados que criou.

Para rodar:

```bash
npm run e2e
```

O script copia o `db.json` para `db.teste.json`, sobe uma API de teste (porta 8001) e a aplicação (porta 5174), e executa o teste no navegador. Ao final, os dados criados são apagados, e o `db.json` real nunca é alterado.

Ao terminar, as capturas de tela ficam em `test-results/evidencias/`. Abra as imagens para conferir cada tela do fluxo.

Trecho que valida a rota dinâmica com acesso direto:

```js
// Abrir a ficha pelo endereço direto, sem passar pela lista.
// Prova que a rota dinâmica busca o dado na primeira carga da página.
await page.goto(enderecoDaFicha);
await expect(page.getByLabel("Nome do membro")).toHaveValue(MEMBRO_CORRIGIDO);
```

## 13. Roteiro de teste manual

Use este roteiro sempre que mudar algo no sistema, antes de confiar apenas nos testes automáticos.

**Preparação:** `npm run api` e `npm run dev` rodando.

1. **Navegação:** clique em Início, Guildas e Membros. O link da página atual deve ficar em negrito e sublinhado.
2. **Rota dinâmica:** em Guildas, clique em "Editar" na Sentinelas. A URL deve ser `/guildas/2511` e o nome deve aparecer no campo.
3. **Acesso direto:** digite `http://localhost:5173/guildas/7a3e` na barra de endereço. A guilda "Guardiões do Crepúsculo" deve aparecer.
4. **Id inexistente:** digite `/guildas/nao-existe`. A mensagem "Guilda não encontrada" deve aparecer.
5. **Rota inexistente:** digite `/qualquer-coisa`. A página "Erro 404" deve aparecer.
6. **Criar:** em Membros, clique em "+ Novo membro", preencha nome e guilda, confirme. O novo membro deve aparecer na lista.
7. **Validação:** em "Novo membro", confirme sem nome. A mensagem "Informe o nome do membro" deve aparecer e nada deve ser salvo.
8. **Voltar:** depois de salvar um membro novo, use o botão voltar do navegador. O formulário de novo membro deve reaparecer, com a URL `/membros/novo`.
9. **Excluir:** remova o membro criado. Ele deve sumir da lista.

Para testar a API diretamente, sem a interface:

```bash
curl http://localhost:8000/guildas
curl http://localhost:8000/membros/0ad5
curl -i http://localhost:8000/guildas/nao-existe     # deve responder 404
```

## 14. Personalizando o sistema

### 14.1 Onde mexer

| O que você quer mudar | Onde fica |
|---|---|
| Cores da marca | `tailwind.config.js` (seção `colors`) |
| Fontes | `tailwind.config.js` (seção `fontFamily`) e `index.html` |
| Estilo de botões, campos e títulos | `src/index.css` (classes `.botao`, `.campo`, `.titulo-pagina`) |
| Textos e mensagens | Os próprios arquivos em `src/paginas/` |
| Ícones e emojis | Os próprios arquivos em `src/paginas/` e `src/componentes/` |
| Novas páginas | Criar o arquivo em `src/paginas/`, declarar a rota em `App.jsx` e, se for o caso, o link em `Navbar.jsx` |
| Novos campos nos dados | `db.json`, o formulário e a lista correspondentes |
| Endereço da API | `.env` (`VITE_API_URL`) |

Um princípio importante: **mude o estilo nas classes do `index.css` e nas cores do Tailwind, não em cada componente.** Assim, uma única alteração atinge o sistema inteiro.

### 14.2 Trocando a paleta e a fonte

Em `tailwind.config.js`, altere os valores das cores. A classe `text-brasa` usada nos títulos e botões passa a usar a nova cor:

```js
colors: {
  pergaminho: "#ECEAE0",
  areia: "#E9E0D5",
  brasa: "#7C3AED",   // roxo arcano, no lugar do laranja
  carvao: "#2B2620",
  ferro: "#8A7F72",
},
fontFamily: {
  titulo: ["MedievalSharp", "Georgia", "serif"],
  corpo: ["system-ui", "sans-serif"],
},
```

Para usar uma fonte do Google Fonts, inclua o link no `index.html`, dentro do `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=MedievalSharp&display=swap" rel="stylesheet" />
```

O nome em `fontFamily` deve ser exatamente o nome da fonte no Google Fonts. Os títulos passam a usar a nova fonte, e o restante continua com a fonte do sistema.

### 14.3 Criando uma página nova: `/missoes`

Uma página nova exige três passos.

**Passo 1: criar o componente** em `src/paginas/Missoes.jsx`:

```jsx
export default function Missoes() {
  const missoes = [
    { id: 1, titulo: "Resgatar o ferreiro de Vilaverde", recompensa: 150 },
    { id: 2, titulo: "Limpar a cripta dos esqueletos", recompensa: 300 },
  ];

  return (
    <section className="flex flex-col gap-4">
      <h2 className="titulo-pagina">Missões disponíveis</h2>
      <ul className="flex flex-col gap-2">
        {missoes.map((missao) => (
          <li key={missao.id} className="rounded bg-white p-3">
            📜 {missao.titulo} <strong>· {missao.recompensa} moedas</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

**Passo 2: declarar a rota** em `App.jsx`:

```jsx
import Missoes from "./paginas/Missoes.jsx";

// dentro do <Routes>, antes da rota coringa:
<Route path="/missoes" element={<Missoes />} />
```

**Passo 3: adicionar o link** em `Navbar.jsx`:

```jsx
<li>
  <NavLink to="/missoes" className={estiloLink}>Missões</NavLink>
</li>
```

Sem o passo 2, o endereço `/missoes` cairia na página 404. Sem o passo 3, a página existiria, mas ninguém chegaria até ela pelo menu.

### 14.4 Adicionando um campo novo: a classe do aventureiro

Este exemplo mostra o caminho completo de uma mudança nos dados. Ele foi aplicado e testado no projeto de referência, e o resultado está no arquivo de gabarito.

**Passo 1: os dados** em `db.json`:

```json
{ "id": "0ad5", "nome": "Selene Nightingale", "guildaId": "2511", "classe": "Arqueiro" }
```

**Passo 2: o estado do formulário** em `FormularioMembro.jsx`. O objeto de dados ganha um novo campo:

```jsx
const [dados, setDados] = useState({ nome: "", guildaId: "", classe: "" });

// dentro da busca do membro:
setDados({
  nome: resposta.data.nome,
  guildaId: resposta.data.guildaId,
  classe: resposta.data.classe ?? "",   // "??" evita undefined em membros antigos
});
```

**Passo 3: a lista de opções** no topo do arquivo, fora do componente:

```jsx
// Para acrescentar uma classe, basta incluir um item aqui.
const CLASSES = ["Guerreiro", "Mago", "Arqueiro", "Clérigo"];
```

**Passo 4: o campo no formulário**, antes dos botões:

```jsx
<div className="flex flex-col gap-1">
  <label htmlFor="classe">Classe</label>
  <select
    id="classe"
    className="campo"
    value={dados.classe}
    onChange={(e) => setDados((atual) => ({ ...atual, classe: e.target.value }))}
  >
    <option value="">Escolha uma classe</option>
    {CLASSES.map((classe) => (
      <option key={classe} value={classe}>{classe}</option>
    ))}
  </select>
</div>
```

**Passo 5: a validação e o envio.** Antes de enviar, confira o campo novo, e inclua-o no corpo da requisição:

```jsx
if (!dados.classe) {
  setErro("Escolha a classe do aventureiro.");
  return;
}

const corpo = { nome, guildaId: dados.guildaId, classe: dados.classe };
```

**Passo 6: a lista** em `Membros.jsx`, com um ícone por classe (personalidade sem alterar a lógica):

```jsx
const ICONES = { Guerreiro: "🛡️", Mago: "🔮", Arqueiro: "🏹", Clérigo: "✨" };

// dentro do <li>:
{ICONES[membro.classe] ?? "🧙"} {membro.nome}
```

**Passo 7: os testes acompanham a mudança.** Rode `npm test`. O teste de criação e o de edição vão falhar. O formulário agora exige a classe, então a validação bloqueia o envio antes de chegar à API, e os testes não preenchem esse campo. Isso é esperado: os testes estavam verificando um contrato antigo. Atualize-os:

```jsx
// Teste de criação: preencher a classe antes de confirmar
fireEvent.change(screen.getByLabelText("Classe"), { target: { value: "Mago" } });
// ...
expect(clienteApi.post).toHaveBeenCalledWith("/membros", {
  nome: "Bruno", guildaId: "325c", classe: "Mago",
});

// Teste de edição: o membro carregado precisa ter classe, e o PATCH a inclui
configurarApi({ id: "0ad5", nome: "Selene Nightingale", guildaId: "325c", classe: "Arqueiro" });
// ...
expect(clienteApi.patch).toHaveBeenCalledWith("/membros/0ad5", {
  nome: "Selene N. Ferreira", guildaId: "325c", classe: "Arqueiro",
});
```

**Passo 8: o teste ponta a ponta também.** Rode `npm run e2e`. O fluxo do caso real vai falhar no momento de salvar, porque nenhuma classe foi escolhida. Inclua a escolha no fluxo:

```js
await page.getByLabel("Guilda").selectOption({ label: GUILDA });
await page.getByLabel("Classe").selectOption("Mago");
await page.getByRole("button", { name: "Confirmar" }).click();
```

Ao atualizar um teste, pergunte sempre: **a regra mudou, ou o teste estava errado?** Neste caso, a regra mudou.

### 14.5 Dicas de personalidade

- **Textos com a voz do jogo.** "Esta masmorra não existe" (página 404) é mais memorável do que "Página não encontrada". Mensagens de erro e de lista vazia são ótimos lugares para isso.
- **Ícones como identidade.** Um emoji por seção (🏰 guildas, 🧙 membros, 📜 missões) organiza a navegação sem custo visual alto.
- **Consistência.** Escolha um tom (épico, cômico, sombrio) e mantenha-o em todos os textos.
- **Cores com função.** Use uma cor de destaque para ações principais (`botao`) e outra para ações perigosas (`botao-perigo`). Assim o usuário nunca confunde excluir com salvar.

Depois de cada mudança, rode `npm run build`, `npm test` e `npm run e2e`. Se os três passarem, a mudança não quebrou o que já funcionava.

---

## Exercícios propostos

1. **Descrição da guilda.** Adicione o campo `descricao` às guildas, seguindo o mesmo caminho do campo `classe` (dados, formulário, validação, lista e testes).
2. **Filtro por guilda.** Na página de membros, use `useSearchParams` para filtrar pela URL: `/membros?guilda=2511` mostra apenas os membros dessa guilda. Ponto de partida: a aula anterior, sobre query strings.
3. **Ficha do membro.** Crie a rota `/membros/:membroId/ficha`, somente leitura, mostrando nome, guilda e classe. Use `useParams` e uma busca na API, como na página de edição.
4. **Teste novo.** Escreva um teste em Jest para a página `/missoes` verificando que as duas missões aparecem.
5. **Tema taverna.** Crie uma versão mais escura do sistema usando as cores de `tailwind.config.js` e uma classe `dark:` do Tailwind.

## Resumo

| Conceito | Ferramenta | Exemplo no projeto |
|---|---|---|
| Configurar o roteamento | `BrowserRouter` | `main.jsx` |
| Declarar rotas | `Routes` / `Route` | `App.jsx` |
| Rota dinâmica | `:parametro` no `path` | `/guildas/:guildaId` |
| Rota estática com prioridade | caminho fixo | `/guildas/nova` |
| Rota coringa | `path="*"` | página 404 |
| Ler o parâmetro | `useParams` | `const { guildaId } = useParams()` |
| Buscar pelo parâmetro | `useEffect` com `[guildaId]` | `GET /guildas/:guildaId` |
| Navegar por link | `Link` / `NavLink` | menu e botões "Editar" |
| Navegar por código | `useNavigate` | voltar para a lista após salvar |
| Testar rotas | Jest + `MemoryRouter` | `rotas.test.jsx` |
| Testar o fluxo real | Playwright | `e2e/caso-real.spec.js` |
