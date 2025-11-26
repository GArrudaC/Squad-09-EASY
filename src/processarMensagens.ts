import { buscarRelatorioOmie } from "./functions/fetchApi";

// ==============================================================================
// TEXTOS DOS MENUS
// ==============================================================================

const getMenuPrincipal = (nome: string) => {
    return `👋 Olá, ${nome}! Eu sou Zizy, a atendente virtual da Easy.

Aqui estão nossos serviços disponíveis:

1. Relatórios
2. Dúvidas sobre o atendimento a Zizy.

Por favor, envie o número da opção desejada.`;
};

const subMenuRelatorios = `Você escolheu a opção 1, Relatórios. O que você deseja?

1. Relatórios passados
2. Relatórios futuros
3. Definir Período
0. Voltar ao menu anterior`;

const relatoriosPassadosTxt = `Você escolheu a opção 1, Relatórios passados. O que você deseja?

1. 7 dias
2. 15 dias
3. 30 dias
0. voltar ao menu anterior`;

const relatoriosFuturosTxt = `Você escolheu a opção 2, Relatórios futuros. O que você deseja?

1. 7 dias
2. 15 dias
3. 30 dias
0. voltar ao menu anterior`;

const definirPeriodoInicial = `Você escolheu a opção 3, Definir período.

Qual a data inicial?
Colocar no formato (dd/mm/aaaa)

0. Voltar ao menu anterior`;

const definirPeriodoFinal = `Qual a data final?
Colocar no formato (dd/mm/aaaa)

0. Voltar ao menu anterior`;

const textoDuvidas = `Você escolheu a opção 2, Dúvidas sobre o atendimento a Zizy.

Aqui vai uma breve explicação do que nos podemos fazer juntos:

👉 Para ver Relatórios Passados:
Acesse a opção 1 (Relatórios) > 1 (Passados) e escolha entre 7, 15 ou 30 dias.

👉 Para ver Relatórios Futuros:
Acesse a opção 1 (Relatórios) > 2 (Futuros) e escolha o período de previsão.

👉 Datas Personalizadas:
Se nossas opções não te atenderem, você consegue solicitar um relatório com data personalizada na opção "Definir Período"!

Se quiser voltar ao menu e reiniciar o nosso processo é só escrever "menu".`;

// Mensagem limpa, sem instruções de comando
const msgFimRelatorio = "✅ Relatório entregue.";
const msgErroReset = "Por favor, envie outra mensagem para começar novamente.";


// ==============================================================================
// LÓGICA PRINCIPAL
// ==============================================================================

export async function processarMensagem(
    jid: string, 
    msgRaw: string, 
    nomeContato: string, 
    userState: Map<string, string>, 
    enviar: (texto: string, jid: string) => Promise<any>
) {
    
    const msg = msgRaw.toLowerCase().trim();
    const regexData = /^\d{2}\/\d{2}\/\d{4}$/;

    // 1. Se não tem estado (primeira vez), manda o Menu
    if (!userState.has(jid)) {
        await enviar(getMenuPrincipal(nomeContato), jid);
        userState.set(jid, "menu_principal");
        return;
    }

    let estadoAtual = userState.get(jid);

    // 2. Saída de Emergência Global (Mantida para segurança)
    if (msg === "menu") {
        await enviar(getMenuPrincipal(nomeContato), jid);
        userState.set(jid, "menu_principal");
        userState.delete(jid + "_data_inicial"); 
        return;
    }

    // 3. Máquina de Estados
    switch (estadoAtual) {
        
        // --- MENU PRINCIPAL ---
        case "menu_principal":
            switch (msg) {
                case "1": // Relatórios
                    await enviar(subMenuRelatorios, jid);
                    userState.set(jid, "relatorios");
                    break;
                
                case "2": // Dúvidas
                    await enviar(textoDuvidas, jid);
                    userState.set(jid, "menu_principal"); 
                    break;
                
                default:
                    // AQUI ESTÁ A MUDANÇA: 
                    // Qualquer mensagem que não seja 1 ou 2 vai reenviar o menu.
                    // Sem erro, sem travas.
                    await enviar(getMenuPrincipal(nomeContato), jid);
                    break;
            }
            break;

        // --- SUBMENU RELATÓRIOS ---
        case "relatorios":
            switch (msg) {
                case "1":
                    await enviar(relatoriosPassadosTxt, jid);
                    userState.set(jid, "relatorios_passados");
                    break;
                case "2":
                    await enviar(relatoriosFuturosTxt, jid);
                    userState.set(jid, "relatorios_futuros");
                    break;
                case "3":
                    await enviar(definirPeriodoInicial, jid);
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

        // --- RELATÓRIOS PASSADOS ---
        case "relatorios_passados":
            if (["1", "2", "3"].includes(msg)) {
                const dias = msg === "1" ? 7 : msg === "2" ? 15 : 30;
                await enviar(`⏳ Buscando dados passados de ${dias} dias na Easy...`, jid);
                
                const resultado = await buscarRelatorioOmie(dias, 'passado');
                
                if (resultado.startsWith("❌") || resultado.startsWith("⚠️")) {
                    await enviar(resultado, jid);
                    await enviar(msgErroReset, jid);
                    userState.delete(jid);
                } else {
                    await enviar(resultado, jid);
                    // Mantém no menu e avisa que acabou
                    userState.set(jid, "menu_principal"); 
                    await enviar(msgFimRelatorio, jid);
                }

            } else if (msg === "0") {
                await enviar(subMenuRelatorios, jid);
                userState.set(jid, "relatorios");
            } else {
                await enviar("❌ Opção inválida.", jid);
            }
            break;

        // --- RELATÓRIOS FUTUROS ---
        case "relatorios_futuros":
            if (["1", "2", "3"].includes(msg)) {
                const dias = msg === "1" ? 7 : msg === "2" ? 15 : 30;
                await enviar(`⏳ Buscando previsão futura de ${dias} dias na Easy...`, jid);
                
                const resultado = await buscarRelatorioOmie(dias, 'futuro');
                
                if (resultado.startsWith("❌") || resultado.startsWith("⚠️")) {
                    await enviar(resultado, jid);
                    await enviar(msgErroReset, jid);
                    userState.delete(jid);
                } else {
                    await enviar(resultado, jid);
                    userState.set(jid, "menu_principal");
                    await enviar(msgFimRelatorio, jid);
                }

            } else if (msg === "0") {
                await enviar(subMenuRelatorios, jid);
                userState.set(jid, "relatorios");
            } else {
                await enviar("❌ Opção inválida.", jid);
            }
            break;

        // --- DEFINIÇÃO DE PERÍODO (INICIAL) ---
        case "definir_periodo_inicial":
            if (msg === "0") {
                userState.delete(jid + "_data_inicial");
                await enviar(subMenuRelatorios, jid);
                userState.set(jid, "relatorios");
            } else if (regexData.test(msg)) {
                userState.set(jid + "_data_inicial", msg);
                userState.set(jid, "definir_periodo_final");
                await enviar(definirPeriodoFinal, jid);
            } else {
                await enviar("⚠️ Formato inválido. Coloque no formato (dd/mm/aaaa).", jid);
            }
            break;

        // --- DEFINIÇÃO DE PERÍODO (FINAL) ---
        case "definir_periodo_final":
            if (msg === "0") {
                userState.delete(jid + "_data_inicial");
                await enviar(subMenuRelatorios, jid);
                userState.set(jid, "relatorios");
            } else if (regexData.test(msg)) {
                const dataInicial = userState.get(jid + "_data_inicial");
                const dataFinal = msg; 
                
                userState.delete(jid + "_data_inicial"); 
                
                await enviar(`⏳ Buscando dados personalizados de ${dataInicial} até ${dataFinal}...`, jid);
                
                // @ts-ignore
                const resultado = await buscarRelatorioOmie(0, 'passado', { inicio: dataInicial, fim: dataFinal });
                
                if (resultado.startsWith("❌") || resultado.startsWith("⚠️")) {
                    await enviar(resultado, jid);
                    await enviar(msgErroReset, jid);
                    userState.delete(jid);
                } else {
                    await enviar(resultado, jid);
                    userState.set(jid, "menu_principal");
                    await enviar(msgFimRelatorio, jid);
                }

            } else {
                await enviar("⚠️ Formato inválido. Coloque no formato (dd/mm/aaaa).", jid);
            }
            break;

        default:
            // Estado desconhecido -> Menu
            await enviar(getMenuPrincipal(nomeContato), jid);
            userState.set(jid, "menu_principal");
            break;
    }
}