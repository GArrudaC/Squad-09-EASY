import { pool } from "./functions/database";

async function main() {
    try {
        const [rows] = await pool.query("SELECT 1 AS ok");
        console.log("Conexão MySQL funcionando:", rows);
    } catch (err) {
        console.error("Erro ao conectar:", err);
    }
}

main();