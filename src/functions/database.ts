import mysql from "mysql2/promise";
import "dotenv/config";

// Pool de conexões MySQL
export const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "090899",
    database: process.env.DB_NAME || "chatbot_fiscal",
    port: parseInt(process.env.DB_PORT || "3306"),
});

// Função genérica para queries
export const query = async (sql: string, params: any[] = []) => {
    const [rows] = await pool.execute(sql, params);
    return rows;
};

