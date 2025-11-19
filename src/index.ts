import makeWASocket, { DisconnectReason, useMultiFileAuthState } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import qrcode from "qrcode-terminal"
import { pino } from "pino";
import moment from "moment-timezone";

// ==============================================================================
// CONFIGURAÇÕES E VARIÁVEIS GLOBAIS
// ==============================================================================

// Mapa de estados (memória do bot)
// Definimos que a chave é string e o valor é string
const userState = new Map<string, string>();

// Textos dos Menus (Centralizados para facilitar edição)
const getMenuPrincipal = (nome: string) => {
    return `👋 Olá, ${nome}! Eu sou Zizy, a atendente virtual da Easy.

Aqui estão nossos serviços disponíveis:

*1.* Relatórios
*2.* ----- Pensar -----
*3.* Dúvidas sobre nossos serviços

Por favor, envie o número da opção desejada.
Caso deseje retornar ao menu principal digite "menu" a qualquer momento!`;
};

const subMenuRelatorios = `Você escolheu a opção 1, *Relatórios*.
O que você deseja?

*1.* Relatórios passados
*2.* Relatórios futuros
*3.* Definir período

*0.* Voltar ao menu anterior`;

const relatoriosPassados = `Você escolheu a opção 1.1, *Relatórios passados*.
Selecione o período:

*1.* 7 dias
*2.* 15 dias
*3.* 30 dias

*0.* Voltar ao menu anterior`;

const relatoriosFuturos = `Você escolheu a opção 2.1, *Relatórios futuros*.
Selecione o período:

*1.* 7 dias
*2.* 15 dias
*3.* 30 dias

*0.* Voltar ao menu anterior`;

const definirPeriodo = `Você escolheu a opção 3.1, *Definir período*.

Por favor, digite a *DATA INICIAL*.
Formato: dd/mm/aaaa (Ex: 01/10/2025)

*0.* Voltar ao menu anterior`;


// ==============================================================================
// FUNÇÃO PRINCIPAL
// ==============================================================================

async function connectwhatsapp(){
    const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

    const sock = makeWASocket({
        printQRInTerminal : false,
        auth: state,
        logger: pino({ level: "silent"})
    })

    // --- Função de Envio (Auxiliar) ---
    const enviar = async (texto: string, jid: string, quotedMsg: any) => {
        await sock.sendMessage(jid, { text: texto }, { quoted: quotedMsg })
    }

    // --- Lógica de Processamento de Mensagem (O CORAÇÃO DO BOT) ---
    // Adicionadas as tipagens: string, string, string, any
    async function processarMensagem(msgRaw: string, jid: string, nomeContato: string, quotedMsg: any) {
        
        const msg = msgRaw.toLowerCase().trim();
        
        // 1. Verificação de Estado Inicial
        if (!userState.has(jid)) {
            await enviar(getMenuPrincipal(nomeContato), jid, quotedMsg);
            userState.set(jid, "menu_principal");
            return;
        }

        let estadoAtual = userState.get(jid);

        // 2. Saída de Emergência Global
        if (msg === "menu") {
            await enviar(getMenuPrincipal(nomeContato), jid, quotedMsg);
            userState.set(jid, "menu_principal");
            userState.delete(jid + "_data_inicial");
            return;
        }

        // 3. Regex de Data
        const regexData = /^\d{2}\/\d{2}\/\d{4}$/;

        // 4. Máquina de Estados (Switch Case)
        switch (estadoAtual) {
            
            // --- MENU PRINCIPAL ---
            case "menu_principal":
                if (["oi", "olá", "bom dia", "boa tarde", "boa noite"].includes(msg)) {
                    await enviar(getMenuPrincipal(nomeContato), jid, quotedMsg);
                    return;
                }

                switch (msg) {
                    case "1":
                        await enviar(subMenuRelatorios, jid, quotedMsg);
                        userState.set(jid, "relatorios");
                        break;
                    case "2":
                        await enviar("🚧 Opção 2 em desenvolvimento.", jid, quotedMsg);
                        break;
                    case "3":
                        await enviar("Escreva sua dúvida abaixo e um atendente irá responder em breve.", jid, quotedMsg);
                        userState.set(jid, "duvidas_servicos");
                        break;
                    default:
                        await enviar("❌ Opção inválida. Digite 1, 2 ou 3.", jid, quotedMsg);
                        break;
                }
                break;

            // --- SUBMENU RELATÓRIOS ---
            case "relatorios":
                switch (msg) {
                    case "1":
                        await enviar(relatoriosPassados, jid, quotedMsg);
                        userState.set(jid, "relatorios_passados");
                        break;
                    case "2":
                        await enviar(relatoriosFuturos, jid, quotedMsg);
                        userState.set(jid, "relatorios_futuros");
                        break;
                    case "3":
                        await enviar(definirPeriodo, jid, quotedMsg);
                        userState.set(jid, "definir_periodo_inicial");
                        break;
                    case "0":
                        await enviar(getMenuPrincipal(nomeContato), jid, quotedMsg);
                        userState.set(jid, "menu_principal");
                        break;
                    default:
                        await enviar("❌ Opção inválida. Digite 1, 2, 3 ou 0 para voltar.", jid, quotedMsg);
                        break;
                }
                break;

            // --- RELATÓRIOS PASSADOS ---
            case "relatorios_passados":
                if (["1", "2", "3"].includes(msg)) {
                    const dias = msg === "1" ? 7 : msg === "2" ? 15 : 30;
                    await enviar(`✅ Gerando relatório passado de ${dias} dias...`, jid, quotedMsg);
                    // LOGICA DE BANCO DE DADOS ENTRARIA AQUI
                    userState.set(jid, "menu_principal"); 
                    await enviar(getMenuPrincipal(nomeContato), jid, quotedMsg);
                } else if (msg === "0") {
                    await enviar(subMenuRelatorios, jid, quotedMsg);
                    userState.set(jid, "relatorios");
                } else {
                    await enviar("❌ Opção inválida.", jid, quotedMsg);
                }
                break;

            // --- RELATÓRIOS FUTUROS ---
            case "relatorios_futuros":
                if (["1", "2", "3"].includes(msg)) {
                    const dias = msg === "1" ? 7 : msg === "2" ? 15 : 30;
                    await enviar(`✅ Gerando relatório futuro de ${dias} dias...`, jid, quotedMsg);
                    userState.set(jid, "menu_principal");
                    await enviar(getMenuPrincipal(nomeContato), jid, quotedMsg);
                } else if (msg === "0") {
                    await enviar(subMenuRelatorios, jid, quotedMsg);
                    userState.set(jid, "relatorios");
                } else {
                    await enviar("❌ Opção inválida.", jid, quotedMsg);
                }
                break;

            // --- DÚVIDAS ---
            case "duvidas_servicos":
                await enviar("✅ Recebemos sua dúvida! Em breve entraremos em contato.", jid, quotedMsg);
                userState.set(jid, "menu_principal");
                await enviar(getMenuPrincipal(nomeContato), jid, quotedMsg);
                break;

            // --- DEFINIR DATA INICIAL ---
            case "definir_periodo_inicial":
                if (msg === "0") {
                    userState.delete(jid + "_data_inicial");
                    await enviar(subMenuRelatorios, jid, quotedMsg);
                    userState.set(jid, "relatorios");
                } else if (regexData.test(msg)) {
                    userState.set(jid + "_data_inicial", msg);
                    userState.set(jid, "definir_periodo_final");
                    await enviar("Agora, digite a *DATA FINAL* (dd/mm/aaaa):", jid, quotedMsg);
                } else {
                    await enviar("⚠️ Formato inválido. Use dd/mm/aaaa (Ex: 01/10/2025).", jid, quotedMsg);
                }
                break;

            // --- DEFINIR DATA FINAL ---
            case "definir_periodo_final":
                if (msg === "0") {
                    userState.delete(jid + "_data_inicial");
                    await enviar(subMenuRelatorios, jid, quotedMsg);
                    userState.set(jid, "relatorios");
                } else if (regexData.test(msg)) {
                    const dataInicial = userState.get(jid + "_data_inicial");
                    userState.delete(jid + "_data_inicial");
                    
                    await enviar(`✅ Buscando dados de ${dataInicial} até ${msg}...`, jid, quotedMsg);
                    // LOGICA DO BANCO DE DADOS AQUI
                    
                    userState.set(jid, "menu_principal");
                    await enviar(getMenuPrincipal(nomeContato), jid, quotedMsg);
                } else {
                    await enviar("⚠️ Formato inválido. Use dd/mm/aaaa.", jid, quotedMsg);
                }
                break;

            default:
                await enviar(getMenuPrincipal(nomeContato), jid, quotedMsg);
                userState.set(jid, "menu_principal");
                break;
        }
    }


    // ==============================================================================
    // LISTENERS
    // ==============================================================================

    sock.ev.on("connection.update", (update) => {
        const {connection, lastDisconnect, qr} = update
        if(connection == "close" && lastDisconnect) {
            const shouldreconnect = (lastDisconnect.error as Boom)?.output?.statusCode != DisconnectReason.loggedOut
            console.log("Conexão falhou", lastDisconnect.error, "Tentando reconectar", shouldreconnect)
            if(shouldreconnect){ connectwhatsapp() }
        } else if(connection == "open"){
            console.log("Conexão bem sucedida")
        }
        if(qr){ qrcode.generate(qr, {small:true}) }
    })

    sock.ev.on("messages.upsert", async({ messages }) => {
        const msg = messages[0]
        if(!msg.message || msg.key.fromMe) return

        // Adicionado o ! para garantir que não é null
        const jid = msg.key.remoteJid! 

        if (jid.endsWith('@g.us')) return

        const nomeContato = msg.pushName || "Desconhecido"
        
        let textmessage = ""
        if (msg.message.conversation) textmessage = msg.message.conversation;
        else if (msg.message.extendedTextMessage?.text) textmessage = msg.message.extendedTextMessage.text;
        else return; 

        await processarMensagem(textmessage, jid, nomeContato, msg);
    })

    sock.ev.on("creds.update", saveCreds)
}

connectwhatsapp()