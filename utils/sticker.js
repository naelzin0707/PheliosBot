const ffmpeg = require("fluent-ffmpeg");

ffmpeg.setFfmpegPath("ffmpeg");

async function converterImagemParaWebp(entrada, saida) {
    await sharp(entrada)
        .resize(512, 512, {
            fit: "contain",
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .webp({ quality: 90 })
        .toFile(saida);
}

function converterVideoParaWebp(entrada, saida) {
    return new Promise((resolve, reject) => {
        ffmpeg(entrada)
            .outputOptions([
                "-vcodec", "libwebp",
                "-vf", "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000",
                "-loop", "0",
                "-an",
                "-q:v", "80",
                "-preset", "default"
            ])
            .toFormat("webp")
            .save(saida)
            .on("end", resolve)
            .on("error", reject);
    });
}

async function converterParaWebp(entrada, saida, tipo) {
    if (tipo === "image") {
        return converterImagemParaWebp(entrada, saida);
    }

    if (tipo === "video") {
        return converterVideoParaWebp(entrada, saida);
    }

    throw new Error("Tipo de mídia inválido.");
}

module.exports = {
    converterParaWebp
};