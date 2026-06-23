const fs = require("fs");

const arquivo = "./database/rpg.json";

function carregar() {
    if (!fs.existsSync(arquivo)) {
        fs.writeFileSync(arquivo, JSON.stringify({}, null, 2));
    }

    return JSON.parse(fs.readFileSync(arquivo));
}

function salvar(dados) {
    fs.writeFileSync(arquivo, JSON.stringify(dados, null, 2));
}

const monstros = [
    { nome: "Slime Rosa", dificuldade: 6, xp: 15, ouro: 8, dano: 5 },
    { nome: "Goblin Safado", dificuldade: 9, xp: 25, ouro: 14, dano: 9 },
    { nome: "Lobo Sombrio", dificuldade: 12, xp: 35, ouro: 20, dano: 14 },
    { nome: "Bruxa Lunar", dificuldade: 15, xp: 50, ouro: 30, dano: 20 },
    { nome: "Dragão Glitterizado", dificuldade: 18, xp: 90, ouro: 60, dano: 35 }
];

function xpParaUpar(nivel) {
    return nivel * 100;
}

module.exports.executar = async (sock, msg) => {
    const jid = msg.key.remoteJid;
    const user = msg.key.participant || msg.key.remoteJid;

    const dados = carregar();
    const p = dados[user];

    if (!p) {
        return sock.sendMessage(jid, {
            text: "❌ Você ainda não tem personagem.\n\nUse:\n.criarpersonagem guerreiro"
        });
    }

    if (p.vida <= 0) {
        return sock.sendMessage(jid, {
            text: "💀 Você está sem vida.\n\nUse:\n.descansar"
        });
    }

    const monstro = monstros[Math.floor(Math.random() * monstros.length)];
    const dado = Math.floor(Math.random() * 20) + 1;

    const poder =
        dado +
        Math.floor((p.ataque + p.magia) / 4);

    let texto = "";

    if (dado === 20 || poder >= monstro.dificuldade) {
        p.xp += monstro.xp;
        p.ouro += monstro.ouro;

        texto =
`⚔️ *CAÇADA RPG*

@${user.split("@")[0]} encontrou:

👹 *${monstro.nome}*

🎲 D20: ${dado}
⚡ Poder total: ${poder}
🎯 Dificuldade: ${monstro.dificuldade}

✅ Vitória!

📚 XP ganho: ${monstro.xp}
💰 Ouro ganho: ${monstro.ouro}`;

        let upou = false;

        while (p.xp >= xpParaUpar(p.nivel)) {
            p.xp -= xpParaUpar(p.nivel);
            p.nivel += 1;
            p.vidaMax += 10;
            p.vida = p.vidaMax;
            p.ataque += 2;
            p.defesa += 1;
            p.magia += 1;
            upou = true;
        }

        if (upou) {
            texto +=
`

🌟 *LEVEL UP!*
Agora você está no nível ${p.nivel}!

❤️ Vida máxima +10
⚔️ Ataque +2
🛡️ Defesa +1
🔮 Magia +1`;
        }

    } else {
        const danoFinal = Math.max(1, monstro.dano - p.defesa);

        p.vida -= danoFinal;
        if (p.vida < 0) p.vida = 0;

        texto =
`⚔️ *CAÇADA RPG*

@${user.split("@")[0]} encontrou:

👹 *${monstro.nome}*

🎲 D20: ${dado}
⚡ Poder total: ${poder}
🎯 Dificuldade: ${monstro.dificuldade}

❌ Derrota!

💥 Dano recebido: ${danoFinal}
❤️ Vida atual: ${p.vida}/${p.vidaMax}`;

        if (p.vida <= 0) {
            texto += `\n\n💀 Você caiu em combate. Use *.descansar* para recuperar.`;
        }
    }

    dados[user] = p;
    salvar(dados);

    await sock.sendMessage(jid, {
        text: texto,
        mentions: [user]
    });
};