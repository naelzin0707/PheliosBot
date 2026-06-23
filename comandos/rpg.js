require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports.executar = async (sock, msg, args) => {
    const jid = msg.key.remoteJid;

    try {
        const tipo = args[0]?.toLowerCase();
        const descricao = args.slice(1).join(" ").trim();

        if (!process.env.GEMINI_API_KEY) {
            return sock.sendMessage(jid, {
                text: "❌ GEMINI_API_KEY não encontrada no .env."
            });
        }

        if (!tipo) {
            return sock.sendMessage(jid, {
                text:
`🎲 *RPG IA*

Use:

.rpg personagem descrição
.rpg mapa descrição
.rpg narrar ação`
            });
        }

        if (!["personagem", "mapa", "narrar"].includes(tipo)) {
            return sock.sendMessage(jid, {
                text: "❌ Tipo inválido.\n\nUse: personagem, mapa ou narrar."
            });
        }

        if (!descricao) {
            return sock.sendMessage(jid, {
                text: `❌ Escreva uma descrição.\n\nExemplo:\n.rpg ${tipo} descrição aqui`
            });
        }

        await sock.sendMessage(jid, {
            text: "🎲 Gerando RPG com IA..."
        });

        let prompt = "";

        if (tipo === "personagem") {
            prompt =
`Crie uma ficha curta de personagem de RPG em português brasileiro.

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
        }

        if (tipo === "mapa") {
            prompt =
`Crie um mapa/local de RPG em português brasileiro.

Descrição:
${descricao}

Formato:
🗺️ Nome do local:
🌫️ Atmosfera:
📍 Pontos importantes:
👹 Perigos:
🎁 Tesouros:
🧩 Segredo escondido:
🎲 Gancho de aventura:`;
        }

        if (tipo === "narrar") {
            prompt =
`Narre uma cena curta de RPG em português brasileiro.

Ação:
${descricao}

Formato:
📖 Cena:
🎲 Consequência:
⚠️ Perigo:
👉 Próxima escolha:`;
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash"
        });

        const result = await model.generateContent(prompt);
        const texto = result.response.text();

        await sock.sendMessage(jid, {
            text: texto || "❌ Não consegui gerar o RPG."
        });

    } catch (erro) {
        console.error("ERRO RPG:", erro);

        await sock.sendMessage(jid, {
            text: "❌ Deu erro no .rpg. Veja o terminal."
        });
    }
};