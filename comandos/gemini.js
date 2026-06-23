require("dotenv").config({ override: true });

const { GoogleGenAI } = require("@google/genai");

function criarAI() {
    return new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY.trim()
    });
}

module.exports.executar = async (sock, msg, args) => {
    const jid = msg.key.remoteJid;

    try {
        const pergunta = args.join(" ").trim();

        if (!pergunta) {
            return sock.sendMessage(jid, {
                text: "🤖 Use assim:\n.gemini sua pergunta"
            });
        }

        await sock.sendMessage(jid, { text: "🧠 Pensando..." });

        const ai = criarAI();

        const resposta = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: pergunta
        });

        await sock.sendMessage(jid, {
            text: resposta.text || "❌ Não consegui responder."
        });

    } catch (erro) {
        console.error("ERRO GEMINI:", erro);

        await sock.sendMessage(jid, {
            text: "❌ Deu erro no Gemini. Veja o terminal."
        });
    }
};