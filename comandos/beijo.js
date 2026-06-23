const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");


ffmpeg.setFfmpegPath("ffmpeg");

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

    const alvo = ctx?.mentionedJid?.[0] || ctx?.participant;

    if (!alvo) {
        return sock.sendMessage(jid, {
            text: "💋 Use: *.beijo @pessoa* ou responda alguém com *.beijo*"
        });
    }

    const autor = msg.key.participant || msg.key.remoteJid;

    const nomeAutor = autor.split("@")[0];
    const nomeAlvo = alvo.split("@")[0];

    const frases = [
        `💋 @${nomeAutor} roubou um beijo de @${nomeAlvo}!`,
        `💕 @${nomeAutor} não resistiu e beijou @${nomeAlvo}!`,
        `🌈 @${nomeAutor} distribuiu amor e beijou @${nomeAlvo}!`,
        `🔥 O grupo inteiro viu @${nomeAutor} beijando @${nomeAlvo}!`,
        `😏 O que acontece depois desse beijo fica entre eles...`
    ];

    const frase = frases[Math.floor(Math.random() * frases.length)];

    const gif = "./midia/beijo.gif";

    if (!fs.existsSync(gif)) {
        return sock.sendMessage(jid, {
            text: "❌ Não achei: ./midia/beijo.gif"
        });
    }

    if (!fs.existsSync("./temp")) fs.mkdirSync("./temp");

    const mp4 = path.join("./temp", `beijo-${Date.now()}.mp4`);

    await converterGifParaMp4(gif, mp4);

    await sock.sendMessage(jid, {
        video: fs.readFileSync(mp4),
        gifPlayback: true,
        caption: frase,
        mentions: [autor, alvo]
    });

    fs.unlinkSync(mp4);
};