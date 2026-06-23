const fs = require("fs");

const arquivo = "./database/rpg.json";

const itens = {
    1: {
        nome: "Espada de Ferro",
        preco: 100,
        tipo: "ataque",
        valor: 5
    },
    2: {
        nome: "Armadura de Couro",
        preco: 120,
        tipo: "defesa",
        valor: 5
    },
    3: {
        nome: "Cajado Arcano",
        preco: 140,
        tipo: "magia",
        valor: 6
    },
    4: {
        nome: "Poção de Vida",
        preco: 35,
        tipo: "cura",
        valor: 40
    }
};

module.exports.executar = async (sock, msg, args) => {
    const jid = msg.key.remoteJid;
    const user = msg.key.participant || msg.key.remoteJid;

    if (!fs.existsSync(arquivo)) {
        return sock.sendMessage(jid, {
            text: "❌ Você ainda não tem personagem."
        });
    }

    const dados = JSON.parse(fs.readFileSync(arquivo));
    const p = dados[user];

    if (!p) {
        return sock.sendMessage(jid, {
            text: "❌ Você ainda não tem personagem.\n\nUse:\n.criarpersonagem"
        });
    }

    const id = args[0];
    const item = itens[id];

    if (!item) {
        return sock.sendMessage(jid, {
            text: "❌ Item inválido.\n\nUse *.loja* para ver os itens."
        });
    }

    if (p.ouro < item.preco) {
        return sock.sendMessage(jid, {
            text: `❌ Ouro insuficiente.\n\n💰 Você tem: ${p.ouro}\n💸 Precisa: ${item.preco}`
        });
    }

    p.ouro -= item.preco;

    if (!p.inventario) p.inventario = [];

    if (item.tipo === "cura") {
        p.vida += item.valor;
        if (p.vida > p.vidaMax) p.vida = p.vidaMax;

        dados[user] = p;
        fs.writeFileSync(arquivo, JSON.stringify(dados, null, 2));

        return sock.sendMessage(jid, {
            text:
`🧪 *POÇÃO USADA!*

❤️ Vida recuperada: ${item.valor}
❤️ Vida atual: ${p.vida}/${p.vidaMax}

💰 Ouro restante: ${p.ouro}`
        });
    }

    p[item.tipo] += item.valor;
    p.inventario.push(`${item.nome} (+${item.valor} ${item.tipo})`);

    dados[user] = p;
    fs.writeFileSync(arquivo, JSON.stringify(dados, null, 2));

    await sock.sendMessage(jid, {
        text:
`✅ *COMPRA REALIZADA!*

🎁 Item: ${item.nome}
💰 Ouro restante: ${p.ouro}

${item.tipo === "ataque" ? "⚔️" : item.tipo === "defesa" ? "🛡️" : "🔮"} +${item.valor} ${item.tipo}`
    });
};