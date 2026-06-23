require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

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