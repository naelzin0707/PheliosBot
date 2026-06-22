const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const yts = require("yt-search");
const ffmpegPath = require("ffmpeg-static");

module.exports.executar = async (sock, msg, args) => {
    const jid = msg.key.remoteJid;

    try {
        const pesquisa = args.join(" ");

        if (!pesquisa) {
            return sock.sendMessage(jid, {
                text: "❌ Use assim:\n*.play nome da música*"
            });
        }

        await sock.sendMessage(jid, {
            text: `🔎 Procurando: *${pesquisa}*`
        });

        const resultado = await yts(pesquisa);
        const video = resultado.videos[0];

        if (!video) {
            return sock.sendMessage(jid, {
                text: "❌ Não achei essa música."
            });
        }

        if (!fs.existsSync("./temp")) fs.mkdirSync("./temp");

        const id = Date.now();
        const saidaBase = path.join("./temp", `${id}.%(ext)s`);
        const saidaFinal = path.join("./temp", `${id}.mp3`);

        await sock.sendMessage(jid, {
            text:
`╭────〔 🎵 Phelios Music 〕────
│ 🎶 *${video.title}*
│ ⏱️ ${video.timestamp}
│ 👤 ${video.author.name}
╰──── Baixando áudio...`
        });

        await new Promise((resolve, reject) => {
            execFile("py", [
                "-m", "yt_dlp",
                video.url,
                "-x",
                "--audio-format", "mp3",
                "--ffmpeg-location", ffmpegPath,
                "-o", saidaBase,
                "--no-playlist"
            ], (error) => {
                if (error) reject(error);
                else resolve();
            });
        });

        if (!fs.existsSync(saidaFinal)) {
            throw new Error("Arquivo MP3 não foi criado.");
        }

        await sock.sendMessage(jid, {
            audio: fs.readFileSync(saidaFinal),
            mimetype: "audio/mpeg",
            fileName: `${video.title}.mp3`
        });

        fs.unlinkSync(saidaFinal);

    } catch (erro) {
        console.error("ERRO PLAY:", erro);

        await sock.sendMessage(jid, {
            text: "❌ Deu erro no .play. Veja o terminal."
        });
    }
};