const fs = require("fs");
const { carregar, salvar } = require("../utils/casais");

module.exports.executar = async (sock, msg) => {
    const jid = msg.key.remoteJid;
    const autor = msg.key.participant || msg.key.remoteJid;
    const ctx = msg.message?.extendedTextMessage?.contextInfo;
    const alvo = ctx?.mentionedJid?.[0] || ctx?.participant;

    if (!jid.endsWith("@g.us")) return sock.sendMessage(jid, { text: "❌ Só funciona em grupo." });
    if (!alvo) return sock.sendMessage(jid, { text: "💖 Use: *.namorar @pessoa*" });
    if (alvo === autor) return sock.sendMessage(jid, { text: "❌ Se namorar sozinho é terapia, amor. 🌈" });

    const dados = carregar();
    if (!dados[jid]) dados[jid] = { pendentes: {}, casais: {} };

    dados[jid].pendentes[alvo] = { autor, alvo, tipo: "namoro", criadoEm: Date.now() };
    salvar(dados);

    const texto =
`💖 *PEDIDO DE NAMORO* 💖

@${autor.split("@")[0]} está pedindo @${alvo.split("@")[0]} em namoro!

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