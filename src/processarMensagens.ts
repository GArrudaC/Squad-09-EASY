import { buscarRelatorioOmie } from "./functions/fetchApi";

// --- Textos do Menu (Podem ficar aqui para organizar) ---
const getMenuPrincipal = (nome: string) => {
    return `👋 Olá, ${nome}! Eu sou Zizy, a atendente virtual da Easy.

Aqui estão nossos serviços disponíveis:

*1.* Relatórios Financeiros
*2.* ----- Pensar -----
*3.* Dúvidas sobre nossos serviços

Por favor, envie o número da opção desejada.
Caso deseje retornar ao menu principal digite "menu" a qualquer momento!`;
};

const subMenuRelatorios = `Você escolheu a opção 1, *Relatórios*.
O que você deseja?

*1.* Relatórios passados (Últimos dias)
*2.* Relatórios futuros (Previsão)
*3.* Definir período personalizado

*0.* Voltar ao menu anterior`;

const relatoriosOpcoes = `Selecione o período desejado:

*1.* 7 dias
*2.* 15 dias
*3.* 30 dias

*0.* Voltar ao menu anterior`;

const definirPeriodo = `Você escolheu a opção 3.1, *Definir período*.

Por favor, digite a *DATA INICIAL*.
Formato: dd/mm/aaaa (Ex: 01/10/2025)

*0.* Voltar ao menu anterior`;

// --- A Função Principal de Lógica ---
export async function processarMensagem(
    jid: string, 
    msgRaw: string, 
    nomeContato: string, 
    userState: Map<string, string>, 
    enviar: (texto: string, jid: string) => Promise<any>
) {
    
    const msg = msgRaw.toLowerCase().trim();
    const regexData = /^\d{2}\/\d{2}\/\d{4}$/;

    // 1. Verificação de Estado Inicial
    if (!userState.has(jid)) {
        await enviar(getMenuPrincipal(nomeContato), jid);
        userState.set(jid, "menu_principal");
        return;
    }

    let estadoAtual = userState.get(jid);

    // 2. Saída de Emergência Global
    if (msg === "menu") {
        await enviar(getMenuPrincipal(nomeContato), jid);
        userState.set(jid, "menu_principal");
        userState.delete(jid + "_data_inicial"); // Limpa cache se houver
        return;
    }

    // 3. Máquina de Estados
    switch (estadoAtual) {
        
        // --- MENU PRINCIPAL ---
        case "menu_principal":
            if (["oi", "olá", "bom dia"].includes(msg)) {
                await enviar(getMenuPrincipal(nomeContato), jid);
                return;
            }
            switch (msg) {
                case "1":
                    await enviar(subMenuRelatorios, jid);
                    userState.set(jid, "relatorios");
                    break;
                case "2":
                    await enviar("🚧 Opção 2 em desenvolvimento.", jid);
                    break;
                case "3":
                    await enviar("Escreva sua dúvida abaixo e um atendente irá responder.", jid);
                    userState.set(jid, "duvidas_servicos");
                    break;
                default:
                    await enviar("❌ Opção inválida. Digite 1, 2 ou 3.", jid);
                    break;
            }
            break;

        // --- SUBMENU RELATÓRIOS ---
        case "relatorios":
            switch (msg) {
                case "1":
                    await enviar(relatoriosOpcoes, jid);
                    userState.set(jid, "relatorios_passados");
                    break;
                case "2":
                    await enviar(relatoriosOpcoes, jid);
                    userState.set(jid, "relatorios_futuros");
                    break;
                case "3":
                    await enviar(definirPeriodo, jid);
                    userState.set(jid, "definir_periodo_inicial");
                    break;
                case "0":
                    await enviar(getMenuPrincipal(nomeContato), jid);
                    userState.set(jid, "menu_principal");
                    break;
                default:
                    await enviar("❌ Opção inválida.", jid);
                    break;
            }
            break;

        // --- RELATÓRIOS PASSADOS (INTEGRADO COM API OMIE) ---
        case "relatorios_passados":
            if (["1", "2", "3"].includes(msg)) {
                const dias = msg === "1" ? 7 : msg === "2" ? 15 : 30;
                
                await enviar(`⏳ Buscando dados passados de ${dias} dias na Omie...`, jid);
                
                // CHAMA A FUNÇÃO DA OUTRA PASTA
                const resultado = await buscarRelatorioOmie(dias, 'passado');
                await enviar(resultado, jid);

                userState.set(jid, "menu_principal"); 
                await enviar("Voltando ao menu principal...", jid);
            } else if (msg === "0") {
                await enviar(subMenuRelatorios, jid);
                userState.set(jid, "relatorios");
            } else {
                await enviar("❌ Opção inválida.", jid);
            }
            break;

        // --- RELATÓRIOS FUTUROS (INTEGRADO COM API OMIE) ---
        case "relatorios_futuros":
            if (["1", "2", "3"].includes(msg)) {
                const dias = msg === "1" ? 7 : msg === "2" ? 15 : 30;
                
                await enviar(`⏳ Buscando previsão futura de ${dias} dias na Omie...`, jid);
                
                // CHAMA A FUNÇÃO DA OUTRA PASTA
                const resultado = await buscarRelatorioOmie(dias, 'futuro');
                await enviar(resultado, jid);

                userState.set(jid, "menu_principal");
                await enviar("Voltando ao menu principal...", jid);
            } else if (msg === "0") {
                await enviar(subMenuRelatorios, jid);
                userState.set(jid, "relatorios");
            } else {
                await enviar("❌ Opção inválida.", jid);
            }
            break;

        // --- DEFINIÇÃO DE PERÍODO (LÓGICA DE DATAS) ---
        case "definir_periodo_inicial":
             if (msg === "0") {
                userState.delete(jid + "_data_inicial");
                await enviar(subMenuRelatorios, jid);
                userState.set(jid, "relatorios");
            } else if (regexData.test(msg)) {
                userState.set(jid + "_data_inicial", msg);
                userState.set(jid, "definir_periodo_final");
                await enviar("Agora, digite a *DATA FINAL* (dd/mm/aaaa):", jid);
            } else {
                await enviar("⚠️ Formato inválido. Use dd/mm/aaaa (Ex: 01/10/2025).", jid);
            }
            break;

        case "definir_periodo_final":
            if (msg === "0") {
                userState.delete(jid + "_data_inicial");
                await enviar(subMenuRelatorios, jid);
                userState.set(jid, "relatorios");
            } else if (regexData.test(msg)) {
                const dataInicial = userState.get(jid + "_data_inicial");
                userState.delete(jid + "_data_inicial"); // Limpa temp
                
                // AQUI VOCÊ PODERIA CRIAR UMA NOVA FUNÇÃO NA API PARA BUSCAR POR PERÍODO
                await enviar(`✅ Período definido: ${dataInicial} até ${msg}.\n(Busca por período personalizado em desenvolvimento)`, jid);
                
                userState.set(jid, "menu_principal");
                await enviar(getMenuPrincipal(nomeContato), jid);
            } else {
                await enviar("⚠️ Formato inválido. Use dd/mm/aaaa.", jid);
            }
            break;

        case "duvidas_servicos":
            await enviar("✅ Recebemos sua dúvida! Em breve entraremos em contato.", jid);
            userState.set(jid, "menu_principal");
            break;

        default:
            await enviar(getMenuPrincipal(nomeContato), jid);
            userState.set(jid, "menu_principal");
            break;
    }
}