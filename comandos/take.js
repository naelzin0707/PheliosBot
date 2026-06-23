const fs = require("fs");
const path = require("path");
const { downloadContentFromMessage, getContentType } = require("@whiskeysockets/baileys");
const webp = require("node-webpmux");

function limparNumero(id = "") {
    return id
        .replace(/:\d+/g, "")
        .replace("@s.whatsapp.net", "")
        .replace("@lid", "")
        .replace("@g.us", "");
}

async function adicionarExif(buffer, pack, autor) {
    const img = new webp.Image();
    await img.load(buffer);

    const json = {
        "sticker-pack-id": "com.pheliiosbot.premium",
        "sticker-pack-name": pack,
        "sticker-pack-publisher": autor,
        "emojis": ["🌙", "✨", "💎", "🤖"]
    };

    const jsonBuff = Buffer.from(JSON.stringify(json), "utf8");

    const exifAttr = Buffer.from([
        0x49, 0x49, 0x2A, 0x00,
        0x08, 0x00, 0x00, 0x00,
        0x01, 0x00,
        0x41, 0x57,
        0x07, 0x00,
        0x00, 0x00, 0x00, 0x00,
        0x16, 0x00, 0x00, 0x00
    ]);

    const exif = Buffer.concat([exifAttr, jsonBuff]);

    exif.writeUIntLE(jsonBuff.length, 14, 4);

    img.exif = exif;

    const saida = path.join("./temp", `take-${Date.now()}.webp`);

    await img.save(saida);

    const novoBuffer = fs.readFileSync(saida);

    fs.unlinkSync(saida);

    return novoBuffer;
}

module.exports.executar = async (sock, msg, args) => {

    const jid = msg.key.remoteJid;

    try {

        const ctx =
            msg.message?.extendedTextMessage?.contextInfo;

        const quoted =
            ctx?.quotedMessage;

        if (!quoted) {
            return sock.sendMessage(jid, {
                text:
`🏷️ *TAKE*

Responda uma figurinha:

.take Nome

ou

.take @Pessoa`
            });
        }

        const tipo = getContentType(quoted);

        if (tipo !== "stickerMessage") {
            return sock.sendMessage(jid, {
                text: "❌ Responda uma figurinha."
            });
        }

        let nome = args.join(" ").trim();

        const mencionado =
            ctx?.mentionedJid?.[0];

        if (mencionado) {
            nome = limparNumero(mencionado);
        }

        if (!nome) {
            nome = limparNumero(
                msg.key.participant ||
                msg.key.remoteJid
            );
        }

        if (!fs.existsSync("./temp")) {
            fs.mkdirSync("./temp");
        }

        await sock.sendMessage(jid, {
            text: "✨ Personalizando figurinha..."
        });

        const stream =
            await downloadContentFromMessage(
                quoted.stickerMessage,
                "sticker"
            );

        let buffer = Buffer.from([]);

        for await (const chunk of stream) {
            buffer = Buffer.concat([
                buffer,
                chunk
            ]);
        }

        const novoSticker =
            await adicionarExif(
                buffer,
                `💎 ${nome}`,
                `✨ PheliosBot Premium ✨`
            );

        await sock.sendMessage(jid, {
            sticker: novoSticker
        });

    } catch (erro) {

        console.error("ERRO TAKE:", erro);

        await sock.sendMessage(jid, {
            text: "❌ Erro ao renomear a figurinha."
        });
    }
};