module.exports.executar = async (sock, msg, args) => {
    const deletar = require("./d");
    return deletar.executar(sock, msg, args);
};