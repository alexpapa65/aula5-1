import mongoose from 'mongoose';

const tarefaSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: [true, "O campo título é obrigatório."],
        minlength: [3, "O título deve ter no mínimo 3 caracteres."],
        maxlength: [50, "O título deve ter no máximo 50 caracteres."]
    },
    concluida: {
        type: Boolean,
        default: false
    },
    prioridade: {
        type: String,
        required: [true, "O campo prioridade é obrigatório."],
        enum: ["Baixa", "Média", "Alta"]
    },
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true, "O campo usuário é obrigatório."]
    },
    anexo: { type: String }, // Campo para armazenar o caminho do anexo
    anexos: [{ type: String }] // Array de strings para múltiplos anexos
}, { timestamps: true });

const Tarefa = mongoose.model('Tarefa', tarefaSchema);
export default Tarefa;
