const { carregar, salvar, tabuleiroTexto } = require("../utils/velha");

module.exports.executar = async (sock, msg) => {
    const jid = msg.key.remoteJid;

    if (!jid.endsWith("@g.us")) {
        return sock.sendMessage(jid, {
            text: "❌ Esse comando só funciona em grupos."
        });
    }

    const autor = msg.key.participant;
    const ctx = msg.message?.extendedTextMessage?.contextInfo;
    const alvo = ctx?.mentionedJid?.[0] || ctx?.participant;

    if (!alvo) {
        return sock.sendMessage(jid, {
            text: "🎮 Use assim:\n\n.velha @pessoa"
        });
    }

    if (alvo === autor) {
        return sock.sendMessage(jid, {
            text: "❌ Chama alguém, jogar sozinho é triste demais."
        });
    }

    const dados = carregar();

    if (!dados[jid]) {
        dados[jid] = {
            pendente: null,
            jogo: null
        };
    }

    if (dados[jid].jogo) {
        return sock.sendMessage(jid, {
            text: "❌ Já tem um jogo da velha rolando nesse grupo."
        });
    }

    dados[jid].pendente = {
        desafiante: autor,
        desafiado: alvo,
        criadoEm: Date.now()
    };

    salvar(dados);

    await sock.sendMessage(jid, {
        text:
`🎮 *JOGO DA VELHA*

@${autor.split("@")[0]} desafiou @${alvo.split("@")[0]}!

@${alvo.split("@")[0]}, responda:

✅ *.aceitarvelha*
❌ *.recusarvelha*`,
        mentions: [autor, alvo]
    });
};