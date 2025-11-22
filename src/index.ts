import "dotenv/config";
import makeWASocket, { DisconnectReason, useMultiFileAuthState } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import qrcode from "qrcode-terminal";
import { pino } from "pino";

// IMPORTANTE: Importamos a lógica do arquivo vizinho
import { processarMensagem } from "./processarMensagens";

async function connectwhatsapp() {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

    const sock = makeWASocket({
        printQRInTerminal: false,
        auth: state,
        logger: pino({ level: "silent" })
    });

    // ===================================================================
    //      ARMAZENAMENTO DE ESTADO (MEMÓRIA DO BOT)
    // ===================================================================
    const userState = new Map<string, string>();

    // --- Monitoramento da Conexão ---
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

    // --- Recebimento de Mensagens ---
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];

        if (!msg.message || msg.key.fromMe) return;

        const jid = msg.key.remoteJid!;

        if (jid.endsWith('@g.us')) return;

        const nomeContato = msg.pushName || "Cliente";

        let textmessage = "";
        if (msg.message.conversation) {
            textmessage = msg.message.conversation;
        } else if (msg.message.extendedTextMessage?.text) {
            textmessage = msg.message.extendedTextMessage.text;
        } else {
            return;
        }

        const enviar = async (texto: string, idDestino: string) => {
            return await sock.sendMessage(idDestino, { text: texto }, { quoted: msg });
        };

        try {
            await processarMensagem(
                jid,           
                textmessage,   
                nomeContato,   
                userState,     
                enviar         
            );
        } catch (error) {
            console.error("Erro CRÍTICO ao processar mensagem:", error);
            // NOVO: Envia desculpas se o código quebrar totalmente
            await enviar("Desculpe, ocorreu um erro inesperado no sistema. 😔\nPor favor, envie outra mensagem para tentarmos novamente.", jid);
            userState.delete(jid); // Reseta o usuário
        }
    });

    sock.ev.on("creds.update", saveCreds);
}

connectwhatsapp();