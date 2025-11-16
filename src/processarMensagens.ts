sock.ev.on("messages.upsert", async({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const jid = msg.key.remoteJid!;
    const nomeContato = msg.pushName || "Desconhecido";
    let texto = ""; // extrair texto da mensagem conforme seu código atual

    if (msg.message.conversation) {
        texto = msg.message.conversation;
    } else if (msg.message.extendedTextMessage?.text) {
        texto = msg.message.extendedTextMessage.text;
    } else {
        return; // ignora outros tipos para este exemplo
    }

    const enviar = (texto, jid) => sock.sendMessage(jid, { text: texto }, { quoted: msg });

    await processarMensagem(jid, texto, nomeContato, userState, enviar);
});
