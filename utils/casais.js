const fs = require("fs");

const arquivo = "./database/casais.json";

function carregar() {
    if (!fs.existsSync("./database")) fs.mkdirSync("./database");
    if (!fs.existsSync(arquivo)) fs.writeFileSync(arquivo, JSON.stringify({}, null, 2));
    return JSON.parse(fs.readFileSync(arquivo));
}

function salvar(dados) {
    fs.writeFileSync(arquivo, JSON.stringify(dados, null, 2));
}

function tempoDesde(inicio) {
    const diff = Date.now() - inicio;
    const dias = Math.floor(diff / 86400000);
    const horas = Math.floor(diff / 3600000) % 24;
    const minutos = Math.floor(diff / 60000) % 60;
    return `${dias} dias, ${horas} horas e ${minutos} minutos`;
}

module.exports = { carregar, salvar, tempoDesde };