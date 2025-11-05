export default async function fetchApi() {
    const url1 = "https://app.omie.com.br/api/v1/financas/mf/";
    const url2 = "https://app.omie.com.br/api/v1/geral/categorias/";
    const appKey = "5614700718627";
    const appSecret = "2ae8328ce879960d99ba83e7986805a3";

    const body1 = {
        call: "ListarMovimentos",
        app_key: appKey,
        app_secret: appSecret,
        param: [{ nPagina: 1, nRegPorPagina: 5 }] // Pode aumentar quantos registros quer
    };

    const body2 = {
        call: "ListarCategorias",
        app_key: appKey,
        app_secret: appSecret,
        param: [{ pagina: 1, registros_por_pagina: 5 }]
    };

    try {
        const [resMov, resCat] = await Promise.all([
            fetch(url1, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body1),
            }),
            fetch(url2, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body2),
            }),
        ]);

        if (!resMov.ok) throw new Error(`Erro HTTP Movimentos: ${resMov.status}`);
        if (!resCat.ok) throw new Error(`Erro HTTP Categorias: ${resCat.status}`);

        const [dadosMov, dadosCat] = await Promise.all([
            resMov.json(),
            resCat.json(),
        ]);

        // Filtrar e formatar movimentos
        // @ts-ignore
        const movimentosFiltrados = dadosMov.movimentos.map(mov => ({
            categoria: mov.detalhes.cCodCateg,
            grupo: mov.detalhes.cGrupo,
            status: mov.detalhes.cStatus,
            valorTitulo: mov.detalhes.nValorTitulo,
            dataEmissao: mov.detalhes.dDtEmissao,
            dataPagamento: mov.detalhes.dDtPagamento,
            valorPago: mov.resumo.nValPago
        }));

        // Filtrar e formatar categorias
        // @ts-ignore
        const categoriasFiltradas = dadosCat.categoria_cadastro.map(cat => ({
            codigo: cat.codigo,
            descricao: cat.descricao,
            transferencia: cat.transferencia
        }));

        console.log("Movimentos filtrados:");
        console.log(JSON.stringify(movimentosFiltrados, null, 2));

        console.log("\nCategorias filtradas:");
        console.log(JSON.stringify(categoriasFiltradas, null, 2));

    } catch (erro) {
        console.error("Erro ao puxar a API:", erro);
    }
}

fetchApi();
