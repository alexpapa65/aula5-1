import express from 'express';

import upload from '../config/multer.js';
import Tarefa from '../models/Tarefa.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tarefas
 *   description: Rotas para gerenciamento de tarefas
 */

router.use(authMiddleware);

/**
 * @swagger
 * /tarefas:
 *   get:
 *     summary: Lista todas as tarefas do usuário autenticado
 *     tags: [Tarefas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tarefas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tarefa'
 *       500:
 *         description: Erro ao buscar tarefas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.get('/', async (req, res) => {
    const tarefas = await Tarefa.find({ usuario: req.usuarioId })
        .populate('usuario');
    res.json(tarefas);
});

/**
 * @swagger
 * /tarefas/usuario/{usuarioId}:
 *   get:
 *     summary: Lista tarefas de um usuário específico
 *     tags: [Tarefas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Lista de tarefas do usuário retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tarefa'
 *       500:
 *         description: Erro ao buscar tarefas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.get('/usuario/:usuarioId', async (req, res) => {
    const tarefas = await Tarefa.find({ usuario: req.params.usuarioId })
        .populate('usuario')
        .populate('anexo');
    res.json(tarefas);
});

/**
 * @swagger
 * /tarefas/{id}:
 *   get:
 *     summary: Busca uma tarefa por ID
 *     tags: [Tarefas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da tarefa
 *     responses:
 *       200:
 *         description: Tarefa encontrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tarefa'
 *       404:
 *         description: Tarefa não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       500:
 *         description: Erro ao buscar tarefa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.get('/:id', async (req, res) => {
    const tarefa = await Tarefa.findById(req.params.id)
        .populate('usuario');

    if (!tarefa) {
        return res.status(404).json({ erro: "Tarefa não encontrada." });
    }

    res.json(tarefa);
});

/**
 * @swagger
 * /tarefas:
 *   post:
 *     summary: Cria uma nova tarefa para o usuário autenticado
 *     tags: [Tarefas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovaTarefa'
 *     responses:
 *       201:
 *         description: Tarefa criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tarefa'
 *       400:
 *         description: Erro de validação ao criar tarefa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.post('/', async (req, res) => {
    const novaTarefa = new Tarefa({ ...req.body, usuario: req.usuarioId });
    await novaTarefa.save();
    res.status(201).json(novaTarefa);
});

/**
 * @swagger
 * /tarefas/{id}:
 *   put:
 *     summary: Atualiza uma tarefa existente
 *     tags: [Tarefas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da tarefa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizarTarefa'
 *     responses:
 *       200:
 *         description: Tarefa atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tarefa'
 *       400:
 *         description: Erro de validação ao atualizar tarefa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       404:
 *         description: Tarefa não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.put('/:id', async (req, res) => {
    const tarefaAtualizada = await Tarefa.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!tarefaAtualizada) {
        return res.status(404).json({ erro: "Tarefa não encontrada." });
    }

    res.json(tarefaAtualizada);
});

/**
 * @swagger
 * /tarefas/{id}:
 *   delete:
 *     summary: Remove uma tarefa existente
 *     tags: [Tarefas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da tarefa
 *     responses:
 *       204:
 *         description: Tarefa deletada com sucesso
 *       404:
 *         description: Tarefa não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       500:
 *         description: Erro ao deletar tarefa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.delete('/:id', async (req, res) => {
    const tarefaDeletada = await Tarefa.findByIdAndDelete(req.params.id);

    if (!tarefaDeletada) {
        return res.status(404).json({ erro: "Tarefa não encontrada." });
    }

    res.status(204).send();
});

/**
 * @swagger
 * /tarefas/{id}/anexo:
 *   post:
 *     summary: Envia um anexo para uma tarefa
 *     tags: [Tarefas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da tarefa
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - anexo
 *             properties:
 *               anexo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Anexo enviado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadAnexoResponse'
 *       404:
 *         description: Tarefa não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       500:
 *         description: Erro ao enviar anexo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.post('/:id/anexo', upload.single('anexo'), async (req, res) => {
    const tarefa = await Tarefa.findById(req.params.id);

    if (!tarefa) {
        return res.status(404).json({ erro: 'Tarefa não encontrada.' });
    }

    tarefa.anexo = req.file.path;
    await tarefa.save();

    res.json({ mensagem: 'Anexo enviado com sucesso!', anexo: req.file });
});

/**
 * @swagger
 * /tarefas/{id}/anexos:
 *   post:
 *     summary: Envia múltiplos anexos para uma tarefa
 *     tags: [Tarefas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da tarefa
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - anexos
 *             properties:
 *               anexos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Anexos enviados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadAnexosResponse'
 *       404:
 *         description: Tarefa não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       500:
 *         description: Erro ao enviar anexos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.post('/:id/anexos', upload.array('anexos', 5), async (req, res) => {
    const tarefa = await Tarefa.findById(req.params.id);

    if (!tarefa) {
        return res.status(404).json({ erro: 'Tarefa não encontrada.' });
    }

    const caminhos = req.files.map(file => file.path);

    tarefa.anexos = tarefa.anexos
        ? tarefa.anexos.concat(caminhos)
        : caminhos;

    await tarefa.save();

    res.json({
        mensagem: 'Anexos enviados com sucesso!',
        anexos: req.files
    });
});

export default router;