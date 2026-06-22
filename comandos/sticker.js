const fs = require("fs");
const path = require("path");

const { downloadContentFromMessage, getContentType } = require("@whiskeysockets/baileys");

const { converterParaWebp } = require("../utils/sticker");
// const { adicionarExif } = require("../utils/exif");

module.exports.executar = async (sock, msg) => {
    const jid = msg.key.remoteJid;

    try {
        const mensagem = msg.message;

        let media;
        let tipo;

        const tipoMensagem = getContentType(mensagem);

        if (tipoMensagem === "imageMessage") {
            media = mensagem.imageMessage;
            tipo = "image";
        }

        if (tipoMensagem === "videoMessage") {
            media = mensagem.videoMessage;
            tipo = "video";
        }

        const ctx =
            mensagem?.extendedTextMessage?.contextInfo ||
            mensagem?.imageMessage?.contextInfo ||
            mensagem?.videoMessage?.contextInfo;

        const quoted = ctx?.quotedMessage;

        if (!media && quoted) {
            const tipoQuoted = getContentType(quoted);

            if (tipoQuoted === "imageMessage") {
                media = quoted.imageMessage;
                tipo = "image";
            }

            if (tipoQuoted === "videoMessage") {
                media = quoted.videoMessage;
                tipo = "video";
            }
        }

        if (!media) {
            return await sock.sendMessage(jid, {
                text: "❌ Envie uma imagem/vídeo com legenda *.s* ou responda uma mídia com *.s*."
            });
        }

        if (tipo === "video" && media.seconds > 10) {
            return await sock.sendMessage(jid, {
                text: "❌ O vídeo precisa ter até 10 segundos."
            });
        }

        if (!media.url && !media.directPath) {
            return await sock.sendMessage(jid, {
                text: "❌ Não consegui baixar essa mídia. Tenta enviar a imagem/vídeo com legenda *.s* em vez de responder."
            });
        }

        await sock.sendMessage(jid, { text: "✨ Criando figurinha..." });

        if (!fs.existsSync("./temp")) {
            fs.mkdirSync("./temp");
        }

        const id = Date.now();
        const entrada = path.join("./temp", `${id}.${tipo === "image" ? "jpg" : "mp4"}`);
        const saida = path.join("./temp", `${id}.webp`);

        const stream = await downloadContentFromMessage(media, tipo);

        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        fs.writeFileSync(entrada, buffer);

        await converterParaWebp(entrada, saida, tipo);

        // Nome do pack/autor fica desligado por enquanto porque o exif antigo quebrava a figurinha.
        // await adicionarExif(saida, "PheliosBot", "Nael");

        await sock.sendMessage(jid, {
            sticker: fs.readFileSync(saida)
        });

        if (fs.existsSync(entrada)) fs.unlinkSync(entrada);
        if (fs.existsSync(saida)) fs.unlinkSync(saida);

    } catch (erro) {
        console.error(erro);

        await sock.sendMessage(jid, {
            text: "❌ Deu erro ao criar a figurinha. Veja o terminal."
        });
    }
};