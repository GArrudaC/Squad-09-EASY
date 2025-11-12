import makeWASocket, {DisconnectReason, useMultiFileAuthState} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import qrcode from "qrcode-terminal"
import { pino } from "pino";
import moment, { Moment } from "moment-timezone";

async function connectwhatsapp(){
    const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");
    
    const sock = makeWASocket({
        printQRInTerminal : false,
        auth: state,
        logger: pino({ level: "silent"})
    })

    // ===================================================================
    //      ARMAZENAMENTO DE ESTADO DO USUÁRIO
    // ===================================================================
    // Este Map vai guardar o "estágio" da conversa de cada usuário
    // Ex: userState.set("id_do_usuario", "aguardando_opcao_menu")
    const userState = new Map();

    /// teste de conexão
    sock.ev.on("connection.update", (update) => {
        const {connection, lastDisconnect} = update
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

        if(update.qr){
            qrcode.generate(update.qr, {small:true})
        }
    })

    sock.ev.on("messages.upsert", async({ messages }) => {
        const msg = messages[0]
        if(!msg.message || msg.key.fromMe) return

        const jid = msg.key.remoteJid!

        if (jid.endsWith('@g.us')) {
            return // Ignora mensagens de grupo
        }

        const nomeContato = msg.pushName || "Desconhecido" //pegar o nome que a pessoa cadastrou no zap
        const numero = jid.split("@")[0] // pegar o numero da msg

        // usando lib pra puxar data;hora bonitinho
        const hora = moment.tz("America/Sao_Paulo").format("HH:mm:ss")
        const data = moment.tz("America/Sao_Paulo").format("DD/MM/YY")

        let textmessage = ""
        if (msg.message.conversation) {
        textmessage = msg.message.conversation;
        } else if (msg.message.extendedTextMessage?.text) {
        textmessage = msg.message.extendedTextMessage.text
        } else if (msg.message.imageMessage) {
        textmessage = "[Imagem recebida]"
        } else if (msg.message.videoMessage) {
        textmessage = "[Video recebido]"
        } else if (msg.message.stickerMessage) {
        textmessage = "[Sticker recebido]"
        }

        //logs de mensagem
        console.log(
            '\n','Número:', numero,
            '\n', 'Nome:', nomeContato,
            '\n', 'Texto:',textmessage,
            '\n', 'Hora:',hora,
            '\n', 'Data:',data
        )


        const enviar = (texto: any, jid: string) => {
            sock.sendMessage(jid, {text: texto}, { quoted:msg })
        }

        // 1. Defina seu menu
        const menu = `👋 Olá, ${nomeContato}! Eu sou o atendente virtual do Squad 09.
        \nAqui estão as opções disponíveis:
        
        \n*1.* Opção A (Ex: Ver produtos)\n*2.* Opção B (Ex: Falar com suporte)\n*3.* Opção C (Ex: Nossos horários)
        
        \nPor favor, envie o número da opção desejada.\nCaso deseje retornar ao menu principal digite "menu" a qualquer momento!`;

        // 2. Normalize a mensagem
        const msgUsuario = textmessage.toLowerCase().trim();

        // 3. Pegue o estado atual do usuário
        const estadoAtual = userState.get(jid);

        // 4. Crie uma "Saída de emergência" - se o usuário digitar "menu"
        // ele sempre volta ao menu, não importa onde esteja.
        if (msgUsuario === "menu") {
            await enviar(menu, jid);
            userState.set(jid, 'aguardando_opcao'); // Define o estado
            return; // Encerra o processamento aqui
        }

        // 5. Lógica Principal
        if (estadoAtual === 'aguardando_opcao') {
            // O usuário JÁ VIU o menu. Ele está respondendo. (REQUISITO 2)
            
            switch (msgUsuario) {
                case "1":
                    await enviar("Você escolheu a *Opção 1*!", jid);
                    userState.delete(jid); // Limpa o estado (conversa concluída)
                    break;
                
                case "2":
                    await enviar("Você escolheu a *Opção 2*!", jid);
                    userState.delete(jid); // Limpa o estado
                    break;

                case "3":
                    await enviar("Você escolheu a *Opção 3*!", jid);
                    userState.delete(jid); // Limpa o estado
                    break;
                
                case "-testebot":
                    await enviar("Testando...", jid);
                    // Não mexe no estado, continua aguardando opção
                    break;

                default:
                    // O usuário viu o menu, mas digitou algo inválido
                    if (msgUsuario.startsWith("[")) { return; } // Ignora imagem/sticker
                    
                    await enviar("Opção inválida, tente novamente.", jid);
                    // IMPORTANTE: Não limpamos o estado. Ele continua 'aguardando_opcao'.
                    break;
            }
        } else {
            
            if (msgUsuario.startsWith("[")) { return; } // Ignora se a primeira msg for imagem
            // Responde com o menu para QUALQUER coisa que ele disser
            await enviar(menu, jid);
            userState.set(jid, 'aguardando_opcao'); // Define o estado
        }
    })

    sock.ev.on("creds.update", saveCreds)
}
connectwhatsapp()