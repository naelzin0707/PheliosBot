const rpg = require("./rpg");

module.exports.executar = async (sock, msg, args) => {
    return rpg.executar(sock, msg, ["narrar", ...args]);
};