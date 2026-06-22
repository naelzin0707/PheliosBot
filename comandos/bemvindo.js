const fs = require("fs");
const { downloadContentFromMessage, getContentType } = require("@whiskeysockets/baileys");

const arquivo = "./database/bemvindo.json";
const pastaFotos = "./database/bemvindo_fotos";

function carregar() {
    if (!fs.existsSync("./database")) fs.mkdirSync("./database");
    if (!fs.existsSync(pastaFotos)) fs.mkdirSync(pastaFotos);

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
        return sock.sendMessage(jid, { text: "❌ Só admins podem configurar o bem-vindo." });
    }

    const dados = carregar();

    if (!dados[jid]) {
        dados[jid] = {
            ativo: false,
            mensagem: "🌈 Bem-vindo(a), @user!\n\n💖 Apresentação obrigatória:\n\n✨ Nome\n🎂 Idade\n📍 Cidade\n💬 Fale um pouco sobre você",
            imagem: null
        };
    }

    const acao = args[0]?.toLowerCase();

    if (!acao) {
        return sock.sendMessage(jid, {
            text:
`🌈 *Sistema de Bem-vindo*

.bemvindo on
.bemvindo off
.bemvindo msg sua mensagem
.bemvindo foto

Use @user para marcar quem entrou.

Status: ${dados[jid].ativo ? "✅ Ativo" : "❌ Desativado"}
Imagem: ${dados[jid].imagem ? "✅ Definida" : "❌ Sem imagem"}

Mensagem atual:
${dados[jid].mensagem}`
        });
    }

    if (acao === "on") {
        dados[jid].ativo = true;
        salvar(dados);
        return sock.sendMessage(jid, { text: "✅ Bem-vindo ativado." });
    }

    if (acao === "off") {
        dados[jid].ativo = false;
        salvar(dados);
        return sock.sendMessage(jid, { text: "❌ Bem-vindo desativado." });
    }

    if (acao === "msg") {
        const novaMensagem = args.slice(1).join(" ");

        if (!novaMensagem) {
            return sock.sendMessage(jid, {
                text: "❌ Escreva a mensagem.\n\nExemplo:\n.bemvindo msg Bem-vindo(a), @user! 🌈"
            });
        }

        dados[jid].mensagem = novaMensagem;
        salvar(dados);

        return sock.sendMessage(jid, {
            text: `✅ Mensagem atualizada:\n\n${novaMensagem}`
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

            if (quoted) {
                const tipoQuoted = getContentType(quoted);

                if (tipoQuoted === "imageMessage") {
                    media = quoted.imageMessage;
                    tipo = "image";
                }
            }
        }

        if (!media) {
            return sock.sendMessage(jid, {
                text: "❌ Envie uma imagem com legenda *.bemvindo foto* ou responda uma imagem com *.bemvindo foto*."
            });
        }

        const stream = await downloadContentFromMessage(media, tipo);

        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const nomeArquivo = `${jid.replace(/[^a-zA-Z0-9]/g, "_")}.jpg`;
        const caminhoFoto = `${pastaFotos}/${nomeArquivo}`;

        fs.writeFileSync(caminhoFoto, buffer);

        dados[jid].imagem = caminhoFoto;
        salvar(dados);

        return sock.sendMessage(jid, {
            text: "✅ Foto de bem-vindo definida com sucesso!"
        });
    }

    return sock.sendMessage(jid, {
        text: "❌ Use: .bemvindo on, .bemvindo off, .bemvindo msg texto ou .bemvindo foto"
    });
};