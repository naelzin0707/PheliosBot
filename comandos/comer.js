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
            text: "😈 Use: *.come @pessoa* ou responda alguém com *.come*"
        });
    }

    const autor =
        msg.key.participant ||
        msg.key.remoteJid;

    const nomeAutor = autor.split("@")[0];
    const nomeAlvo = alvo.split("@")[0];

    const frases = [
        `😈 @${nomeAutor} comeu @${nomeAlvo} gostosinho!`,
        `🔥 @${nomeAutor} não perdoou e comeu @${nomeAlvo}!`,
        `🥵 @${nomeAlvo} não conseguiu escapar de @${nomeAutor}!`,
        `🌶️ @${nomeAutor} passou o rodo em @${nomeAlvo}!`,
        `😏 @${nomeAlvo} virou o lanche favorito de @${nomeAutor}!`,
        `💘 @${nomeAutor} atacou @${nomeAlvo} sem dó nem piedade!`,
        `🫦 @${nomeAutor} e @${nomeAlvo} desapareceram por alguns minutos...`,
        `✨ Dizem que @${nomeAutor} comeu @${nomeAlvo} tão gostosinho que até o grupo ficou em choque.`,
        `🚨 ALERTA: @${nomeAlvo} foi capturado por @${nomeAutor}!`,
        `😳 O que aconteceu entre @${nomeAutor} e @${nomeAlvo} ficará nos registros do grupo para sempre.`
    ];

    const frase =
        frases[Math.floor(Math.random() * frases.length)];

    const gif = "./midia/comer.gif";

    if (!fs.existsSync(gif)) {
        return sock.sendMessage(jid, {
            text: "❌ Não achei: ./midia/comer.gif"
        });
    }

    if (!fs.existsSync("./temp")) {
        fs.mkdirSync("./temp");
    }

    const mp4 = path.join(
        "./temp",
        `come-${Date.now()}.mp4`
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