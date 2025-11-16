import makeWASocket, {DisconnectReason, useMultiFileAuthState} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import qrcode from "qrcode-terminal"
import { pino } from "pino";
import moment from "moment-timezone";

async function connectwhatsapp(){
    const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

    const sock = makeWASocket({
        printQRInTerminal : false,
        auth: state,
        logger: pino({ level: "silent"})
    })

    const userState = new Map<string, string>(); // Para estados simples
    // Sugestão: para salvar dados extra (ex: datas), concatene a chave com sufixo, ex: jid + "_data_inicial"

    // Menus
    const menuPrincipal = (nomeContato: string) => {
        return `👋 Olá, ${nomeContato}! Eu sou Zizy, a atendente virtual da Easy.

Aqui estão nossos serviços disponíveis:

1. Relatórios
2. ----- Pensar -----
3. Dúvidas sobre nossos serviços

Por favor, envie o número da opção desejada.
Caso deseje retornar ao menu principal digite "menu" a qualquer momento!`;
    };

    const subMenuRelatorios = `Você escolheu a opção 1, Relatórios.
O que você deseja?

1. Relatórios passados
2. Relatórios futuros
3. Definir período

0. Voltar ao menu anterior`;

    const relatoriosPassados = `Você escolheu a opção 1.1, Relatórios passados.
O que você deseja?

1. 7 dias
2. 15 dias
3. 30 dias

0. Voltar ao menu anterior`;

    const relatoriosFuturos = `Você escolheu a opção 2.1, Relatórios futuros.
O que você deseja?

1. 7 dias
2. 15 dias
3. 30 dias

0. Voltar ao menu anterior`;

    const definirPeriodo = `Você escolheu a opção 3.1, Definir período.

Qual a data inicial?
Coloque no formato (dd/mm/aaaa)
Qual a data final?
Coloque no formato (dd/mm/aaaa)

0. Voltar ao menu anterior`;

    sock.ev.on("connection.update", (update) => {
        const {connection, lastDisconnect, qr} = update
        if(connection == "close" && lastDisconnect) {
            const shouldreconnect = (lastDisconnect.error as Boom)?.output?.statusCode != DisconnectReason.loggedOut
            console.log(
                "Conexão falhou", lastDisconnect.error, "Tentando reconectar", shouldreconnect
            )
            if(shouldreconnect){
                connectwhatsapp()
            }
        }else if(connection == "open"){
            console.log("Conexão bem sucedida")
        }
        if(qr){
            qrcode.generate(qr, {small:true})
        }
    })

    sock.ev.on("messages.upsert", async({ messages }) => {
        const msg = messages[0]
        if(!msg.message || msg.key.fromMe) return

        const jid = msg.key.remoteJid!
        if (jid.endsWith('@g.us')) return // Ignorar grupos

        const nomeContato = msg.pushName || "Desconhecido"
        let textmessage = ""

        if (msg.message.conversation) {
            textmessage = msg.message.conversation;
        } else if (msg.message.extendedTextMessage?.text) {
            textmessage = msg.message.extendedTextMessage.text;
        } else {
            return; // Outros tipos ignorados neste exemplo
        }

        // Função para enviar mensagens respondendo ao usuário
        const enviar = (texto: string, jid: string) => {
            return sock.sendMessage(jid, { text: texto }, { quoted: msg })
        }

        // Função para processar mensagem e controlar o menu
        async function processarMensagem(jid: string, texto: string, nomeContato: string) {
            let estadoAtual = userState.get(jid) || "menu_principal";
            const msg = texto.toLowerCase().trim();

            if (msg === "menu") {
                await enviar(menuPrincipal(nomeContato), jid);
                userState.set(jid, "menu_principal");
                return;
            }

            const regexData = /^\d{2}\/\d{2}\/\d{4}$/;

            switch (estadoAtual) {
                case "menu_principal":
                    switch (msg) {
                        case "1":
                            await enviar(subMenuRelatorios, jid);
                            userState.set(jid, "relatorios");
                            break;
                        case "2":
                            await enviar("Opção 2 em desenvolvimento.", jid);
                            break;
                        case "3":
                            await enviar("Dúvidas sobre nossos serviços? Envie sua pergunta.", jid);
                            userState.set(jid, "duvidas_servicos");
                            break;
                        default:
                            await enviar("Opção inválida, por favor digite uma opção válida.", jid);
                            break;
                    }
                    break;

                case "relatorios":
                    switch (msg) {
                        case "1":
                            await enviar(relatoriosPassados, jid);
                            userState.set(jid, "relatorios_passados");
                            break;
                        case "2":
                            await enviar(relatoriosFuturos, jid);
                            userState.set(jid, "relatorios_futuros");
                            break;
                        case "3":
                            await enviar(definirPeriodo, jid);
                            userState.set(jid, "definir_periodo_inicial");
                            break;
                        case "0":
                            await enviar(menuPrincipal(nomeContato), jid);
                            userState.set(jid, "menu_principal");
                            break;
                        default:
                            await enviar("Opção inválida, por favor digite uma opção válida.", jid);
                            break;
                    }
                    break;

                case "relatorios_passados":
                    if (["1", "2", "3"].includes(msg)) {
                        await enviar(`Você escolheu relatórios passados para ${msg} dias.`, jid);
                        // Aqui você pode chamar a função para gerar relatório
                    } else if (msg === "0") {
                        await enviar(subMenuRelatorios, jid);
                        userState.set(jid, "relatorios");
                    } else {
                        await enviar("Opção inválida, por favor digite uma opção válida.", jid);
                    }
                    break;

                case "relatorios_futuros":
                    if (["1", "2", "3"].includes(msg)) {
                        await enviar(`Você escolheu relatórios futuros para ${msg} dias.`, jid);
                        // Função para gerar relatório
                    } else if (msg === "0") {
                        await enviar(subMenuRelatorios, jid);
                        userState.set(jid, "relatorios");
                    } else {
                        await enviar("Opção inválida, por favor digite uma opção válida.", jid);
                    }
                    break;

                case "duvidas_servicos":
                    await enviar("Recebemos sua dúvida. Para voltar ao menu digite 'menu'.", jid);
                    break;

                case "definir_periodo_inicial":
                    if (msg === "0") {
                        userState.delete(jid + "_data_inicial"); // Limpa o dado temporário
                        await enviar(subMenuRelatorios, jid);
                        userState.set(jid, "relatorios");
                    } else if (regexData.test(msg)) {
                        userState.set(jid + "_data_inicial", msg);
                        userState.set(jid, "definir_periodo_final");
                        await enviar("Agora, qual a data final?\nFormato: dd/mm/aaaa", jid);
                    } else {
                        await enviar("Formato de data inválido. Por favor, envie no formato dd/mm/aaaa.", jid);
                    }
                    break;

                case "definir_periodo_final":
                    if (msg === "0") {
                        userState.delete(jid + "_data_inicial"); // Limpa o dado temporário
                        await enviar(subMenuRelatorios, jid);
                        userState.set(jid, "relatorios");
                    } else if (regexData.test(msg)) {
                        const dataInicial = userState.get(jid + "_data_inicial");
                        userState.delete(jid + "_data_inicial");
                        userState.set(jid, "menu_principal");
                        await enviar(`Período definido de ${dataInicial} a ${msg}.`, jid);
                        // Aqui você pode buscar os dados para o período definido
                    } else {
                        await enviar("Formato de data inválido. Por favor, envie no formato dd/mm/aaaa.", jid);
                    }
                    break;

                default:
                    await enviar(menuPrincipal(nomeContato), jid);
                    userState.set(jid, "menu_principal");
                    break;
            }
        }

        await processarMensagem(jid, textmessage, nomeContato);

    })

    sock.ev.on("creds.update", saveCreds)
}

connectwhatsapp()
