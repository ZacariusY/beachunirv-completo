import express from "express";
import cors from 'cors';
import "reflect-metadata";
import 'dotenv/config';
import { AppDataSource } from "./data_source";
import { routes } from "./routes";
import { User } from "./model/entities/user";
import { Email } from "./model/value-objects/Email";
import { HashedPassword } from "./model/value-objects/HashedPassword";
import { Role } from "./model/enum/Roles";
        
const app = express();
const PORT = process.env.PORT || 3001;

// Configuração básica
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Backend BeachUnirv funcionando!',
        database: AppDataSource.isInitialized ? 'Conectado' : 'Desconectado'
    });
});

// Usar todas as rotas
app.use('/api', routes);

// Função para criar dados de teste
async function seedDatabase() {
    try {
        console.log('🌱 Iniciando seed do banco de dados...');
        
        const userRepository = AppDataSource.getRepository(User);
        
        // Verificar se já existe usuário de teste
        const existingUser = await userRepository.findOne({
            where: { email: { email: 'teste@academico.unirv.edu.br' } as any }
        });

        if (!existingUser) {
            // Criar usuário de teste
            const user = new User();
            user.name = "Usuário Teste";
            user.email = Email.Create('teste@academico.unirv.edu.br');
            user.hashedPassword = await HashedPassword.create('123456');
            user.role = Role.ATLETA;
            user.status = true;

            await userRepository.save(user);
            console.log("👤 Usuário de teste criado: teste@academico.unirv.edu.br / 123456");
        } else {
            console.log("👤 Usuário de teste já existe");
        }

        // Criar equipamentos de teste usando SQL direto
        console.log('🏐 Verificando equipamentos no banco...');
        
        // Verificar se já existem equipamentos
        const [{ count }] = await AppDataSource.query('SELECT COUNT(*) as count FROM equipments');
        console.log('📊 Equipamentos existentes:', count);
        
        if (parseInt(count) === 0) {
            console.log('🌱 Criando equipamentos de teste...');
            
            await AppDataSource.query(`
                INSERT INTO equipments (name, amount, image_url) VALUES 
                ('Bola Mikasa', 4, '/placeholder.jpg'),
                ('Bola Penalty', 2, '/placeholder.jpg'),
                ('Raquete Beach Tennis', 6, '/placeholder.jpg'),
                ('Rede Vôlei', 1, '/placeholder.jpg'),
                ('Varetas', 8, '/placeholder.jpg'),
                ('Placar Manual', 3, '/placeholder.jpg')
            `);
            
            console.log('✅ Equipamentos criados com sucesso!');
            
            // Verificar se foram criados
            const equipments = await AppDataSource.query('SELECT * FROM equipments ORDER BY id');
            equipments.forEach((eq: any) => {
                console.log(`🏐 ID ${eq.id}: ${eq.name} (${eq.amount} unidades)`);
            });
        } else {
            console.log('🏐 Equipamentos já existem no banco:', count);
        }
        
        console.log('✅ Seed do banco concluído!');
        
    } catch (error) {
        console.error("❌ Erro ao criar dados de teste:", error);
    }
}

// Inicializar banco de dados e servidor
AppDataSource.initialize()
    .then(async () => {
        console.log("🗄️ Banco de dados conectado com sucesso!");
        
        // Criar dados de teste
        await seedDatabase();
        
        app.listen(PORT, () => {
            console.log(`🚀 Backend BeachUnirv rodando em http://localhost:${PORT}`);
            console.log(`❤️ Health check: http://localhost:${PORT}/api/health`);
            console.log(`🐳 PostgreSQL: beachunirv_db conectado`);
            console.log(`🔑 Login teste: teste@academico.unirv.edu.br / 123456`);
        });
    })
    .catch((error) => {
        console.error("❌ Erro ao conectar com o banco de dados:", error);
        process.exit(1);
    });