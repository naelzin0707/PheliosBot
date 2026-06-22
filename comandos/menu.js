const fs = require("fs");

const config = require("../config");

module.exports.executar = async (sock, msg) => {

    const jid = msg.key.remoteJid;

    const menu = `
╭━━━〔 🌈 *${config.nomeBot}* 〕━━━╮
┃ ✨ Seu bot favorito
╰━━━━━━━━━━━━━━━━━━━━╯

📚 *INFORMAÇÕES*
┃ ℹ️ .info
┃ 📜 .menu

🖼️ *FIGURINHAS*
┃ ✨ .s
┃ ✨ .sticker

🎵 *MÚSICA*
┃ 🎧 .play

👮 *ADMINISTRAÇÃO*
┃ 🚫 .ban
┃ 👑 .promote
┃ 🧹 .demote
┃ 🔇 .grupo f
┃ 🔊 .grupo a
┃ 🔒 .cmdadm on
┃ 🔓 .cmdadm off

🛡️ *PROTEÇÃO*
┃ 🔗 .protecao antilink on/off
┃ 👤 .protecao antifake on/off
┃ 🔞 .protecao antiporn on/off

🌈 *BEM-VINDO*
┃ 💖 .bemvindo
┃ 📝 .bemvindo msg
┃ 🖼️ .bemvindo foto

💔 *SAÍDA*
┃ 💔 .saida
┃ 📝 .saida msg
┃ 🖼️ .saida foto

💕 *RELACIONAMENTOS*
┃ 💖 .namorar
┃ 💍 .casar
┃ ✅ .aceitar
┃ ❌ .recusar
┃ ❤️ .meuamor

💋 *INTERAÇÕES*
┃ 💋 .beijo
┃ 🤗 .abraco
┃ 🤝 .dedinho
┃ 👅 .lamber
┃ 🍑 .popo
┃ 😈 .come
┃ 👋 .tapa
┃ 🪂 .penhasco

🧹 *UTILIDADES*
┃ 🗑️ .d
┃ 🗑️ .delete

╭━━━━━━━━━━━━━━━━━━━━╮
┃ 👑 Dono: ${config.dono}
┃ 📦 Versão: ${config.versao}
┃ 🌈 Prefixo: ${config.prefix}
╰━━━━━━━━━━━━━━━━━━━━╯
`;

    if (fs.existsSync("./midia/menu.jpg")) {

        return await sock.sendMessage(jid, {
            image: fs.readFileSync("./midia/menu.jpg"),
            caption: menu
        });

    }

    await sock.sendMessage(jid, {
        text: menu
    });
};