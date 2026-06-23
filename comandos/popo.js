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
`🍑 Como usar:

.popo @pessoa

ou responda uma mensagem com:

.popo`
        });
    }

    const autor =
        msg.key.participant ||
        msg.key.remoteJid;

    const nomeAutor = autor.split("@")[0];
    const nomeAlvo = alvo.split("@")[0];

    const frases = [
        `🍑 @${nomeAutor} deu um tapinha no popô de @${nomeAlvo}!`,
        `😳 @${nomeAlvo} foi surpreendido por um tapa estratégico.`,
        `✨ @${nomeAutor} não resistiu ao popô de @${nomeAlvo}.`,
        `🍑 TAPA NO POPÔ DETECTADO! Autor: @${nomeAutor}.`,
        `🌈 @${nomeAutor} aplicou um tapinha carinhoso em @${nomeAlvo}.`,
        `😂 @${nomeAlvo} acabou de desbloquear a conquista: "Popô estapeado".`,
        `💥 O som do tapinha ecoou pelo grupo inteiro.`,
        `😈 @${nomeAutor} viu o popô de @${nomeAlvo} e perdeu a compostura.`,
        `🫣 @${nomeAlvo} não estava preparado para esse ataque.`,
        `💖 Foi um tapinha com carinho... eu acho.`
    ];

    const frase =
        frases[Math.floor(Math.random() * frases.length)];

    const gif = "./midia/popo.gif";

    if (!fs.existsSync(gif)) {
        return sock.sendMessage(jid, {
            text: "❌ Não achei o arquivo ./midia/popo.gif"
        });
    }

    if (!fs.existsSync("./temp")) {
        fs.mkdirSync("./temp");
    }

    const mp4 = path.join(
        "./temp",
        `popo-${Date.now()}.mp4`
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