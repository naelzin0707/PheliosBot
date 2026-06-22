const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");

ffmpeg.setFfmpegPath(ffmpegPath);

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
            text: "🤗 Use: *.abraco @pessoa* ou responda alguém com *.abraco*"
        });
    }

    const autor =
        msg.key.participant ||
        msg.key.remoteJid;

    const nomeAutor = autor.split("@")[0];
    const nomeAlvo = alvo.split("@")[0];

    const frases = [
        `🤗 @${nomeAutor} deu um abraço apertado em @${nomeAlvo}!`,
        `🥰 @${nomeAutor} envolveu @${nomeAlvo} num abraço quentinho!`,
        `💞 @${nomeAutor} abraçou @${nomeAlvo} com carinho!`,
        `🌈 Um abraço cheio de amor entre @${nomeAutor} e @${nomeAlvo}!`,
        `🫂 @${nomeAutor} correu e abraçou @${nomeAlvo}!`,
        `💕 @${nomeAutor} precisava de um abraço e escolheu @${nomeAlvo}!`,
        `✨ Abraço distribuído com sucesso para @${nomeAlvo}!`,
        `🥺 @${nomeAutor} abraçou @${nomeAlvo} e deixou o grupo com inveja!`
    ];

    const frase =
        frases[Math.floor(Math.random() * frases.length)];

    const gif = "./midia/abraco.gif";

    if (!fs.existsSync(gif)) {
        return sock.sendMessage(jid, {
            text: "❌ Não achei: ./midia/abraco.gif"
        });
    }

    if (!fs.existsSync("./temp")) {
        fs.mkdirSync("./temp");
    }

    const mp4 = path.join(
        "./temp",
        `abraco-${Date.now()}.mp4`
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