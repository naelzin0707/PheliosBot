const fs = require("fs");
const { carregar, salvar } = require("../utils/casais");

module.exports.executar = async (sock, msg) => {
    const jid = msg.key.remoteJid;
    const user = msg.key.participant || msg.key.remoteJid;

    const dados = carregar();
    const grupo = dados[jid];

    if (!grupo?.pendentes?.[user]) {
        return sock.sendMessage(jid, { text: "❌ Você não tem nenhum pedido pendente." });
    }

    const pedido = grupo.pendentes[user];
    delete grupo.pendentes[user];

    const relacao = {
        parceiro: pedido.autor,
        tipo: pedido.tipo,
        inicio: Date.now()
    };

    grupo.casais[pedido.autor] = { parceiro: user, tipo: pedido.tipo, inicio: relacao.inicio };
    grupo.casais[user] = relacao;

    salvar(dados);

    const nomeTipo = pedido.tipo === "casamento" ? "casados" : "namorando";

    const texto =
`🌈💖 *PEDIDO ACEITO!* 💖🌈

@${pedido.autor.split("@")[0]} e @${user.split("@")[0]} agora estão *${nomeTipo}*!

Que esse casal brilhe mais que glitter em ventilador. ✨`;

    if (fs.existsSync("./midia/aceito.jpg")) {
        return sock.sendMessage(jid, {
            image: fs.readFileSync("./midia/aceito.jpg"),
            caption: texto,
            mentions: [pedido.autor, user]
        });
    }

    await sock.sendMessage(jid, { text: texto, mentions: [pedido.autor, user] });
};