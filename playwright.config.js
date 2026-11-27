import { defineConfig } from "@playwright/test";

// Testes ponta a ponta: sobe a API de teste e a aplicação, e usa um navegador real.
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:5174",
    headless: true,
    screenshot: "only-on-failure",
    // Por padrão usa o Chromium baixado pelo Playwright (npx playwright install chromium).
    // Se preferir outro navegador instalado, informe o caminho em CHROMIUM_PATH.
    launchOptions: process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
  },
  webServer: [
    {
      command: "npx json-server --watch db.teste.json --port 8001",
      url: "http://localhost:8001/guildas",
      reuseExistingServer: false,
    },
    {
      // --mode teste carrega o arquivo .env.teste (API na porta 8001)
      command: "npx vite --mode teste --port 5174 --strictPort",
      url: "http://localhost:5174",
      reuseExistingServer: false,
    },
  ],
});
