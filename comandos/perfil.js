const fs = require("fs");

const arquivo = "./database/rpg.json";

module.exports.executar = async (sock, msg) => {

    const jid = msg.key.remoteJid;
    const user = msg.key.participant || msg.key.remoteJid;

    if (!fs.existsSync(arquivo)) {

        return sock.sendMessage(jid, {
            text: "❌ Nenhum personagem criado."
        });
    }

    const dados =
        JSON.parse(fs.readFileSync(arquivo));

    const p = dados[user];

    if (!p) {

        return sock.sendMessage(jid, {
            text:
`❌ Você ainda não tem personagem.

Use:
.criarpersonagem`
        });
    }

    await sock.sendMessage(jid, {

        text:
`🎲 PERFIL RPG

🏷️ Classe: ${p.classe}
⭐ Nível: ${p.nivel}
📚 XP: ${p.xp}

❤️ Vida: ${p.vida}/${p.vidaMax}

⚔️ Ataque: ${p.ataque}
🛡️ Defesa: ${p.defesa}
🔮 Magia: ${p.magia}

💰 Ouro: ${p.ouro}

🎒 Itens:
${p.inventario.length || 0}`
    });
};