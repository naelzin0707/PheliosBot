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

    const alvo =
        ctx?.mentionedJid?.[0] ||
        ctx?.participant;

    if (!alvo) {
        return sock.sendMessage(jid, {
            text:
`🪂 Como usar:

.penhasco @pessoa

ou responda uma mensagem com:

.penhasco`
        });
    }

    const autor =
        msg.key.participant ||
        msg.key.remoteJid;

    const nomeAutor = autor.split("@")[0];
    const nomeAlvo = alvo.split("@")[0];

    const frases = [
        `🪂 @${nomeAutor} jogou @${nomeAlvo} do penhasco!`,
        `💀 @${nomeAlvo} descobriu que gravidade não é uma opinião.`,
        `😭 Últimas palavras de @${nomeAlvo}: "pera..."`,
        `🚨 Testemunhas viram @${nomeAutor} empurrando @${nomeAlvo} do penhasco.`,
        `☁️ @${nomeAlvo} está atualmente em queda livre.`,
        `👋 Tchau @${nomeAlvo}, foi bom enquanto durou.`,
        `🌈 @${nomeAutor} enviou @${nomeAlvo} para uma aventura sem volta.`,
        `💨 @${nomeAlvo} virou um míssil humano após encontrar @${nomeAutor}.`,
        `🦅 Nem os pássaros conseguiram acompanhar a queda de @${nomeAlvo}.`,
        `😈 @${nomeAutor} escolheu a violência e lançou @${nomeAlvo} penhasco abaixo.`,
        `📉 A altitude de @${nomeAlvo} diminuiu drasticamente.`,
        `🎢 @${nomeAlvo} acabou de desbloquear a atração "queda infinita".`
    ];

    const frase =
        frases[Math.floor(Math.random() * frases.length)];

    const gif = "./midia/penhasco.gif";

    if (!fs.existsSync(gif)) {
        return sock.sendMessage(jid, {
            text: "❌ Não achei o arquivo ./midia/penhasco.gif"
        });
    }

    if (!fs.existsSync("./temp")) {
        fs.mkdirSync("./temp");
    }

    const mp4 = path.join(
        "./temp",
        `penhasco-${Date.now()}.mp4`
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