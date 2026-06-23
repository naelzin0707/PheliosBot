require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

module.exports.executar = async (sock, msg, args) => {
    const jid = msg.key.remoteJid;

    try {
        const tipo = args[0]?.toLowerCase();
        const descricao = args.slice(1).join(" ").trim();

        if (!tipo) {
            return sock.sendMessage(jid, {
                text:
`🎲 *RPG PheliosBot*

Use:
.rpg personagem descrição
.mapa descrição
.narrar ação`
            });
        }

        if (!descricao) {
            return sock.sendMessage(jid, {
                text: "❌ Escreve uma descrição."
            });
        }

        let prompt;

        if (tipo === "personagem") {
            prompt =
`Crie uma ficha curta de personagem RPG em português.

Descrição:
${descricao}

Formato:
🧙 Nome:
✨ Aparência:
📜 História:
⚔️ Classe:
💖 Personalidade:
🎲 Atributos:
❤️ Vida:
🗡️ Ataque:
🛡️ Defesa:
🔮 Magia:
🌙 Habilidade especial:`;
        } else if (tipo === "mapa") {
            prompt =
`Crie um mapa/local de RPG em português.

Descrição:
${descricao}

Formato:
🗺️ Nome do local:
🌫️ Atmosfera:
📍 Pontos importantes:
⚠️ Perigos:
💰 Tesouros:
❓ Segredo escondido:
🎲 Gancho de aventura:`;
        } else if (tipo === "narrar") {
            prompt =
`Narre uma cena curta de RPG em português.

Ação:
${descricao}

Formato:
📖 Cena:
🎲 Consequência:
⚠️ Perigo:
👉 Próxima escolha:`;
        } else {
            return sock.sendMessage(jid, {
                text: "❌ Tipo inválido. Use: personagem, mapa ou narrar."
            });
        }

        await sock.sendMessage(jid, { text: "🎲 Gerando RPG..." });

        const resposta = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

        await sock.sendMessage(jid, {
            text: resposta.text || "❌ Não consegui criar o RPG."
        });

    } catch (erro) {
        console.error("ERRO RPG:", erro);
        await sock.sendMessage(jid, {
            text: "❌ Deu erro no .rpg. Veja o terminal."
        });
    }
};