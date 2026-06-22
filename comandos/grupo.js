function ehAdmin(p) {
    return p?.admin === "admin" || p?.admin === "superadmin";
}

function limparNumero(id = "") {
    return id
        .replace(/:\d+/g, "")
        .replace("@s.whatsapp.net", "")
        .replace("@lid", "");
}

module.exports.executar = async (sock, msg, args) => {

    const jid = msg.key.remoteJid;

    if (!jid.endsWith("@g.us")) {
        return sock.sendMessage(jid, {
            text: "❌ Esse comando só funciona em grupos."
        });
    }

    try {

        const metadata = await sock.groupMetadata(jid);

        const participantes = metadata.participants;

        const sender = msg.key.participant;

        const user = participantes.find(
            p => limparNumero(p.id) === limparNumero(sender)
        );

        if (!ehAdmin(user)) {
            return sock.sendMessage(jid, {
                text: "❌ Só admins podem usar este comando."
            });
        }

        const opcao = args[0]?.toLowerCase();

        if (!opcao) {
            return sock.sendMessage(jid, {
                text:
`⚙️ *Controle do Grupo*

🔇 .grupo f → Fecha o grupo
🔊 .grupo a → Abre o grupo`
            });
        }

        if (opcao === "f") {

            await sock.groupSettingUpdate(
                jid,
                "announcement"
            );

            return sock.sendMessage(jid, {
                text: "🔇 Grupo fechado. Apenas admins podem enviar mensagens."
            });

        }

        if (opcao === "a") {

            await sock.groupSettingUpdate(
                jid,
                "not_announcement"
            );

            return sock.sendMessage(jid, {
                text: "🔊 Grupo aberto. Todos podem enviar mensagens."
            });

        }

        return sock.sendMessage(jid, {
            text: "❌ Use *.grupo f* ou *.grupo a*"
        });

    } catch (erro) {

        console.error("ERRO GRUPO:", erro);

        await sock.sendMessage(jid, {
            text: "❌ Não consegui alterar as configurações do grupo."
        });

    }

};