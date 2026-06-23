const fs = require("fs");

function xpNecessario(nivel){
return nivel * 100;
}

module.exports.executar = async (sock,msg)=>{

const jid = msg.key.remoteJid;
const user = msg.key.participant || msg.key.remoteJid;

const dados = JSON.parse(
fs.readFileSync("./database/rpg.json")
);

const p = dados[user];

if(!p){
return sock.sendMessage(jid,{
text:"❌ Você não possui personagem."
});
}

if(!p.missao){
return sock.sendMessage(jid,{
text:"❌ Você não possui missão ativa."
});
}

const missao = p.missao;

p.xp += missao.xp;
p.ouro += missao.ouro;

let upou = false;

while(p.xp >= xpNecessario(p.nivel)){

p.xp -= xpNecessario(p.nivel);

p.nivel++;

p.vidaMax += 10;
p.vida = p.vidaMax;

p.ataque += 2;
p.defesa += 1;
p.magia += 1;

upou = true;
}

p.missao = null;

dados[user] = p;

fs.writeFileSync(
"./database/rpg.json",
JSON.stringify(dados,null,2)
);

let texto =
`✅ MISSÃO CONCLUÍDA

📚 XP ganho: ${missao.xp}
💰 Ouro ganho: ${missao.ouro}`;

if(upou){

texto +=

`

🌟 LEVEL UP

⭐ Nível ${p.nivel}

❤️ Vida +10
⚔️ Ataque +2
🛡️ Defesa +1
🔮 Magia +1`;
}

await sock.sendMessage(jid,{
text:texto
});

};