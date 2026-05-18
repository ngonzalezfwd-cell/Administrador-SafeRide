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
const nodemailer = require('nodemailer');

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

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL
    auth: {
        user: process.env.SUPPORT_EMAIL || 'saferidefwd@gmail.com',
        pass: process.env.SUPPORT_EMAIL_PASSWORD,
    },
});

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

app.post('/api/reply', async (req, res) => {
    const { to, subject, message } = req.body;
    
    if (!to || !subject || !message) {
        return res.status(400).json({ error: 'Faltan destinatario, asunto o mensaje.' });
    }

    try {
        const mailOptions = {
            from: `"Soporte SafeRide" <${process.env.SUPPORT_EMAIL || 'saferidefwd@gmail.com'}>`,
            to: to,
            subject: `Re: ${subject}`,
            text: message,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
                    <div style="background: #2563EB; color: white; padding: 15px 20px; border-radius: 8px 8px 0 0;">
                        <h2 style="margin: 0; font-size: 18px;">Respuesta de Soporte SafeRide</h2>
                    </div>
                    <div style="padding: 20px; border: 1px solid #E2E8F0; border-top: none; border-radius: 0 0 8px 8px; background: #F8FAFC;">
                        <p style="white-space: pre-wrap; font-size: 15px; color: #1E293B;">${message}</p>
                        <hr style="border: 0; border-top: 1px solid #E2E8F0; margin: 20px 0;">
                        <p style="font-size: 12px; color: #64748B;">Este es un correo automático enviado en respuesta a su reporte. Por favor no responda directamente a este mensaje.</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`✉️ Correo de respuesta enviado a ${to}`);
        res.json({ success: true, message: 'Correo enviado con éxito.' });
    } catch (err) {
        console.error('Error al enviar correo de respuesta:', err);
        res.status(500).json({ error: err.message });
    }
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
