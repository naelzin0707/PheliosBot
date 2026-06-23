module.exports.executar = async (sock, msg, args) => {
    const jid = msg.key.remoteJid;

    if (!jid.endsWith("@g.us")) {
        return sock.sendMessage(jid, {
            text: "❌ Esse comando só funciona em grupos."
        });
    }

    try {
        const metadata = await sock.groupMetadata(jid);
        const participantes = metadata.participants;

        const mentions = participantes
            .map(p => p.id)
            .filter(Boolean);

        const mensagem = args.join(" ") || "Chamando geral!";

        let texto = `📢 *MARCAÇÃO GERAL*\n\n${mensagem}\n\n`;

        for (const participante of mentions) {
            const numero = participante.split("@")[0];
            texto += `@${numero}\n`;
        }

        await sock.sendMessage(jid, {
            text: texto,
            mentions
        });

    } catch (erro) {
        console.error("ERRO MARCAR:", erro);

        await sock.sendMessage(jid, {
            text: "❌ Não consegui marcar geral."
        });
    }
};