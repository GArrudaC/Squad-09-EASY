import { query } from "./database";

export async function autenticarUsuario(jid: string) {
    const numeroPuro = jid.split("@")[0]; // Ex.: 557799912345

    try {
        const sql = `
            SELECT 
                u.id,
                u.nome,
                u.numero_whatsapp,
                u.codigo_empresa,
                e.nome AS nome_empresa
            FROM usuarios u
            JOIN empresas e ON u.codigo_empresa = e.codigo_empresa
            WHERE REPLACE(REPLACE(REPLACE(u.numero_whatsapp, '+', ''), ' ', ''), '-', '') = ?
        `;

        const resultado = await query(sql, [numeroPuro]) as any[];

        if (resultado.length === 0) {
            return null; // Usuário não encontrado
        }

        return resultado[0]; // Usuário encontrado

    } catch (error) {
        console.error("Erro ao autenticar usuário:", error);
        return null;
    }
}
