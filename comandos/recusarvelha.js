const { carregar, salvar } = require("../utils/velha");

module.exports.executar = async (sock, msg) => {
    const jid = msg.key.remoteJid;
    const user = msg.key.participant;

    const dados = carregar();

    if (!dados[jid]?.pendente) {
        return sock.sendMessage(jid, { text: "❌ Não tem convite pendente." });
    }

    const convite = dados[jid].pendente;

    if (convite.desafiado !== user) {
        return sock.sendMessage(jid, {
            text: "❌ Esse convite não é seu."
        });
    }

    dados[jid].pendente = null;
    salvar(dados);

    await sock.sendMessage(jid, {
        text:
`💔 @${user.split("@")[0]} recusou o jogo da velha.

O tabuleiro chorou em silêncio.`,
        mentions: [user]
    });
};