const fs = require("fs");

const arquivo = "./database/rpg.json";

function carregar() {
    if (!fs.existsSync("./database")) {
        fs.mkdirSync("./database");
    }

    if (!fs.existsSync(arquivo)) {
        fs.writeFileSync(arquivo, JSON.stringify({}, null, 2));
    }

    return JSON.parse(fs.readFileSync(arquivo));
}

function salvar(dados) {
    fs.writeFileSync(arquivo, JSON.stringify(dados, null, 2));
}

const classes = {

    guerreiro: {
        vida: 120,
        ataque: 15,
        defesa: 12,
        magia: 3
    },

    mago: {
        vida: 80,
        ataque: 6,
        defesa: 5,
        magia: 18
    },

    arqueiro: {
        vida: 95,
        ataque: 12,
        defesa: 8,
        magia: 7
    },

    ladino: {
        vida: 90,
        ataque: 14,
        defesa: 7,
        magia: 5
    },

    bardo: {
        vida: 100,
        ataque: 9,
        defesa: 8,
        magia: 12
    }
};

module.exports.executar = async (sock, msg, args) => {

    const jid = msg.key.remoteJid;
    const user = msg.key.participant || msg.key.remoteJid;

    const nomeClasse =
        args[0]?.toLowerCase();

    if (!nomeClasse) {

        return sock.sendMessage(jid, {
            text:
`🎲 CRIAR PERSONAGEM

Classes:

⚔️ guerreiro
🧙 mago
🏹 arqueiro
🗡️ ladino
🎵 bardo

Exemplo:

.criarpersonagem guerreiro`
        });
    }

    const classe = classes[nomeClasse];

    if (!classe) {

        return sock.sendMessage(jid, {
            text: "❌ Classe inválida."
        });
    }

    const dados = carregar();

    if (dados[user]) {

        return sock.sendMessage(jid, {
            text:
`❌ Você já possui personagem.

Use:
.perfil`
        });
    }

    dados[user] = {

        classe: nomeClasse,

        nivel: 1,

        xp: 0,

        ouro: 50,

        vida: classe.vida,

        vidaMax: classe.vida,

        ataque: classe.ataque,

        defesa: classe.defesa,

        magia: classe.magia,

        inventario: []
    };

    salvar(dados);

    await sock.sendMessage(jid, {

        text:
`✨ PERSONAGEM CRIADO

Classe:
${nomeClasse.toUpperCase()}

❤️ Vida: ${classe.vida}
⚔️ Ataque: ${classe.ataque}
🛡️ Defesa: ${classe.defesa}
🔮 Magia: ${classe.magia}

💰 Ouro inicial: 50

Boa sorte aventureiro. 🎲`
    });
};