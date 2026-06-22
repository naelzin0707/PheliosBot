function limparNumero(id = "") {
    return id
        .replace(/:\d+/g, "")
        .replace("@s.whatsapp.net", "")
        .replace("@lid", "")
        .replace("@g.us", "");
}

function ehAdmin(p) {
    return p?.admin === "admin" || p?.admin === "superadmin";
}

module.exports.executar = async (sock, msg) => {
    const jid = msg.key.remoteJid;

    if (!jid.endsWith("@g.us")) {
        return sock.sendMessage(jid, {
            text: "❌ Esse comando só funciona em grupo."
        });
    }

    try {
        const metadata = await sock.groupMetadata(jid);
        const participantes = metadata.participants;

        const sender = msg.key.participant;
        const senderNumero = limparNumero(sender);

        const user = participantes.find(p =>
            limparNumero(p.id) === senderNumero ||
            limparNumero(p.phoneNumber) === senderNumero
        );

        if (!ehAdmin(user)) {
            return sock.sendMessage(jid, {
                text: "❌ Só admin pode remover admin."
            });
        }

        const ctx = msg.message?.extendedTextMessage?.contextInfo;

        const alvoRaw =
            ctx?.mentionedJid?.[0] ||
            ctx?.participant;

        if (!alvoRaw) {
            return sock.sendMessage(jid, {
                text: "❌ Marque alguém ou responda a mensagem da pessoa.\n\nExemplo: *.demote @pessoa*"
            });
        }

        const alvoNumero = limparNumero(alvoRaw);

        const alvo = participantes.find(p =>
            limparNumero(p.id) === alvoNumero ||
            limparNumero(p.phoneNumber) === alvoNumero ||
            p.id === alvoRaw
        );

        if (!alvo) {
            return sock.sendMessage(jid, {
                text: "❌ Não achei essa pessoa no grupo."
            });
        }

        await sock.groupParticipantsUpdate(jid, [alvo.id], "demote");

        await sock.sendMessage(jid, {
            text: "🧹 Admin removido com sucesso."
        });

    } catch (erro) {
        console.error("ERRO DEMOTE:", erro);

        await sock.sendMessage(jid, {
            text: "❌ Não consegui remover admin. Confere se o bot é admin."
        });
    }
};