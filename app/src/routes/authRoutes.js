import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import enviarEmail from '../services/emailService.js';
import Usuario from '../models/Usuario.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Autenticação
 *   description: Rotas para registro e login de usuários
 */

/**
 * @swagger
 * /auth/registro:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovoUsuario'
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Mensagem'
 *       400:
 *         description: Erro de validação ao registrar usuário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.post('/registro', async (req, res) => {
    const { nome, email, senha } = req.body;
    const novoUsuario = new Usuario(req.body);
    await novoUsuario.save();

    // Enviar e-mail de boas-vindas
    const assunto = 'Bem-vindo à nossa API de Tarefas!';
    const corpo = `<h1>Olá, ${nome}!</h1><p>Seu cadastro foi realizado com sucesso.</p>`;
    await enviarEmail(email, assunto, corpo);

    res.status(201).json({ mensagem: "Usuário registrado com sucesso!" });
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Autentica um usuário e retorna um token JWT
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       500:
 *         description: Erro interno ao fazer login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    const usuario = await Usuario.findOne({ email }).select('+senha');

    if (!usuario || !await bcrypt.compare(senha, usuario.senha)) {
        return res.status(401).json({ erro: "Credenciais inválidas." });
    }

    const token = jwt.sign(
        { id: usuario._id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.json({ token });
});

export default router;