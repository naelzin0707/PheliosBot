module.exports.executar = async (sock, msg, args) => {
    const sticker = require("./sticker");
    return sticker.executar(sock, msg, args);
};