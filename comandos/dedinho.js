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
`🤝 Como usar:

.dedinho @pessoa

ou responda uma mensagem com:

.dedinho`
        });
    }

    const autor =
        msg.key.participant ||
        msg.key.remoteJid;

    const nomeAutor = autor.split("@")[0];
    const nomeAlvo = alvo.split("@")[0];

    const frases = [
        `🤝 @${nomeAutor} fez promessa de dedinho com @${nomeAlvo}!`,
        `✨ Agora é oficial, @${nomeAutor} e @${nomeAlvo} juraram de dedinho.`,
        `🥺 Uma promessa de dedinho foi selada entre @${nomeAutor} e @${nomeAlvo}.`,
        `💖 @${nomeAutor} confiou em @${nomeAlvo} ao ponto de prometer de dedinho!`,
        `🌈 Quebrar essa promessa dá azar por 7 anos, viu @${nomeAlvo}?`,
        `🫶 @${nomeAutor} e @${nomeAlvo} selaram um pacto sagrado de dedinho.`,
        `⭐ Promessa registrada com sucesso entre @${nomeAutor} e @${nomeAlvo}.`,
        `💕 O dedinho foi unido. Agora não tem volta!`
    ];

    const frase =
        frases[Math.floor(Math.random() * frases.length)];

    const gif = "./midia/dedinho.gif";

    if (!fs.existsSync(gif)) {
        return sock.sendMessage(jid, {
            text: "❌ Não achei o arquivo ./midia/dedinho.gif"
        });
    }

    if (!fs.existsSync("./temp")) {
        fs.mkdirSync("./temp");
    }

    const mp4 = path.join(
        "./temp",
        `dedinho-${Date.now()}.mp4`
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