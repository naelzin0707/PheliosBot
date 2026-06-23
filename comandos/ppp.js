const fs = require("fs");

function limparNumero(id = "") {
    return id
        .replace(/:\d+/g, "")
        .replace("@s.whatsapp.net", "")
        .replace("@lid", "")
        .replace("@g.us", "");
}

function sortearParticipante(participantes, botId, autor) {
    const filtrados = participantes.filter(p => {
        const id = p.id;
        if (!id) return false;
        if (id === botId) return false;
        if (id === autor) return false;
        return true;
    });

    return filtrados[Math.floor(Math.random() * filtrados.length)]?.id;
}

module.exports.executar = async (sock, msg) => {
    const jid = msg.key.remoteJid;

    if (!jid.endsWith("@g.us")) {
        return sock.sendMessage(jid, {
            text: "❌ Esse comando só funciona em grupos."
        });
    }

    try {
        const metadata = await sock.groupMetadata(jid);
        const participantes = metadata.participants;

        const autor = msg.key.participant || msg.key.remoteJid;
        const ctx = msg.message?.extendedTextMessage?.contextInfo;

        const botId = sock.user.id.split(":")[0] + "@s.whatsapp.net";

        let alvo =
            ctx?.mentionedJid?.[0] ||
            ctx?.participant ||
            sortearParticipante(participantes, botId, autor);

        if (!alvo) {
            return sock.sendMessage(jid, {
                text: "❌ Não consegui sortear ninguém."
            });
        }

        const numeroAlvo = limparNumero(alvo);

        let fotoPerfil;

        try {
            fotoPerfil = await sock.profilePictureUrl(alvo, "image");
        } catch {
            fotoPerfil = null;
        }

        const legenda =
`╭━━━〔 💘 *PPP* 〕━━━╮
┃ Pessoa sorteada:
┃ @${numeroAlvo}
┃
┃ Agora o grupo decide:
┃ *Pego, penso ou passo?*
╰━━━━━━━━━━━━━━━━╯`;

        if (fotoPerfil) {
            await sock.sendMessage(jid, {
                image: { url: fotoPerfil },
                caption: legenda,
                mentions: [alvo]
            });
        } else {
            await sock.sendMessage(jid, {
                text: legenda,
                mentions: [alvo]
            });
        }

        await sock.sendMessage(jid, {
            poll: {
                name: `💘 PPP de @${numeroAlvo}`,
                values: [
                    "😈 Pego",
                    "🤔 Penso",
                    "💀 Passo"
                ],
                selectableCount: 1
            }
        });

    } catch (erro) {
        console.error("ERRO PPP:", erro);

        await sock.sendMessage(jid, {
            text: "❌ Deu erro no PPP."
        });
    }
};