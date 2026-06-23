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

module.exports.executar = async (sock, msg, args) => {

    const jid = msg.key.remoteJid;
    const user = msg.key.participant || msg.key.remoteJid;

    const motivo =
        args.join(" ").trim() ||
        "Sem motivo informado.";

    const dados = carregar();

    dados[user] = {
        motivo,
        inicio: Date.now()
    };

    salvar(dados);

    await sock.sendMessage(jid, {
        text:
`📢 *AUSÊNCIA REGISTRADA*

@${user.split("@")[0]} entrou em modo ausente.

📝 Motivo:
${motivo}

🌈 Até breve, diva.`,
        mentions: [user]
    });
};