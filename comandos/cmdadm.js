const fs = require("fs");

const arquivo = "./database/cmdadm.json";

function carregar() {
    if (!fs.existsSync(arquivo)) {
        fs.writeFileSync(arquivo, JSON.stringify({}, null, 2));
    }

    return JSON.parse(fs.readFileSync(arquivo));
}

function salvar(dados) {
    fs.writeFileSync(arquivo, JSON.stringify(dados, null, 2));
}

function ehAdmin(p) {
    return p?.admin === "admin" || p?.admin === "superadmin";
}

function limparNumero(id = "") {
    return id
        .replace(/:\d+/g, "")
        .replace("@s.whatsapp.net", "")
        .replace("@lid", "");
}

module.exports.executar = async (sock, msg, args) => {

    const jid = msg.key.remoteJid;

    if (!jid.endsWith("@g.us")) {
        return sock.sendMessage(jid, {
            text: "❌ Esse comando só funciona em grupos."
        });
    }

    const metadata = await sock.groupMetadata(jid);

    const participantes = metadata.participants;

    const sender = msg.key.participant;

    const user = participantes.find(
        p => limparNumero(p.id) === limparNumero(sender)
    );

    if (!ehAdmin(user)) {
        return sock.sendMessage(jid, {
            text: "❌ Apenas admins podem alterar isso."
        });
    }

    const dados = carregar();

    if (!dados[jid]) {
        dados[jid] = false;
    }

    const acao = args[0]?.toLowerCase();

    if (!acao) {
        return sock.sendMessage(jid, {
            text:
`⚙️ Controle de comandos

.cmdadm on
.cmdadm off

Status atual:
${dados[jid] ? "✅ Apenas admins" : "🌈 Todos podem usar"}`
        });
    }

    if (acao === "on") {
        dados[jid] = true;
        salvar(dados);

        return sock.sendMessage(jid, {
            text: "🔒 Agora apenas admins podem usar comandos."
        });
    }

    if (acao === "off") {
        dados[jid] = false;
        salvar(dados);

        return sock.sendMessage(jid, {
            text: "🔓 Agora todos podem usar comandos."
        });
    }

    return sock.sendMessage(jid, {
        text: "❌ Use .cmdadm on ou .cmdadm off"
    });
};