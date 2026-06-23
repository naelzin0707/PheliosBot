const fs = require("fs");

const arquivo = "./database/listanegra.json";

function carregar() {
    if (!fs.existsSync("./database")) {
        fs.mkdirSync("./database");
    }

    if (!fs.existsSync(arquivo)) {
        fs.writeFileSync(arquivo, JSON.stringify({}, null, 2));
    }

    const conteudo = fs.readFileSync(arquivo, "utf8");

    if (!conteudo.trim()) {
        fs.writeFileSync(arquivo, JSON.stringify({}, null, 2));
        return {};
    }

    return JSON.parse(conteudo);
}

function salvar(dados) {
    fs.writeFileSync(arquivo, JSON.stringify(dados, null, 2));
}

function limparNumero(id = "") {
    return id
        .replace(/:\d+/g, "")
        .replace("@s.whatsapp.net", "")
        .replace("@lid", "")
        .replace("@g.us", "");
}

function ehAdmin(p) {
    return p?.admin === "admin" || p?.admin === "superadmin";
}

function pegarAlvo(msg, args) {
    const ctx = msg.message?.extendedTextMessage?.contextInfo;

    let alvo =
        ctx?.mentionedJid?.[0] ||
        ctx?.participant ||
        args[1];

    if (!alvo) return null;

    const numero = limparNumero(alvo).replace(/\D/g, "");

    if (!numero) return null;

    return `${numero}@s.whatsapp.net`;
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
    const senderNumero = limparNumero(sender);

    const user = metadata.participants.find(p =>
        limparNumero(p.id) === senderNumero ||
        limparNumero(p.phoneNumber) === senderNumero
    );

    if (!ehAdmin(user)) {
        return sock.sendMessage(jid, {
            text: "❌ Só admins podem mexer na lista negra."
        });
    }

    const dados = carregar();

    if (!dados[jid]) {
        dados[jid] = [];
    }

    const acao = args[0]?.toLowerCase();

    if (!acao) {
        return sock.sendMessage(jid, {
            text:
`🚫 *Lista Negra*

.listanegra add @pessoa
.listanegra del @pessoa
.listanegra listar

Também dá pra responder uma mensagem:
.listanegra add
.listanegra del`
        });
    }

    if (acao === "listar") {
        if (!dados[jid].length) {
            return sock.sendMessage(jid, {
                text: "✅ A lista negra está vazia."
            });
        }

        let texto = "🚫 *LISTA NEGRA DO GRUPO*\n\n";

        dados[jid].forEach((pessoa, i) => {
            texto += `${i + 1}. @${limparNumero(pessoa)}\n`;
        });

        return sock.sendMessage(jid, {
            text: texto,
            mentions: dados[jid]
        });
    }

    if (acao !== "add" && acao !== "del") {
        return sock.sendMessage(jid, {
            text: "❌ Use: .listanegra add, .listanegra del ou .listanegra listar"
        });
    }

    const alvo = pegarAlvo(msg, args);

    if (!alvo) {
        return sock.sendMessage(jid, {
            text: `❌ Marque alguém, responda uma mensagem ou coloque o número.\n\nExemplo:\n.listanegra ${acao} @pessoa`
        });
    }

    if (acao === "add") {
        if (dados[jid].includes(alvo)) {
            return sock.sendMessage(jid, {
                text: `⚠️ @${limparNumero(alvo)} já está na lista negra.`,
                mentions: [alvo]
            });
        }

        dados[jid].push(alvo);
        salvar(dados);

        return sock.sendMessage(jid, {
            text: `🚫 @${limparNumero(alvo)} foi adicionado à lista negra.`,
            mentions: [alvo]
        });
    }

    if (acao === "del") {
        if (!dados[jid].includes(alvo)) {
            return sock.sendMessage(jid, {
                text: `⚠️ @${limparNumero(alvo)} não está na lista negra.`,
                mentions: [alvo]
            });
        }

        dados[jid] = dados[jid].filter(pessoa => pessoa !== alvo);
        salvar(dados);

        return sock.sendMessage(jid, {
            text: `✅ @${limparNumero(alvo)} foi removido da lista negra.`,
            mentions: [alvo]
        });
    }
};