const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason,
    Browsers
} = require("@whiskeysockets/baileys");

const { Boom } = require("@hapi/boom");
const P = require("pino");
const fs = require("fs");
const path = require("path");
const qrcode = require("qrcode-terminal");

const config = require("./config");

const arquivoBemVindo = "./database/bemvindo.json";
const arquivoSaida = "./database/saida.json";
const arquivoCmdAdm = "./database/cmdadm.json";
const arquivoProtecao = "./database/protecao.json";

function garantirDatabase() {
    if (!fs.existsSync("./database")) fs.mkdirSync("./database");
}

function carregarJson(arquivo) {
    garantirDatabase();

    if (!fs.existsSync(arquivo)) {
        fs.writeFileSync(arquivo, JSON.stringify({}, null, 2));
    }

    return JSON.parse(fs.readFileSync(arquivo));
}

function limparNumero(id = "") {
    return id
        .replace(/:\d+/g, "")
        .replace("@s.whatsapp.net", "")
        .replace("@lid", "")
        .replace("@g.us", "");
}

function ehAdmin(p) {
    return p?.admin === "admin" || p?.admin === "superadmin";
}

function pegarJidParticipante(participante) {
    if (typeof participante === "string") return participante;

    return (
        participante?.id ||
        participante?.jid ||
        participante?.participant ||
        participante?.phoneNumber ||
        ""
    );
}

function prepararMensagem(texto, participante) {
    const jidParticipante = pegarJidParticipante(participante);
    const numero = jidParticipante.split("@")[0];

    return texto.replace(/@user/g, `@${numero}`);
}

function temLink(texto = "") {
    return /(https?:\/\/|www\.|chat\.whatsapp\.com|wa\.me\/|t\.me\/|discord\.gg|discord\.com|\.com|\.net|\.org|\.gg|\.br)/i.test(texto);
}

function temPorn(texto = "") {
    return /(xvideos|pornhub|redtube|xnxx|onlyfans|privacy|pack|nudes|nude|porno|pornô|porn|sexo|sex|putaria|gore|cp)/i.test(texto);
}

async function enviarMensagemEvento(sock, jid, participante, configGrupo) {
    const jidParticipante = pegarJidParticipante(participante);

    if (!jidParticipante) return;

    const mensagem = prepararMensagem(configGrupo.mensagem, participante);

    if (configGrupo.imagem && fs.existsSync(configGrupo.imagem)) {
        await sock.sendMessage(jid, {
            image: fs.readFileSync(configGrupo.imagem),
            caption: mensagem,
            mentions: [jidParticipante]
        });
    } else {
        await sock.sendMessage(jid, {
            text: mensagem,
            mentions: [jidParticipante]
        });
    }
}

async function iniciarBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./auth");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        browser: Browsers.windows("Chrome"),
        logger: P({ level: "silent" }),
        printQRInTerminal: false
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", ({ connection, qr, lastDisconnect }) => {
        if (qr) {
            console.clear();
            console.log("📱 Escaneie o QR:");
            qrcode.generate(qr, { small: true });
        }

        if (connection === "open") {
            console.clear();
            console.log("✅ PheliosBot conectado!");
        }

        if (connection === "close") {
            const reconnect =
                new Boom(lastDisconnect?.error).output.statusCode !==
                DisconnectReason.loggedOut;

            if (reconnect) {
                console.log("🔄 Reconectando...");
                iniciarBot();
            }
        }
    });

    sock.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type !== "notify") return;

        const msg = messages[0];
        if (!msg.message) return;

        const jid = msg.key.remoteJid;

        const texto =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            msg.message.imageMessage?.caption ||
            msg.message.videoMessage?.caption ||
            "";

        if (jid.endsWith("@g.us")) {
            const protecao = carregarJson(arquivoProtecao);
            const configGrupo = protecao[jid];

            if (configGrupo) {
                const metadata = await sock.groupMetadata(jid);
                const sender = msg.key.participant;
                const senderNumero = limparNumero(sender);

                const user = metadata.participants.find(p =>
                    limparNumero(p.id) === senderNumero ||
                    limparNumero(p.phoneNumber) === senderNumero
                );

                const admin = ehAdmin(user);

                if (!admin) {
                    if (configGrupo.antilink && temLink(texto)) {
                        try {
                            await sock.sendMessage(jid, { delete: msg.key });
                            await sock.groupParticipantsUpdate(jid, [sender], "remove");

                            await sock.sendMessage(jid, {
                                text: `🚨 Link detectado!\n\n@${senderNumero} foi removido automaticamente.`,
                                mentions: [sender]
                            });

                            return;
                        } catch (erro) {
                            console.error("ERRO ANTILINK:", erro);
                        }
                    }

                    if (configGrupo.antiporn && temPorn(texto)) {
                        try {
                            await sock.sendMessage(jid, { delete: msg.key });
                            await sock.groupParticipantsUpdate(jid, [sender], "remove");

                            await sock.sendMessage(jid, {
                                text: `🔞 Conteúdo proibido detectado!\n\n@${senderNumero} foi removido automaticamente.`,
                                mentions: [sender]
                            });

                            return;
                        } catch (erro) {
                            console.error("ERRO ANTIPORN:", erro);
                        }
                    }
                }
            }
        }

        if (!texto.startsWith(config.prefix)) return;

        const args = texto
            .slice(config.prefix.length)
            .trim()
            .split(/ +/);

        const comando = args.shift().toLowerCase();

        console.log("📥 Comando recebido:", comando);

        const caminho = path.join(__dirname, "comandos", `${comando}.js`);

        if (!fs.existsSync(caminho)) {
            console.log("❌ Comando não encontrado.");
            return;
        }

        try {
            if (jid.endsWith("@g.us")) {
                const dadosCmdAdm = carregarJson(arquivoCmdAdm);

                if (dadosCmdAdm[jid]) {
                    const metadata = await sock.groupMetadata(jid);
                    const sender = msg.key.participant;
                    const senderNumero = limparNumero(sender);

                    const user = metadata.participants.find(p =>
                        limparNumero(p.id) === senderNumero ||
                        limparNumero(p.phoneNumber) === senderNumero
                    );

                    if (!ehAdmin(user)) return;
                }
            }

            delete require.cache[require.resolve(caminho)];

            const cmd = require(caminho);

            await cmd.executar(sock, msg, args);
        } catch (erro) {
            console.error(erro);

            await sock.sendMessage(jid, {
                text: "❌ Ocorreu um erro ao executar este comando."
            });
        }
    });

    sock.ev.on("group-participants.update", async (update) => {
        try {
            const jid = update.id;

            if (update.action === "add") {
                const protecao = carregarJson(arquivoProtecao);
                const configProtecao = protecao[jid];

                if (configProtecao?.antifake) {
                    for (const participante of update.participants) {
                        const jidParticipante = pegarJidParticipante(participante);
                        const numero = limparNumero(jidParticipante);

                        if (!numero.startsWith("55")) {
                            await sock.groupParticipantsUpdate(jid, [jidParticipante], "remove");

                            await sock.sendMessage(jid, {
                                text: `👤 Antifake ativado!\n\n@${numero} foi removido por não ser número brasileiro.`,
                                mentions: [jidParticipante]
                            });

                            return;
                        }
                    }
                }

                const dados = carregarJson(arquivoBemVindo);
                const configGrupo = dados[jid];

                if (!configGrupo || !configGrupo.ativo) return;

                for (const participante of update.participants) {
                    await enviarMensagemEvento(sock, jid, participante, configGrupo);
                }
            }

            if (update.action === "remove") {
                const dados = carregarJson(arquivoSaida);
                const configGrupo = dados[jid];

                if (!configGrupo || !configGrupo.ativo) return;

                for (const participante of update.participants) {
                    await enviarMensagemEvento(sock, jid, participante, configGrupo);
                }
            }

        } catch (erro) {
            console.error("ERRO EVENTO DE GRUPO:", erro);
        }
    });
}

iniciarBot().catch(console.error);