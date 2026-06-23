const fs = require("fs");
const config = require("../config");

module.exports.executar = async (sock, msg, args) => {
    const jid = msg.key.remoteJid;
    const categoria = args[0]?.toLowerCase();

    const menus = {
        principal:
`╭━━━〔 🌙 *PHELIOSBOT* 〕━━━╮
┃ 🤖 Versão: ${config.versao}
┃ 🌈 Prefixo: ${config.prefix}
┃ 👑 Dono: ${config.dono}
╰━━━━━━━━━━━━━━━━━━━━╯

📚 *.menu geral*
👮 *.menu adm*
🎮 *.menu jogos*
💋 *.menu interacoes*
⚔️ *.menu rpg*

╭━━━━━━━━━━━━━━━━━━━━╮
┃ Digite uma categoria acima.
╰━━━━━━━━━━━━━━━━━━━━╯`,

        geral:
`📚 *MENU GERAL*

ℹ️ .info
📜 .menu
🎵 .play
✨ .s
✨ .sticker
🏷️ .take
📣 .marcar mensagem
🗑️ .d
🗑️ .delete
🤖 .gemini pergunta`,

        adm:
`👮 *MENU ADMINISTRAÇÃO*

🚫 .ban @pessoa
👑 .promote @pessoa
📉 .demote @pessoa
🔒 .cmdadm on
🔓 .cmdadm off

🛡️ *PROTEÇÃO*
🔗 .protecao antilink on/off
👤 .protecao antifake on/off
🔞 .protecao antiporn on/off

🚫 .listanegra add @pessoa
✅ .listanegra del @pessoa
📋 .listanegra listar

🌈 *ENTRADA/SAÍDA*
💖 .bemvindo on/off
📝 .bemvindo msg texto
🖼️ .bemvindo foto

💔 .saida on/off
📝 .saida msg texto
🖼️ .saida foto

🔇 .grupo f
🔊 .grupo a`,

        jogos:
`🎮 *MENU JOGOS*

🎲 .ppp
❌ .velha @pessoa
✅ .aceitarvelha
❌ .recusarvelha

💕 *RELACIONAMENTOS*
💘 .namorar @pessoa
💍 .casar @pessoa
✅ .aceitar
❌ .recusar
❤️ .meuamor`,

        interacoes:
`💋 *MENU INTERAÇÕES*

💋 .beijo @pessoa
🤗 .abraco @pessoa
🤝 .dedinho @pessoa
👅 .lamber @pessoa
🍑 .popo @pessoa
😈 .come @pessoa
👋 .tapa @pessoa
🪂 .penhasco @pessoa
🍅 .tomate @pessoa
🧽 .lavarlouca @pessoa

📢 *STATUS*
💤 .ausente motivo
😂 .ativo`,

        rpg:
`⚔️ *MENU RPG*

🎲 .d20
🧙 .criarpersonagem classe
👤 .perfil
⚔️ .caçar
🛌 .descansar
🎒 .inventario
📜 .missao
✅ .concluir
🏆 .rankrpg
🏪 .loja
💰 .comprar número

🤖 *IA RPG*
🧠 .rpg personagem descrição
🗺️ .rpg mapa descrição
📖 .rpg narrar ação
🖼️ .rpgimagem personagem descrição`
    };

    const menu = menus[categoria] || menus.principal;

    if (fs.existsSync("./midia/menu.jpg")) {
        return sock.sendMessage(jid, {
            image: fs.readFileSync("./midia/menu.jpg"),
            caption: menu
        });
    }

    await sock.sendMessage(jid, {
        text: menu
    });
};