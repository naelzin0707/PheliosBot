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
`🖼️ *RPG IMAGEM*

Use:

.rpgimagem personagem descrição
.rpgimagem mapa descrição
.rpgimagem monstro descrição`
            });
        }

        if (!descricao) {
            return sock.sendMessage(jid, {
                text: "❌ Escreva uma descrição.\n\nExemplo:\n.rpgimagem personagem elfo lunar com magia roxa"
            });
        }

        await sock.sendMessage(jid, {
            text: "🎨 Gerando imagem RPG..."
        });

        let prompt = "";

        if (tipo === "personagem") {
            prompt =
`Crie uma imagem de personagem de RPG fantasia.

Descrição:
${descricao}

Estilo: concept art de RPG, fantasia épica, anime semi-realista, detalhado, iluminação mágica, fundo bonito, visual dramático, alta qualidade.`;
        } else if (tipo === "mapa") {
            prompt =
`Crie uma imagem de mapa/local de RPG fantasia.

Descrição:
${descricao}

Estilo: mapa de aventura, fantasia, atmosfera mágica, detalhes visuais claros, local explorável, cinematográfico, alta qualidade.`;
        } else if (tipo === "monstro") {
            prompt =
`Crie uma imagem de monstro de RPG fantasia.

Descrição:
${descricao}

Estilo: criatura fantástica, design original, ameaçador, detalhado, concept art, iluminação dramática, alta qualidade.`;
        } else {
            return sock.sendMessage(jid, {
                text: "❌ Tipo inválido.\n\nUse: personagem, mapa ou monstro."
            });
        }

        const resposta = await ai.interactions.create({
            model: "gemini-3.1-flash-image-preview",
            input: prompt,
            response_format: {
                type: "image",
                aspect_ratio: "1:1",
                image_size: "1K"
            }
        });

        if (!resposta.output_image?.data) {
            return sock.sendMessage(jid, {
                text: "❌ O Gemini não retornou imagem. Talvez sua chave/modelo não tenha acesso a imagem."
            });
        }

        const imagem = Buffer.from(resposta.output_image.data, "base64");

        await sock.sendMessage(jid, {
            image: imagem,
            caption:
`🖼️ *RPG IMAGEM*
Tipo: ${tipo}

${descricao}`
        });

    } catch (erro) {
        console.error("ERRO RPG IMAGEM:", erro);

        await sock.sendMessage(jid, {
            text: "❌ Deu erro no .rpgimagem. Veja o terminal."
        });
    }
};