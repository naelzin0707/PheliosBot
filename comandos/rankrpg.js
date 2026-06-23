const fs = require("fs");

module.exports.executar = async (sock, msg) => {
    const jid = msg.key.remoteJid;

    if (!fs.existsSync("./database/rpg.json")) {
        return sock.sendMessage(jid, {
            text: "❌ Nenhum personagem criado ainda."
        });
    }

    const dados = JSON.parse(fs.readFileSync("./database/rpg.json"));

    const jogadores = Object.entries(dados)
        .filter(([_, p]) => p && p.nivel)
        .sort((a, b) => {
            if (b[1].nivel !== a[1].nivel) return b[1].nivel - a[1].nivel;
            return b[1].xp - a[1].xp;
        })
        .slice(0, 10);

    if (!jogadores.length) {
        return sock.sendMessage(jid, {
            text: "❌ Ainda não tem ninguém no ranking."
        });
    }

    let texto = "🏆 *RANK RPG*\n\n";
    const mentions = [];

    jogadores.forEach(([user, p], i) => {
        const medalha = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}️⃣`;
        texto += `${medalha} @${user.split("@")[0]}\n`;
        texto += `┃ Classe: ${p.classe}\n`;
        texto += `┃ Nível: ${p.nivel} | XP: ${p.xp}\n\n`;
        mentions.push(user);
    });

    await sock.sendMessage(jid, {
        text: texto,
        mentions
    });
};