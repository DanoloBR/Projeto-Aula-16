# Guilda RPG

Sistema de gerenciamento de guildas e aventureiros, feito em React para a aula de
**roteamento e rotas dinâmicas**. Veja o roteiro completo em [AULA-roteamento-guilda-rpg.md](AULA-roteamento-guilda-rpg.md).

## Tecnologias

- React 18 + Vite
- React Router v6 (rotas, `useParams`, `useNavigate`)
- Axios (cliente HTTP)
- json-server (API falsa em `db.json`)
- Tailwind CSS (estilos)
- Jest + Testing Library (testes de componentes e rotas)
- Playwright (testes ponta a ponta)

## Pré-requisitos

- Node.js 18 ou superior (testado com Node 22)

## Como executar

```bash
npm install
```

Em dois terminais:

```bash
# Terminal 1: API em http://localhost:8000
npm run api

# Terminal 2: aplicação em http://localhost:5173
npm run dev
```

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Sobe a aplicação em modo de desenvolvimento |
| `npm run api` | Sobe a API (json-server) com o `db.json` |
| `npm run build` | Gera a versão de produção em `dist/` |
| `npm run preview` | Serve a versão de produção gerada pelo build |
| `npm run lint` | Verifica o código com ESLint |
| `npm test` | Roda os testes unitários e de rotas (Jest) |
| `npm run e2e` | Roda o teste ponta a ponta do caso real (Playwright) |

Na primeira vez que for rodar `npm run e2e`, instale o navegador de testes:

```bash
npx playwright install chromium
```

Se você já tem um Chromium instalado, informe o caminho dele:

```bash
CHROMIUM_PATH=/caminho/para/chromium npm run e2e
```

## Configuração

O endereço da API fica em `.env` (`VITE_API_URL`). Os testes ponta a ponta usam `.env.teste`,
com uma API separada e um banco de testes (`db.teste.json`), para não alterar o `db.json` real.

## Estrutura

```
src/
├── main.jsx              # Ponto de entrada: BrowserRouter envolve a aplicação
├── App.jsx               # Declaração das rotas
├── configuracao.js       # Flags de configuração do React Router
├── index.css             # Estilos base e classes reutilizáveis
├── api/clienteApi.js     # Cliente HTTP (axios) com a URL da API
├── componentes/          # Componentes compartilhados (Navbar)
├── paginas/              # Uma página por rota
└── testes/               # Testes com Jest
e2e/                      # Testes ponta a ponta com Playwright
db.json                   # Dados da API falsa
```
