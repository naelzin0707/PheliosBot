const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");


ffmpeg.set("ffmpeg");

function converterGifParaMp4(entrada, saida) {
    return new Promise((resolve, reject) => {
        ffmpeg(entrada)
            .outputOptions([
                "-movflags", "faststart",
                "-pix_fmt", "yuv420p",
                "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2"
            ])
            .toFormat("mp4")
            .save(saida)
            .on("end", resolve)
            .on("error", reject);
    });
}

module.exports.executar = async (sock, msg) => {

    const jid = msg.key.remoteJid;

    const ctx = msg.message?.extendedTextMessage?.contextInfo;

    const alvo =
        ctx?.mentionedJid?.[0] ||
        ctx?.participant;

    if (!alvo) {
        return sock.sendMessage(jid, {
            text:
`👅 Como usar:

.lamber @pessoa

ou responda uma mensagem com:

.lamber`
        });
    }

    const autor =
        msg.key.participant ||
        msg.key.remoteJid;

    const nomeAutor = autor.split("@")[0];
    const nomeAlvo = alvo.split("@")[0];

    const frases = [
        `👅 @${nomeAutor} lambeu @${nomeAlvo}!`,
        `😳 @${nomeAlvo} foi surpreendido por uma lambida inesperada.`,
        `🐶 @${nomeAutor} demonstrou carinho em @${nomeAlvo} do jeito mais estranho possível.`,
        `✨ @${nomeAutor} decidiu lamber @${nomeAlvo} sem explicação alguma.`,
        `🌈 @${nomeAlvo} acabou de ser oficialmente lambido.`,
        `😂 Ninguém sabe por quê, mas @${nomeAutor} lambeu @${nomeAlvo}.`,
        `😈 @${nomeAutor} não resistiu e deu uma lambida em @${nomeAlvo}.`,
        `💖 @${nomeAutor} demonstrou afeto por @${nomeAlvo} com uma lambida.`,
        `🫣 O grupo inteiro ficou olhando enquanto @${nomeAutor} lambia @${nomeAlvo}.`,
        `🔥 @${nomeAutor} estava com fome ou apaixonado? @${nomeAlvo} não sabe.`
    ];

    const frase =
        frases[Math.floor(Math.random() * frases.length)];

    const gif = "./midia/lamber.gif";

    if (!fs.existsSync(gif)) {
        return sock.sendMessage(jid, {
            text: "❌ Não achei o arquivo ./midia/lamber.gif"
        });
    }

    if (!fs.existsSync("./temp")) {
        fs.mkdirSync("./temp");
    }

    const mp4 = path.join(
        "./temp",
        `lamber-${Date.now()}.mp4`
    );

    await converterGifParaMp4(gif, mp4);

    await sock.sendMessage(jid, {
        video: fs.readFileSync(mp4),
        gifPlayback: true,
        caption: frase,
        mentions: [autor, alvo]
    });

    fs.unlinkSync(mp4);
};