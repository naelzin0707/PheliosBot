const fs = require("fs");

const arquivo = "./database/rpg.json";

module.exports.executar = async (sock, msg) => {
    const jid = msg.key.remoteJid;
    const user = msg.key.participant || msg.key.remoteJid;

    if (!fs.existsSync(arquivo)) {
        return sock.sendMessage(jid, {
            text: "❌ Nenhum personagem encontrado."
        });
    }

    const dados = JSON.parse(fs.readFileSync(arquivo));
    const p = dados[user];

    if (!p) {
        return sock.sendMessage(jid, {
            text: "❌ Você ainda não tem personagem.\n\nUse:\n.criarpersonagem"
        });
    }

    p.vida = p.vidaMax;
    dados[user] = p;

    fs.writeFileSync(arquivo, JSON.stringify(dados, null, 2));

    await sock.sendMessage(jid, {
        text:
`🛌 *DESCANSO COMPLETO*

@${user.split("@")[0]} descansou e recuperou toda a vida.

❤️ Vida: ${p.vida}/${p.vidaMax}`,
        mentions: [user]
    });
};