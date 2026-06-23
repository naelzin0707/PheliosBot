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
`👋 Como usar:

.tapa @pessoa

ou responda uma mensagem com:

.tapa`
        });
    }

    const autor =
        msg.key.participant ||
        msg.key.remoteJid;

    const nomeAutor = autor.split("@")[0];
    const nomeAlvo = alvo.split("@")[0];

    const frases = [
        `👋 @${nomeAutor} deu um tapa na cara de @${nomeAlvo}!`,
        `💥 @${nomeAlvo} levou um tapão de @${nomeAutor}!`,
        `⚡ Foi tão forte que o grupo inteiro ouviu o estalo.`,
        `😳 @${nomeAutor} perdeu a paciência com @${nomeAlvo}!`,
        `🔥 @${nomeAlvo} desbloqueou a conquista: "Levou um tapão".`,
        `💀 @${nomeAutor} distribuiu violência gratuita para @${nomeAlvo}.`,
        `🤚 @${nomeAutor} acertou um tapa crítico em @${nomeAlvo}!`,
        `🚨 Denúncias apontam que @${nomeAlvo} foi estapeado por @${nomeAutor}.`,
        `😂 O som do tapa ecoou por todo o grupo.`,
        `🌈 @${nomeAutor} aplicou um tapa certificado em @${nomeAlvo}.`
    ];

    const frase =
        frases[Math.floor(Math.random() * frases.length)];

    const gif = "./midia/tapa.gif";

    if (!fs.existsSync(gif)) {
        return sock.sendMessage(jid, {
            text: "❌ Não achei o arquivo ./midia/tapa.gif"
        });
    }

    if (!fs.existsSync("./temp")) {
        fs.mkdirSync("./temp");
    }

    const mp4 = path.join(
        "./temp",
        `tapa-${Date.now()}.mp4`
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