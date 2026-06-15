import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const usuarioSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
        lowercase: true,
        trim: true
    },
    senha: {
        type: String,
        required: true,
        select: false // Não retorna a senha em consultas
    }
});

// Hook para criptografar a senha antes de salvar
usuarioSchema.pre("save", async function (next) {
    if (!this.isModified("senha")) return next();
    this.senha = await bcrypt.hash(this.senha, 10);
    next();
});

const Usuario = mongoose.model('Usuario', usuarioSchema);
export default Usuario;