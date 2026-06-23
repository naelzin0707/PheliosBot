module.exports.executar = async (sock, msg) => {
    const jid = msg.key.remoteJid;

    if (!jid.endsWith("@g.us")) {
        return sock.sendMessage(jid, {
            text: "❌ Esse comando só funciona em grupos."
        });
    }

    try {
        const ctx = msg.message?.extendedTextMessage?.contextInfo;

        if (!ctx?.stanzaId) {
            return sock.sendMessage(jid, {
                text: "❌ Responda a mensagem que você quer apagar com *.d*"
            });
        }

        const participante =
            ctx.participant ||
            ctx.remoteJid ||
            msg.key.participant;

        console.log("🗑️ DELETE:", {
            jid,
            stanzaId: ctx.stanzaId,
            participante
        });

        await sock.sendMessage(jid, {
            delete: {
                remoteJid: jid,
                fromMe: false,
                id: ctx.stanzaId,
                participant: participante
            }
        });

        await sock.sendMessage(jid, {
            delete: msg.key
        });

    } catch (erro) {
        console.error("ERRO DELETE:", erro);

        await sock.sendMessage(jid, {
            text: "❌ Não consegui apagar. Eu preciso ser admin e a mensagem precisa ser recente."
        });
    }
};