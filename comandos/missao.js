const fs = require("fs");

const missoes = [

{
titulo: "Caça aos Goblins",
objetivo: "Eliminar goblins nas redondezas.",
xp: 50,
ouro: 30
},

{
titulo: "Floresta Sombria",
objetivo: "Explorar a floresta proibida.",
xp: 80,
ouro: 50
},

{
titulo: "Bruxa Lunar",
objetivo: "Encontrar a bruxa da lua.",
xp: 120,
ouro: 90
},

{
titulo: "Ruínas Antigas",
objetivo: "Investigar ruínas esquecidas.",
xp: 100,
ouro: 75
}

];

module.exports.executar = async (sock, msg) => {

const jid = msg.key.remoteJid;
const user = msg.key.participant || msg.key.remoteJid;

const dados = JSON.parse(
fs.readFileSync("./database/rpg.json")
);

if (!dados[user]) {
return sock.sendMessage(jid,{
text:"❌ Crie um personagem primeiro."
});
}

const missao =
missoes[Math.floor(Math.random()*missoes.length)];

dados[user].missao = missao;

fs.writeFileSync(
"./database/rpg.json",
JSON.stringify(dados,null,2)
);

await sock.sendMessage(jid,{
text:
`📜 MISSÃO

🏷️ ${missao.titulo}

📖 ${missao.objetivo}

🎁 Recompensa

📚 XP: ${missao.xp}
💰 Ouro: ${missao.ouro}

Use:
.concluir`
});

};