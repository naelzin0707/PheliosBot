const fs = require("fs");

const arquivo = "./database/ausentes.json";

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

module.exports.executar = async (sock, msg) => {

    const jid = msg.key.remoteJid;
    const user = msg.key.participant || msg.key.remoteJid;

    const dados = carregar();

    delete dados[user];

    salvar(dados);

    await sock.sendMessage(jid, {
        text:
`😂 *ATIVO DE NOVO*

Só se for ativar o cu e sair andando KKKKK

Bem-vindo de volta
@${user.split("@")[0]} 🌈💖`,
        mentions: [user]
    });
};