const config = require("../config");

module.exports.executar = async (sock, msg) => {
    await sock.sendMessage(msg.key.remoteJid, {
        text:
`🏳️‍🌈 *${config.nomeBot}*

✨ Status: online e servindo presença
👑 Criado por: ${config.dono}
📦 Versão: ${config.versao}
💻 Base: Node.js + Baileys

Um bot feito pra comandos, figurinhas, moderação e um pouco de viadagem tecnológica.`
    });
};