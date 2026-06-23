const { carregar, salvar, tabuleiroTexto } = require("../utils/velha");

module.exports.executar = async (sock, msg) => {
    const jid = msg.key.remoteJid;
    const user = msg.key.participant;

    const dados = carregar();

    if (!dados[jid]?.pendente) {
        return sock.sendMessage(jid, {
            text: "❌ Não tem convite de jogo pendente."
        });
    }

    const convite = dados[jid].pendente;

    if (convite.desafiado !== user) {
        return sock.sendMessage(jid, {
            text: "❌ Esse convite não é pra você, fofoqueiro. 👀"
        });
    }

    dados[jid].jogo = {
        jogadorX: convite.desafiante,
        jogadorO: convite.desafiado,
        vez: convite.desafiante,
        tabuleiro: [
            "1️⃣", "2️⃣", "3️⃣",
            "4️⃣", "5️⃣", "6️⃣",
            "7️⃣", "8️⃣", "9️⃣"
        ]
    };

    dados[jid].pendente = null;

    salvar(dados);

    await sock.sendMessage(jid, {
        text:
`🎮 *JOGO DA VELHA COMEÇOU!*

❌ @${convite.desafiante.split("@")[0]}
⭕ @${convite.desafiado.split("@")[0]}

${tabuleiroTexto(dados[jid].jogo.tabuleiro)}

Vez de:
@${convite.desafiante.split("@")[0]}

Envie apenas um número de 1 a 9.`,
        mentions: [convite.desafiante, convite.desafiado]
    });
};