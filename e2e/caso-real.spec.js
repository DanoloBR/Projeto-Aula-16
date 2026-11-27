import { test, expect } from "@playwright/test";

// CASO REAL
// A mestre Ana funda a guilda "Legião dos Dragões", recruta o aventureiro "Bruno Ferreira",
// corrige o nome dele, abre a ficha pelo endereço direto e, por fim, remove os dois.

const GUILDA = "Legião dos Dragões";
const MEMBRO = "Bruno Ferreira";
const MEMBRO_CORRIGIDO = "Bruno Ferreira Lima";

// Salva uma captura de tela em test-results/evidencias para conferência visual
const foto = (page, nome) =>
  page.screenshot({ path: `test-results/evidencias/${nome}.png`, fullPage: true });

test("fluxo completo: criar, editar, abrir pela URL, tratar erros e excluir", async ({ page }) => {
  // Aceita automaticamente as janelas de confirmação ("Excluir ...?")
  page.on("dialog", (dialogo) => dialogo.accept());

  // 1. Fundar a guilda
  await page.goto("/guildas");
  await page.getByRole("link", { name: "+ Nova guilda" }).click();
  await expect(page).toHaveURL(/\/guildas\/nova$/);
  await page.getByLabel("Nome da guilda").fill(GUILDA);
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(page).toHaveURL(/\/guildas$/);
  await expect(page.getByText(GUILDA)).toBeVisible();
  await foto(page, "01-guildas-com-nova-guilda");

  // 2. Recrutar o membro para a guilda
  await page.getByRole("link", { name: "Membros" }).click();
  await page.getByRole("link", { name: "+ Novo membro" }).click();
  await expect(page).toHaveURL(/\/membros\/novo$/);
  await page.getByLabel("Nome do membro").fill(MEMBRO);
  await page.getByLabel("Guilda").selectOption({ label: GUILDA });
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(page).toHaveURL(/\/membros$/);

  const linhaDoMembro = page.getByRole("listitem").filter({ hasText: MEMBRO });
  await expect(linhaDoMembro).toContainText(GUILDA);
  await foto(page, "02-membros-com-guilda-associada");

  // 3. Editar o membro: a URL carrega o id e o formulário busca os dados na API
  const linkEditar = linhaDoMembro.getByRole("link", { name: "Editar" });
  const enderecoDaFicha = await linkEditar.getAttribute("href");
  await linkEditar.click();
  await expect(page).toHaveURL(/\/membros\/[^/]+$/);
  await expect(page.getByLabel("Nome do membro")).toHaveValue(MEMBRO);
  await foto(page, "03-formulario-edicao-carregado-pela-url");

  await page.getByLabel("Nome do membro").fill(MEMBRO_CORRIGIDO);
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(page).toHaveURL(/\/membros$/);
  await expect(page.getByText(MEMBRO_CORRIGIDO)).toBeVisible();

  // 4. Abrir a ficha pelo endereço direto (sem passar pela lista).
  // Prova que a rota dinâmica busca o dado na primeira carga da página.
  await page.goto(enderecoDaFicha);
  await expect(page.getByLabel("Nome do membro")).toHaveValue(MEMBRO_CORRIGIDO);

  // 5. Erros de rota: id inexistente e endereço que não existe
  await page.goto("/guildas/nao-existe");
  await expect(page.getByRole("alert")).toContainText("Guilda não encontrada");
  await foto(page, "04-id-inexistente");

  await page.goto("/rota-que-nao-existe");
  await expect(page.getByText("Erro 404")).toBeVisible();
  await foto(page, "05-rota-inexistente-404");

  // 6. Limpeza: excluir o membro e a guilda criados no teste
  await page.goto("/membros");
  await page
    .getByRole("listitem")
    .filter({ hasText: MEMBRO_CORRIGIDO })
    .getByRole("button", { name: "Excluir" })
    .click();
  await expect(page.getByText(MEMBRO_CORRIGIDO)).toHaveCount(0);

  await page.goto("/guildas");
  await page
    .getByRole("listitem")
    .filter({ hasText: GUILDA })
    .getByRole("button", { name: "Excluir" })
    .click();
  await expect(page.getByText(GUILDA)).toHaveCount(0);

  await page.screenshot({ path: "test-results/caso-real-final.png", fullPage: true });
});
