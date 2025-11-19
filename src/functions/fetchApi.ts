import moment from "moment-timezone";
import "dotenv/config"; // Importante: Carrega as variáveis do .env

// Verifica se as chaves foram carregadas
const appKey = process.env.OMIE_APP_KEY;
const appSecret = process.env.OMIE_APP_SECRET;

if (!appKey || !appSecret) {
    throw new Error("ERRO DE CONFIGURAÇÃO: Chaves da OMIE não encontradas no arquivo .env");
}

// Função renomeada para ser mais descritiva e exportada para uso no bot
export async function buscarRelatorioOmie(dias: number, tipo: 'passado' | 'futuro') {
    const urlMov = "https://app.omie.com.br/api/v1/financas/mf/";
    const urlCat = "https://app.omie.com.br/api/v1/geral/categorias/";

    // 1. Calcular Datas
    const hoje = moment().tz("America/Sao_Paulo");
    let dataInicial, dataFinal;

    if (tipo === 'passado') {
        dataFinal = hoje.format("DD/MM/YYYY");
        dataInicial = hoje.clone().subtract(dias, 'days').format("DD/MM/YYYY");
    } else {
        dataInicial = hoje.format("DD/MM/YYYY");
        dataFinal = hoje.clone().add(dias, 'days').format("DD/MM/YYYY");
    }

    // 2. Montar Corpo da Requisição (Usando as chaves seguras)
    const bodyMov = {
        call: "ListarMovimentos",
        app_key: appKey,
        app_secret: appSecret,
        param: [{ 
            nPagina: 1, 
            nRegPorPagina: 20, 
            dDtPagamentoDe: dataInicial, 
            dDtPagamentoAte: dataFinal,
            cExibirCategorias: "S" 
        }] 
    };

    const bodyCat = {
        call: "ListarCategorias",
        app_key: appKey,
        app_secret: appSecret,
        param: [{ pagina: 1, registros_por_pagina: 500 }]
    };

    try {
        // 3. Chamada Paralela
        const [resMov, resCat] = await Promise.all([
            fetch(urlMov, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(bodyMov) }),
            fetch(urlCat, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(bodyCat) }),
        ]);

        if (!resMov.ok || !resCat.ok) throw new Error("Erro na resposta da API Omie");

        const [dadosMov, dadosCat] = await Promise.all([resMov.json(), resCat.json()]);

        // @ts-ignore
        if (!dadosMov.movimentos || dadosMov.movimentos.length === 0) {
            return `🚫 Nenhum movimento encontrado entre ${dataInicial} e ${dataFinal}.`;
        }

        // 4. Mapear Categorias
        const mapaCategorias = new Map();
        // @ts-ignore
        dadosCat.categoria_cadastro.forEach((cat: any) => mapaCategorias.set(cat.codigo, cat.descricao));

        // 5. Formatar Resposta
        let mensagem = `📊 *Relatório Financeiro (${tipo === 'passado' ? 'Últimos' : 'Próximos'} ${dias} dias)*\n\n`;
        let total = 0;

        // @ts-ignore
        dadosMov.movimentos.forEach((mov: any) => {
            const valor = mov.resumo.nValPago || mov.detalhes.nValorTitulo;
            const catNome = mapaCategorias.get(mov.detalhes.cCodCateg) || "Sem Categoria";
            const data = mov.detalhes.dDtPagamento || mov.detalhes.dDtPrevisao;
            
            total += parseFloat(String(valor));
            mensagem += `📅 ${data} | 💰 R$ ${valor.toFixed(2)}\n📂 ${catNome}\n────────────────\n`;
        });

        mensagem += `\n✅ *Total:* R$ ${total.toFixed(2)}`;
        return mensagem;

    } catch (error) {
        console.error("Erro API:", error);
        return "❌ Erro ao consultar dados financeiros.";
    }
}