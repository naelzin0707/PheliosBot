const fs = require("fs");

module.exports.executar = async (sock, msg) => {

    const jid = msg.key.remoteJid;
    const user = msg.key.participant || msg.key.remoteJid;

    const dados = JSON.parse(
        fs.readFileSync("./database/rpg.json")
    );

    const p = dados[user];

    if (!p) {
        return sock.sendMessage(jid, {
            text: "❌ Você não possui personagem."
        });
    }

    let itens = "Nenhum item.";

    if (p.inventario.length > 0) {
        itens = p.inventario.map(i => `• ${i}`).join("\n");
    }

    await sock.sendMessage(jid, {
        text:
`🎒 INVENTÁRIO

${itens}

💰 Ouro: ${p.ouro}`
    });
};