const fs = require("fs");

const arquivo = "./database/protecao.json";

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

function ehAdmin(p) {
    return p?.admin === "admin" || p?.admin === "superadmin";
}

function limparNumero(id = "") {
    return id
        .replace(/:\d+/g, "")
        .replace("@s.whatsapp.net", "")
        .replace("@lid", "")
        .replace("@g.us", "");
}

module.exports.executar = async (sock, msg, args) => {
    const jid = msg.key.remoteJid;

    if (!jid.endsWith("@g.us")) {
        return sock.sendMessage(jid, {
            text: "❌ Esse comando só funciona em grupos."
        });
    }

    const metadata = await sock.groupMetadata(jid);
    const sender = msg.key.participant;

    const user = metadata.participants.find(p =>
        limparNumero(p.id) === limparNumero(sender) ||
        limparNumero(p.phoneNumber) === limparNumero(sender)
    );

    if (!ehAdmin(user)) {
        return sock.sendMessage(jid, {
            text: "❌ Só admins podem configurar a proteção."
        });
    }

    const dados = carregar();

    if (!dados[jid]) {
        dados[jid] = {
            antilink: false,
            antifake: false,
            antiporn: false
        };
    }

    const tipo = args[0]?.toLowerCase();
    const acao = args[1]?.toLowerCase();

    if (!tipo) {
        return sock.sendMessage(jid, {
            text:
`🛡️ *Proteção do Grupo*

🔗 Antilink: ${dados[jid].antilink ? "✅ Ativo" : "❌ Desativado"}
👤 Antifake: ${dados[jid].antifake ? "✅ Ativo" : "❌ Desativado"}
🔞 Antiporn: ${dados[jid].antiporn ? "✅ Ativo" : "❌ Desativado"}

*Comandos:*

.protecao antilink on
.protecao antilink off

.protecao antifake on
.protecao antifake off

.protecao antiporn on
.protecao antiporn off`
        });
    }

    const protecoes = ["antilink", "antifake", "antiporn"];

    if (!protecoes.includes(tipo)) {
        return sock.sendMessage(jid, {
            text: "❌ Proteção inválida.\n\nUse: antilink, antifake ou antiporn."
        });
    }

    if (acao === "on") {
        dados[jid][tipo] = true;
        salvar(dados);

        return sock.sendMessage(jid, {
            text: `✅ *${tipo}* ativado com sucesso.`
        });
    }

    if (acao === "off") {
        dados[jid][tipo] = false;
        salvar(dados);

        return sock.sendMessage(jid, {
            text: `❌ *${tipo}* desativado com sucesso.`
        });
    }

    return sock.sendMessage(jid, {
        text:
`❌ Use assim:

.protecao ${tipo} on
.protecao ${tipo} off`
    });
};