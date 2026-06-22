const fs = require("fs");
const { carregar, tempoDesde } = require("../utils/casais");

module.exports.executar = async (sock, msg) => {
    const jid = msg.key.remoteJid;
    const user = msg.key.participant || msg.key.remoteJid;

    const dados = carregar();
    const relacao = dados[jid]?.casais?.[user];

    if (!relacao) {
        return sock.sendMessage(jid, {
            text: "💔 Você ainda não tem amor registrado aqui."
        });
    }

    const tipo = relacao.tipo === "casamento" ? "casado(a)" : "namorando";

    const texto =
`💖 *MEU AMOR*

Você está *${tipo}* com @${relacao.parceiro.split("@")[0]}.

⏳ Tempo juntos:
${tempoDesde(relacao.inicio)}

🌈 Casal registrado oficialmente pelo cartório do PheliosBot.`;

    if (fs.existsSync("./midia/meuamor.jpg")) {
        return sock.sendMessage(jid, {
            image: fs.readFileSync("./midia/meuamor.jpg"),
            caption: texto,
            mentions: [relacao.parceiro]
        });
    }

    await sock.sendMessage(jid, {
        text: texto,
        mentions: [relacao.parceiro]
    });
};