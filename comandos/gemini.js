require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports.executar = async (sock, msg, args) => {
    const jid = msg.key.remoteJid;

    try {
        const pergunta = args.join(" ").trim();

        if (!process.env.GEMINI_API_KEY) {
            return sock.sendMessage(jid, {
                text: "❌ GEMINI_API_KEY não encontrada no .env."
            });
        }

        if (!pergunta) {
            return sock.sendMessage(jid, {
                text: "🤖 Use assim:\n\n.gemini sua pergunta"
            });
        }

        await sock.sendMessage(jid, {
            text: "🧠 Pensando..."
        });

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash"
        });

        const result = await model.generateContent(pergunta);
        const texto = result.response.text();

        await sock.sendMessage(jid, {
            text: texto || "❌ Não consegui responder."
        });

    } catch (erro) {
        console.error("ERRO GEMINI:", erro);

        await sock.sendMessage(jid, {
            text: "❌ Deu erro no Gemini. Veja o terminal."
        });
    }
};