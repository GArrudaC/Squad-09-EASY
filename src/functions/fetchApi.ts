import moment from "moment-timezone";
import "dotenv/config"; 

const appKey = process.env.OMIE_APP_KEY || "";
const appSecret = process.env.OMIE_APP_SECRET || "";

if (!appKey || !appSecret) {
    throw new Error("ERRO CRÍTICO: Chaves não configuradas no .env");
}

// Função auxiliar que busca dados SEM FILTRO DE DATA para evitar erro 500
async function buscarDadosOmie(url: string) {
    let todosRegistros: any[] = [];
    let pagina = 1;
    // Busca até 4 páginas (200 registros) para garantir que pegamos o mês todo
    const MAX_PAGINAS = 4; 

    const callMethod = url.includes("contapagar") ? "ListarContasPagar" : "ListarContasReceber";

    try {
        do {
            console.log(`   ↳ ${callMethod}: Baixando página ${pagina}...`);
            
            // 🚨 AQUI ESTÁ O SEGREDO:
            // Removemos as tags de data (data_venc_ini, etc) daqui.
            // Mandamos apenas paginação. Assim a Omie NÃO TEM COMO dar erro de tag.
            const body = {
                call: callMethod,
                app_key: appKey,
                app_secret: appSecret,
                param: [{
                    pagina: pagina,
                    registros_por_pagina: 50,
                    apenas_importado_api: "N"
                }]
            };

            const res = await fetch(url, { 
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) 
            });

            if (!res.ok) {
                console.log(`⚠️ Página ${pagina} falhou ou acabou.`);
                break;
            }
            
            const dados = await res.json();
            
            // @ts-ignore
            if (dados.faultstring) {
                // @ts-ignore
                console.error(`❌ Erro Omie: ${dados.faultstring}`);
                break;
            }

            // @ts-ignore
            const lista = url.includes("contapagar") ? dados.conta_pagar_cadastro : dados.conta_receber_cadastro;
            
            if (lista && lista.length > 0) {
                todosRegistros = todosRegistros.concat(lista);
            } else {
                break;
            }

            // @ts-ignore
            const totalPgs = dados.total_de_paginas || 1;
            if (pagina >= totalPgs) break;

            pagina++;

        } while (pagina <= MAX_PAGINAS);

        return todosRegistros;

    } catch (erro) {
        console.error(`❌ Erro técnico em ${callMethod}:`, erro);
        return [];
    }
}

export async function buscarRelatorioOmie(
    dias: number, 
    tipo: 'passado' | 'futuro', 
    datasPersonalizadas?: { inicio: string, fim: string }
) {
    
    // 1. DEFINIR O PERÍODO (Para filtrar aqui no código)
    let inicioMoment, fimMoment;
    let dataInicialStr, dataFinalStr;

    if (datasPersonalizadas) {
        inicioMoment = moment(datasPersonalizadas.inicio, "DD/MM/YYYY");
        fimMoment = moment(datasPersonalizadas.fim, "DD/MM/YYYY");
        dataInicialStr = datasPersonalizadas.inicio;
        dataFinalStr = datasPersonalizadas.fim;
    } else {
        const hoje = moment().tz("America/Sao_Paulo");
        if (tipo === 'passado') {
            fimMoment = hoje.clone();
            inicioMoment = hoje.clone().subtract(dias, 'days');
        } else {
            inicioMoment = hoje.clone();
            fimMoment = hoje.clone().add(dias, 'days');
        }
        dataInicialStr = inicioMoment.format("DD/MM/YYYY");
        dataFinalStr = fimMoment.format("DD/MM/YYYY");
    }

    console.log(`\n🚀 [API] Processando: ${dataInicialStr} a ${dataFinalStr}`);

    const urlPagar = "https://app.omie.com.br/api/v1/financas/contapagar/";
    const urlReceber = "https://app.omie.com.br/api/v1/financas/contareceber/";
    
    // 2. BUSCA BRUTA
    const [contasPagar, contasReceber] = await Promise.all([
        buscarDadosOmie(urlPagar),
        buscarDadosOmie(urlReceber)
    ]);

    console.log(`📦 Total bruto baixado: ${contasPagar.length} pagar, ${contasReceber.length} receber`);

    // 3. FILTRAGEM INTELIGENTE (LOCAL)
    // Aqui nós usamos sua lógica de data, mas sem depender da Omie aceitar a tag
    const filtrarPorPeriodo = (lista: any[]) => {
        return lista.filter(item => {
            const dataVenc = item.data_vencimento;
            if (!dataVenc) return false;
            const mData = moment(dataVenc, "DD/MM/YYYY");
            return mData.isBetween(inicioMoment, fimMoment, 'day', '[]');
        });
    };

    const pagarFiltrado = filtrarPorPeriodo(contasPagar);
    const receberFiltrado = filtrarPorPeriodo(contasReceber);

    const totalFiltrado = pagarFiltrado.length + receberFiltrado.length;
    console.log(`✅ Filtrados no período: ${totalFiltrado}`);

    if (totalFiltrado === 0) {
        return "⚠️ Não foram encontrados lançamentos com vencimento neste período.";
    }

    // 4. CÁLCULOS
    let receitas = 0;
    let custos = 0;
    let despesas = 0;
    let totalEntrada = 0;
    let totalSaida = 0;

    // Processa as ENTRADAS (Contas a Receber)
    receberFiltrado.forEach((item: any) => {
        const valor = parseFloat(String(item.valor_documento || 0));
        if (valor === 0) return;
        
        totalEntrada += valor;
        receitas += valor; // Tudo que entra é considerado receita bruta
    });

    // Processa as SAÍDAS (Contas a Pagar)
    pagarFiltrado.forEach((item: any) => {
        const valor = parseFloat(String(item.valor_documento || 0));
        if (valor === 0) return;

        totalSaida += valor;
        const cat = item.codigo_categoria || (item.categorias && item.categorias[0]?.codigo_categoria) || "";
        if (cat.startsWith("2.1")) custos += valor;
        else despesas += valor; // Se não for custo, consideramos como despesa
    });

    const resultado = receitas - custos - despesas;
    const fmt = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const titulo = datasPersonalizadas ? "Personalizado" : (tipo === 'passado' ? 'Realizado' : 'Previsão');

    let msg = `📊 *Relatório Gerencial (${titulo})*\n`;
    msg += `📅 ${dataInicialStr} a ${dataFinalStr}\n\n`;
    
    msg += `💰 *RESUMO*\n`;
    msg += `🟢 Recebido: R$ ${fmt(totalEntrada)}\n`;
    msg += `🔴 Pago: R$ ${fmt(totalSaida)}\n`;
    msg += `────────────────\n\n`;

    msg += `📋 *DETALHAMENTO*\n`;
    msg += `(+) Receitas (1.0): R$ ${fmt(receitas)}\n`;
    msg += `(-) Custos (2.1): R$ ${fmt(custos)}\n`;
    msg += `(-) Despesas (3.x): R$ ${fmt(despesas)}\n\n`;

    msg += `────────────────\n`;
    msg += `🏁 *RESULTADO: R$ ${fmt(resultado)}*`;

    return msg;
}