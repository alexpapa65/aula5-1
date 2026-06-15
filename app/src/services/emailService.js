import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import logger from '../config/logger.js';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const enviarEmail = async (destinatario, assunto, corpo) => {
    try {
        await transporter.sendMail({
            from: `"API de Tarefas" <${process.env.EMAIL_FROM}>`,
            to: destinatario,
            subject: assunto,
            html: corpo,
        });
        logger.info(`[EMAIL] E-mail enviado para ${destinatario}`);
    } catch (err) {
        logger.error(`[EMAIL] Erro ao enviar e-mail: ${err.message}`);
    }
};

export default enviarEmail;