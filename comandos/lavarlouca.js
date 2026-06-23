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

    const alvo = ctx?.mentionedJid?.[0] || ctx?.participant;

    if (!alvo) {
        return sock.sendMessage(jid, {
            text: "🧽 Use: *.lavarlouca @pessoa* ou responda alguém com *.lavarlouca*"
        });
    }

    const pratos = Math.floor(Math.random() * 100) + 10;
    const talheres = Math.floor(Math.random() * 200) + 20;
    const panelas = Math.floor(Math.random() * 15) + 1;

    const nomeAlvo = alvo.split("@")[0];

    const frases = [
        `🧽 @${nomeAlvo} foi convocado para lavar a louça!`,
        `🍽️ A pia olhou para @${nomeAlvo} e escolheu violência.`,
        `🧼 @${nomeAlvo}, sua missão é sobreviver à montanha de louça.`,
        `🚨 Emergência doméstica! @${nomeAlvo} foi escolhido para lavar tudo.`,
        `😂 @${nomeAlvo} desbloqueou a conquista: escravo da pia.`
    ];

    const frase = frases[Math.floor(Math.random() * frases.length)];

    const gif = "./midia/louca.gif";

    if (!fs.existsSync(gif)) {
        return sock.sendMessage(jid, {
            text: "❌ Não achei: ./midia/louca.gif"
        });
    }

    if (!fs.existsSync("./temp")) fs.mkdirSync("./temp");

    const mp4 = path.join("./temp", `louca-${Date.now()}.mp4`);

    await converterGifParaMp4(gif, mp4);

    await sock.sendMessage(jid, {
        video: fs.readFileSync(mp4),
        gifPlayback: true,
        caption:
`${frase}

🍽️ Pratos: ${pratos}
🥄 Talheres: ${talheres}
🍳 Panelas: ${panelas}

Boa sorte, guerreiro.`,
        mentions: [alvo]
    });

    fs.unlinkSync(mp4);
};