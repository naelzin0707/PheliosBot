const fs = require("fs");
const webpmux = require("node-webpmux");

async function adicionarExif(arquivo, pack, autor) {
    const img = new webpmux.Image();

    await img.load(arquivo);

    const json = {
        "sticker-pack-id": "com.phelios.bot",
        "sticker-pack-name": pack,
        "sticker-pack-publisher": autor,
        emojis: ["✨"]
    };

    const exifAttr = Buffer.from([
        0x49, 0x49, 0x2A, 0x00,
        0x08, 0x00, 0x00, 0x00,
        0x01, 0x00,
        0x41, 0x57,
        0x07, 0x00
    ]);

    const jsonBuffer = Buffer.from(JSON.stringify(json), "utf8");
    const exif = Buffer.concat([exifAttr, jsonBuffer]);

    img.exif = exif;

    await img.save(arquivo);
}

module.exports = {
    adicionarExif
};