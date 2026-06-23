module.exports.executar = async (sock, msg) => {
    const jid = msg.key.remoteJid;

    await sock.sendMessage(jid, {
        text:
`🏪 *LOJA RPG*

1️⃣ Espada de Ferro
💰 100 ouro
⚔️ +5 ataque

2️⃣ Armadura de Couro
💰 120 ouro
🛡️ +5 defesa

3️⃣ Cajado Arcano
💰 140 ouro
🔮 +6 magia

4️⃣ Poção de Vida
💰 35 ouro
❤️ Recupera 40 de vida

Use:
.comprar 1
.comprar 2
.comprar 3
.comprar 4`
    });
};