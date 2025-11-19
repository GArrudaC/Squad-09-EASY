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

        // 1. Filtro de Grupos (Ignora mensagens vindas de grupos)
        if (jid.endsWith('@g.us')) return;

        const nomeContato = msg.pushName || "Cliente";

        // 2. Extração do Texto da Mensagem
        let textmessage = "";
        if (msg.message.conversation) {
            textmessage = msg.message.conversation;
        } else if (msg.message.extendedTextMessage?.text) {
            textmessage = msg.message.extendedTextMessage.text;
        } else {
            // Ignora áudios, stickers, etc. por enquanto
            return;
        }

        // 3. Função Auxiliar 'Enviar'
        // Criamos ela aqui porque só o 'sock' sabe enviar mensagens, 
        // mas passamos ela para o outro arquivo usar.
        const enviar = async (texto: string, idDestino: string) => {
            return await sock.sendMessage(idDestino, { text: texto }, { quoted: msg });
        };

        // 4. Injeção de Dependência
        // Passamos tudo que o arquivo de lógica precisa para trabalhar
        try {
            await processarMensagem(
                jid,            // Quem mandou
                textmessage,    // O que mandou
                nomeContato,    // Nome da pessoa
                userState,      // A memória do bot
                enviar          // A ferramenta para responder
            );
        } catch (error) {
            console.error("Erro ao processar mensagem:", error);
        }
    });

    // --- Atualização de Credenciais ---
    sock.ev.on("creds.update", saveCreds);
}

connectwhatsapp();