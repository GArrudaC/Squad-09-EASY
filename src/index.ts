import "dotenv/config";
import makeWASocket, { DisconnectReason, useMultiFileAuthState } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import qrcode from "qrcode-terminal";
import { pino } from "pino";

// Importamos a lógica do menu
import { processarMensagem } from "./processarMensagens";
// Importamos o serviço de autenticação (NOVO)
import { autenticarUsuario } from "./functions/authService";

async function connectwhatsapp() {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

    const sock = makeWASocket({
        printQRInTerminal: false,
        auth: state,
        logger: pino({ level: "silent" })
    });

    const userState = new Map<string, string>();

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (connection === "close" && lastDisconnect) {
            const shouldreconnect = (lastDisconnect.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log("Conexão falhou", lastDisconnect.error, "Tentando reconectar", shouldreconnect);
            if (shouldreconnect) {
                connectwhatsapp();
            }
        } else if (connection === "open") {
            console.log("✅ Conexão bem sucedida! O Bot está online.");
        }

        if (qr) {
            qrcode.generate(qr, { small: true });
        }
    });

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];

        if (!msg.message || msg.key.fromMe) return;

        const jid = msg.key.remoteJid!;

        if (jid.endsWith('@g.us')) return;

        // ============================================================
        // 🛡️ ÁREA DE SEGURANÇA (AUTENTICAÇÃO)
        // ============================================================
        
        // Verifica no banco se esse número tem permissão
        const usuario = await autenticarUsuario(jid);

        const enviar = async (texto: string, idDestino: string) => {
            return await sock.sendMessage(idDestino, { text: texto }, { quoted: msg });
        };

        // Se usuario for null, ele não está no banco.
        if (!usuario) {
            console.log(`🚫 Acesso negado para: ${jid}`);
            // Opcional: Avisar que ele não tem cadastro ou apenas ignorar.
            // Vou deixar avisando para teste, depois você pode comentar essa linha.
            await enviar("🚫 *Acesso Negado.*\nSeu número não está cadastrado em nosso sistema.", jid);
            return; // PARA AQUI. Não executa o resto.
        }

        // Se chegou aqui, está logado!
        // Podemos usar o nome real do banco de dados agora!
        const nomeReal = usuario.nome; 
        console.log(`✅ Mensagem de: ${nomeReal} (${usuario.nome_empresa})`);

        // ============================================================

        let textmessage = "";
        if (msg.message.conversation) {
            textmessage = msg.message.conversation;
        } else if (msg.message.extendedTextMessage?.text) {
            textmessage = msg.message.extendedTextMessage.text;
        } else {
            return;
        }

        try {
            await processarMensagem(
                jid,           
                textmessage,   
                nomeReal,      // Passamos o nome do banco em vez do nome do WhatsApp
                userState,     
                enviar         
            );
        } catch (error) {
            console.error("Erro CRÍTICO ao processar mensagem:", error);
            await enviar("Desculpe, ocorreu um erro inesperado no sistema. 😔", jid);
            userState.delete(jid);
        }
    });

    sock.ev.on("creds.update", saveCreds);
}

connectwhatsapp();