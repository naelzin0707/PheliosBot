const fs = require("fs");

const arquivo = "./database/velha.json";

function carregar() {
    if (!fs.existsSync("./database")) fs.mkdirSync("./database");

    if (!fs.existsSync(arquivo)) {
        fs.writeFileSync(arquivo, JSON.stringify({}, null, 2));
    }

    const conteudo = fs.readFileSync(arquivo, "utf8");

    if (!conteudo.trim()) {
        fs.writeFileSync(arquivo, JSON.stringify({}, null, 2));
        return {};
    }

    return JSON.parse(conteudo);
}

function salvar(dados) {
    fs.writeFileSync(arquivo, JSON.stringify(dados, null, 2));
}

function tabuleiroTexto(tab) {
    return (
`🎮 JOGO DA VELHA

${tab[0]} ⬜ ${tab[1]} ⬜ ${tab[2]}

${tab[3]} ⬜ ${tab[4]} ⬜ ${tab[5]}

${tab[6]} ⬜ ${tab[7]} ⬜ ${tab[8]}`
    );
}

function verificarVencedor(tab) {
    const linhas = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    for (const [a, b, c] of linhas) {
        if (tab[a] === tab[b] && tab[b] === tab[c]) {
            return tab[a];
        }
    }

    if (tab.every(casa => casa === "❌" || casa === "⭕")) {
        return "empate";
    }

    return null;
}

module.exports = {
    carregar,
    salvar,
    tabuleiroTexto,
    verificarVencedor
};