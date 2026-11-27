import { copyFileSync } from "node:fs";

// Copia o banco real (db.json) para um banco de testes (db.teste.json).
// Assim os testes ponta a ponta criam e apagam dados sem alterar o banco original.
copyFileSync("db.json", "db.teste.json");
console.log("Banco de testes preparado: db.teste.json");
