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
.rpg mapa descrição
.rpg narrar ação`
            });
        }

        if (!descricao) {
            return sock.sendMessage(jid, {
                text: "❌ Escreva uma descrição.\n\nExemplo:\n.rpg personagem mago lunar misterioso"
            });
        }

        await sock.sendMessage(jid, {
            text: "🎲 Criando conteúdo de RPG..."
        });

        let prompt = "";

        if (tipo === "personagem") {
            prompt =
`Crie uma ficha curta de personagem de RPG em português brasileiro.

Descrição base:
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
🌙 Habilidade especial:

Tom: criativo, dramático, mágico e estiloso.`;
        } else if (tipo === "mapa") {
            prompt =
`Crie um local/mapa de RPG em português brasileiro.

Descrição base:
${descricao}

Formato:
🗺️ Nome do local:
🌫️ Atmosfera:
📍 Pontos importantes:
👹 Perigos:
🎁 Tesouros:
🧩 Segredo escondido:
🎲 Gancho de aventura:

Tom: fantasia, mistério e aventura.`;
        } else if (tipo === "narrar") {
            prompt =
`Narre uma cena curta de RPG em português brasileiro.

Ação do jogador:
${descricao}

Formato:
📖 Cena:
🎲 Consequência:
⚠️ Perigo:
👉 Próxima escolha:

Tom: narrador mestre de RPG, envolvente e cinematográfico.`;
        } else {
            return sock.sendMessage(jid, {
                text: "❌ Tipo inválido.\n\nUse: personagem, mapa ou narrar."
            });
        }

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