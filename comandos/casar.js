const fs = require("fs");
const { carregar, salvar } = require("../utils/casais");

module.exports.executar = async (sock, msg) => {
    const jid = msg.key.remoteJid;
    const autor = msg.key.participant || msg.key.remoteJid;
    const ctx = msg.message?.extendedTextMessage?.contextInfo;
    const alvo = ctx?.mentionedJid?.[0] || ctx?.participant;

    if (!jid.endsWith("@g.us")) return sock.sendMessage(jid, { text: "❌ Só funciona em grupo." });
    if (!alvo) return sock.sendMessage(jid, { text: "💍 Use: *.casar @pessoa*" });
    if (alvo === autor) return sock.sendMessage(jid, { text: "❌ Casamento solo ainda não foi aprovado pelo cartório gay. 💅" });

    const dados = carregar();
    if (!dados[jid]) dados[jid] = { pendentes: {}, casais: {} };

    dados[jid].pendentes[alvo] = { autor, alvo, tipo: "casamento", criadoEm: Date.now() };
    salvar(dados);

    const texto =
`💍 *PEDIDO DE CASAMENTO* 💍

@${autor.split("@")[0]} pediu @${alvo.split("@")[0]} em casamento!

🌈 Responda com:
*.aceitar* ou *.recusar*`;

    if (fs.existsSync("./midia/pedido.jpg")) {
        return sock.sendMessage(jid, {
            image: fs.readFileSync("./midia/pedido.jpg"),
            caption: texto,
            mentions: [autor, alvo]
        });
    }

    await sock.sendMessage(jid, { text: texto, mentions: [autor, alvo] });
};