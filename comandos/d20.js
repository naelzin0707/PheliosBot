module.exports.executar = async (sock, msg) => {

    const jid = msg.key.remoteJid;
    const user = msg.key.participant || msg.key.remoteJid;

    const dado = Math.floor(Math.random() * 20) + 1;

    let resultado = "";

    if (dado === 20) {
        resultado =
`🎲 D20

✨ CRÍTICO ABSURDO!

Resultado:
20

Os deuses do RPG acabaram de te beijar na boca.`;
    }

    else if (dado >= 15) {
        resultado =
`🎲 D20

✅ SUCESSO

Resultado:
${dado}`;
    }

    else if (dado >= 10) {
        resultado =
`🎲 D20

🤔 SUCESSO PARCIAL

Resultado:
${dado}`;
    }

    else if (dado >= 2) {
        resultado =
`🎲 D20

❌ FALHA

Resultado:
${dado}`;
    }

    else {
        resultado =
`🎲 D20

💀 FALHA CRÍTICA

Resultado:
1

Parabéns.
Você tropeçou na própria existência.`;
    }

    await sock.sendMessage(jid, {
        text: resultado,
        mentions: [user]
    });
};