const { carregar, salvar } = require("../utils/casais");

module.exports.executar = async (sock, msg) => {
    const jid = msg.key.remoteJid;
    const user = msg.key.participant || msg.key.remoteJid;

    const dados = carregar();
    const grupo = dados[jid];

    if (!grupo?.pendentes?.[user]) {
        return sock.sendMessage(jid, { text: "❌ Você não tem pedido pendente." });
    }

    const pedido = grupo.pendentes[user];
    delete grupo.pendentes[user];
    salvar(dados);

    await sock.sendMessage(jid, {
        text: `💔 @${user.split("@")[0]} recusou o pedido de @${pedido.autor.split("@")[0]}.\n\nA novela foi cancelada no episódio piloto.`,
        mentions: [user, pedido.autor]
    });
};