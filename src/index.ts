import makeWASocket, {DisconnectReason, useMultiFileAuthState} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import qrcode from "qrcode-terminal"
import pino = require("pino");

async function connectwhatsapp(){
    const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");
    
    const sock = makeWASocket({
        printQRInTerminal : false,
        auth: state,
        logger: pino({ level: "silent"})
    })

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

    sock.ev.on("messages.upsert", async({messages}) => {
        const msg = messages[0]
        if(!msg.message || msg.key.fromMe) return
        const Jid = msg.key.remoteJid!

        let textmessage = ""
        if (msg.message.conversation) {
        textmessage = msg.message.conversation;
        } else if (msg.message.extendedTextMessage?.text) {
        textmessage = msg.message.extendedTextMessage.text;
        } else if (msg.message.imageMessage) {
        textmessage = "[Imagem recebida]"
        } else if (msg.message.videoMessage) {
        textmessage = "[Video recebido]"
        } else if (msg.message.stickerMessage) {
        textmessage = "[Sticker recebido]"
        }
        if (textmessage == "-Ola"){
            await sock.sendMessage(Jid, {text:"Olá eu sou o bot do Squad09"})
        }

        console.log(msg)

    })

    sock.ev.on("creds.update", saveCreds)
}
connectwhatsapp()