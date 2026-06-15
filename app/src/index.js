import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import os from "os";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import process from "process";
import swaggerUi from "swagger-ui-express";
import 'express-async-errors';

import swaggerSpecs from "./config/swagger.js";
import authRoutes from './routes/authRoutes.js';
import usuariosRoutes from './routes/usuariosRoutes.js';
import tarefasRoutes from './routes/tarefasRoutes.js';
import comentariosRoutes from './routes/comentariosRoutes.js';
import logger from './config/logger.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const port = Number(process.env.PORT || 3000);
const host = "0.0.0.0"; // garante bind externo no container
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/curso";

// Logs úteis
logger.info("[BOOT] NODE_ENV=%s, PORT=%s, MONGODB_URI=%s", process.env.NODE_ENV, port, uri);

// Tolerante a falhas: tenta conectar, mas não derruba o servidor se falhar
(async () => {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
    logger.info("[MONGO] Conectado com sucesso.");
  } catch (err) {
    logger.error("[MONGO] Falha ao conectar:", err?.message || err);
  }
})();

// Criar diretório de uploads se não existir
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Endpoint de diagnóstico completo
app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    ts: Date.now(),
    node: process.version,
    pid: process.pid,
    platform: os.platform(),
    arch: os.arch(),
    uptime: process.uptime(),
    cwd: process.cwd(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      MONGODB_URI: process.env.MONGODB_URI,
    },
    mongoReady: mongoose.connection.readyState, // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  });
});

// Rota raiz simples (ajuda a testar no navegador)
app.get("/", (_req, res) => {
  res.send(`<html><body>
    <h1>API de Tarefas com MongoDB</h1>
    <p>Status em <a href="/health">/health</a></p>
    <p>Documentação em <a href="/api-docs">/api-docs</a></p>
  </body></html>`);
});

// Disponibiliza a especificação OpenAPI em formato JSON.
// Esse arquivo pode ser usado por ferramentas externas, como Insomnia,
// Postman, Swagger Editor ou geradores de cliente de API.
app.get("/openapi.json", (_req, res) => {

  // Informa ao cliente que a resposta será um JSON.
  // Isso ajuda navegadores e ferramentas externas a interpretarem corretamente
  // o conteúdo retornado.
  res.setHeader("Content-Type", "application/json");

  // Envia a especificação OpenAPI gerada pelo swagger-jsdoc.
  // A variável swaggerSpecs vem do arquivo src/config/swagger.js.
  res.send(swaggerSpecs);
});

// Disponibiliza a interface visual do Swagger no navegador.
// Ao acessar http://localhost:3000/api-docs, o aluno verá uma documentação
// interativa da API, podendo consultar endpoints e testar requisições.
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(uploadsDir));

// Montar as rotas de autenticação
app.use('/auth', authRoutes);

// Montar as rotas de usuários
app.use('/usuarios', usuariosRoutes);

// Montar as rotas de tarefas
app.use('/tarefas', tarefasRoutes);

// Montar as rotas de comentários
app.use('/comentarios', comentariosRoutes);

// Middleware de tratamento de erros (deve ser o último)
app.use((err, req, res, next) => {
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`);
  res.status(500).json({
    erro: 'Ocorreu um erro inesperado no servidor.' });
});


  // Handlers globais para não derrubar o processo
  process.on("unhandledRejection", (err) => {
    logger.error("[UNHANDLED REJECTION]", err);
  });
  process.on("uncaughtException", (err) => {
    logger.error("[UNCAUGHT EXCEPTION]", err);
  });

  // Exportar app para testes
  export default app;

  // Iniciar servidor apenas se não estiver em modo de teste
  if (process.env.NODE_ENV !== 'test') {
    app.listen(port, host, () => {
      logger.info(`[BOOT] Servidor ouvindo em http://${host}:${port}`);
    });
  }
