/**
 * sync_complaints.cjs
 * 
 * Agente Inteligente de Sincronización SafeRide (MODO SERVIDOR).
 * Este script actúa como un orquestador entre Gmail y el Admin Panel.
 */

require('dotenv').config();
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');

// Configuración
const PORT = 3001;
const COMPLAINTS_FILE = path.join(__dirname, '../src/data/complaints.json');

// Inicializar Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-lite" });

const imapConfig = {
    user: process.env.SUPPORT_EMAIL || 'saferidefwd@gmail.com',
    password: process.env.SUPPORT_EMAIL_PASSWORD,
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    authTimeout: 10000,
    connTimeout: 10000,
    tlsOptions: { rejectUnauthorized: false }
};

const app = express();
app.use(cors());
app.use(express.json());

// --- LÓGICA DE IA ---
async function processEmailWithAI(mail, uid) {
    const id = `CMP-${Date.now().toString().slice(-4)}-${uid}`;
    const prompt = `
        Actúa como un Analista de Soporte de SafeRide. 
        Analiza el correo y extrae JSON puro:
        Asunto: ${mail.subject} | Mensaje: ${mail.text}
        Esquema: { "category": "Pagos|Conducta|Seguridad|Soporte Técnico", "tripId": "string", "subject": "string", "message": "string" }
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiData = JSON.parse(response.text().replace(/```json/g, '').replace(/```/g, '').trim());
        return {
            id, uid,
            user: mail.from.value[0].name || mail.from.value[0].address.split('@')[0],
            email: mail.from.value[0].address,
            ...aiData,
            fullMessage: mail.text,
            status: "Pendiente",
            createdAt: mail.date || new Date().toISOString()
        };
    } catch (e) {
        return { id, uid, user: "Usuario", email: mail.from.value[0].address, category: "Soporte Técnico", tripId: "N/A", subject: mail.subject, message: mail.text.slice(0, 100), fullMessage: mail.text, status: "Pendiente", createdAt: new Date() };
    }
}

// --- FUNCIONES DEL AGENTE ---
function syncWithGmail(res) {
    const imap = new Imap(imapConfig);
    imap.once('ready', () => {
        imap.openBox('INBOX', false, (err) => {
            if (err) return res?.status(500).json({ error: err.message });
            imap.search(['UNSEEN'], (err, results) => {
                if (!results || !results.length) {
                    fs.writeFileSync(COMPLAINTS_FILE, JSON.stringify([], null, 2));
                    res?.json([]);
                    return imap.end();
                }
                const f = imap.fetch(results, { bodies: '' });
                const complaints = [];
                let completed = 0;
                f.on('message', (msg) => {
                    let uid;
                    msg.once('attributes', (a) => uid = a.uid);
                    msg.on('body', (s) => {
                        simpleParser(s, async (e, m) => {
                            complaints.push(await processEmailWithAI(m, uid));
                            if (++completed === results.length) {
                                fs.writeFileSync(COMPLAINTS_FILE, JSON.stringify(complaints, null, 2));
                                res?.json(complaints);
                                imap.end();
                            }
                        });
                    });
                });
            });
        });
    });
    imap.once('error', (e) => res?.status(500).json({ error: e.message }));
    imap.connect();
}

// --- ENDPOINTS ---
app.get('/api/sync', (req, res) => {
    console.log('🔄 Sincronizando...');
    syncWithGmail(res);
});

app.post('/api/resolve/:uid', (req, res) => {
    const uid = parseInt(req.params.uid);
    const imap = new Imap(imapConfig);
    imap.once('ready', () => {
        imap.openBox('INBOX', false, () => {
            imap.addFlags(uid, ['\\Seen'], (err) => {
                imap.end();
                if (err) return res.status(500).json({ error: err.message });
                console.log(`✅ UID ${uid} resuelto.`);
                res.json({ success: true });
            });
        });
    });
    imap.connect();
});

app.listen(PORT, () => {
    console.log(`🤖 Servidor Agente SafeRide en http://localhost:${PORT}`);
    console.log(`📡 Modo Autopiloto: Sincronizando con Gmail cada 5 minutos...`);

    // Sincronización inicial
    syncWithGmail();

    // Sincronización automática cada 5 minutos
    setInterval(() => {
        console.log('⏰ [Autopiloto] Iniciando sincronización periódica...');
        syncWithGmail();
    }, 300000);
});
