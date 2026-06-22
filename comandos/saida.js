const fs = require("fs");
const { downloadContentFromMessage, getContentType } = require("@whiskeysockets/baileys");

const arquivo = "./database/saida.json";
const pastaFotos = "./database/saida_fotos";

function carregar() {
    if (!fs.existsSync("./database")) fs.mkdirSync("./database");
    if (!fs.existsSync(pastaFotos)) fs.mkdirSync(pastaFotos);
    if (!fs.existsSync(arquivo)) fs.writeFileSync(arquivo, JSON.stringify({}, null, 2));
    return JSON.parse(fs.readFileSync(arquivo));
}

function salvar(dados) {
    fs.writeFileSync(arquivo, JSON.stringify(dados, null, 2));
}

function ehAdmin(p) {
    return p?.admin === "admin" || p?.admin === "superadmin";
}

function limparNumero(id = "") {
    return id.replace(/:\d+/g, "").replace("@s.whatsapp.net", "").replace("@lid", "");
}

module.exports.executar = async (sock, msg, args) => {
    const jid = msg.key.remoteJid;

    if (!jid.endsWith("@g.us")) {
        return sock.sendMessage(jid, { text: "❌ Esse comando só funciona em grupos." });
    }

    const metadata = await sock.groupMetadata(jid);
    const participantes = metadata.participants;
    const sender = msg.key.participant;

    const user = participantes.find(p => limparNumero(p.id) === limparNumero(sender));

    if (!ehAdmin(user)) {
        return sock.sendMessage(jid, { text: "❌ Só admins podem configurar a saída." });
    }

    const dados = carregar();

    if (!dados[jid]) {
        dados[jid] = {
            ativo: false,
            mensagem: "💔 @user saiu do grupo.\n\nVai com glitter, diva. 🌈✨",
            imagem: null
        };
    }

    const acao = args[0]?.toLowerCase();

    if (!acao) {
        return sock.sendMessage(jid, {
            text:
`💔 *Sistema de Saída*

.saida on
.saida off
.saida msg sua mensagem
.saida foto

Use @user para marcar quem saiu.

Status: ${dados[jid].ativo ? "✅ Ativo" : "❌ Desativado"}
Imagem: ${dados[jid].imagem ? "✅ Definida" : "❌ Sem imagem"}

Mensagem atual:
${dados[jid].mensagem}`
        });
    }

    if (acao === "on") {
        dados[jid].ativo = true;
        salvar(dados);
        return sock.sendMessage(jid, { text: "✅ Mensagem de saída ativada." });
    }

    if (acao === "off") {
        dados[jid].ativo = false;
        salvar(dados);
        return sock.sendMessage(jid, { text: "❌ Mensagem de saída desativada." });
    }

    if (acao === "msg") {
        const novaMensagem = args.slice(1).join(" ");

        if (!novaMensagem) {
            return sock.sendMessage(jid, {
                text: "❌ Exemplo:\n.saida msg 💔 @user saiu do grupo. Sentiremos falta, diva 🌈"
            });
        }

        dados[jid].mensagem = novaMensagem;
        salvar(dados);

        return sock.sendMessage(jid, {
            text: `✅ Mensagem de saída atualizada:\n\n${novaMensagem}`
        });
    }

    if (acao === "foto") {
        let media;
        let tipo;

        const tipoMsg = getContentType(msg.message);

        if (tipoMsg === "imageMessage") {
            media = msg.message.imageMessage;
            tipo = "image";
        } else {
            const ctx = msg.message?.extendedTextMessage?.contextInfo;
            const quoted = ctx?.quotedMessage;

            if (quoted && getContentType(quoted) === "imageMessage") {
                media = quoted.imageMessage;
                tipo = "image";
            }
        }

        if (!media) {
            return sock.sendMessage(jid, {
                text: "❌ Envie uma imagem com legenda *.saida foto* ou responda uma imagem com *.saida foto*."
            });
        }

        const stream = await downloadContentFromMessage(media, tipo);

        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

        const nomeArquivo = `${jid.replace(/[^a-zA-Z0-9]/g, "_")}.jpg`;
        const caminhoFoto = `${pastaFotos}/${nomeArquivo}`;

        fs.writeFileSync(caminhoFoto, buffer);

        dados[jid].imagem = caminhoFoto;
        salvar(dados);

        return sock.sendMessage(jid, {
            text: "✅ Foto de saída definida com sucesso!"
        });
    }

    return sock.sendMessage(jid, {
        text: "❌ Use: .saida on, .saida off, .saida msg texto ou .saida foto"
    });
};