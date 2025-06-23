import { Router } from 'express';
import { LoanController } from '../controller/LoanController';
import { LoanService } from '../service/LoanService';
import { authenticateJWT } from '../auth/middlawareValidateJWT';
import { authorizeRoles } from '../auth/authorizeRole';
import { Role } from '../model/enum/Roles';
import { validateDto } from '../middleware/validateDto';
import { CreateLoanDto, UpdateLoanDto } from '../model/dtos';
import { asyncWrapper } from '../middleware/asyncWrapper';
import { LoanRepository } from '../repository/LoanRepository';
import { UserRepository } from '../repository/UserRepository';
import { EquipmentRepository } from '../repository/Equipment';
import { AppDataSource } from '../data_source';

const loanRouter = Router();
const loanService = new LoanService(
    new LoanRepository(),
    new UserRepository(),
    new EquipmentRepository()
);
const loanController = new LoanController(loanService);

// Rotas personalizadas
loanRouter.get('/user/:userId', authenticateJWT, authorizeRoles(Role.ADM, Role.ATLETA)as any, asyncWrapper(loanController.findLoansByUser.bind(loanController)));
loanRouter.get('/equipment/:equipmentId', authenticateJWT, authorizeRoles(Role.ADM, Role.ATLETA)as any, asyncWrapper(loanController.findLoansByEquipment.bind(loanController)));
loanRouter.get('/status/:status', authenticateJWT, authorizeRoles(Role.ADM, Role.ATLETA)as any, asyncWrapper(loanController.findLoansByStatus.bind(loanController)));

// Endpoint para verificar status do banco
loanRouter.get('/debug-status', asyncWrapper(async (req, res) => {
    console.log('🔍 Verificando status do banco...');
    
    const userRepository = AppDataSource.getRepository('User');
    const equipmentRepository = AppDataSource.getRepository('Equipment');
    const loanRepository = AppDataSource.getRepository('Loan');
    
    try {
        const usersCount = await userRepository.count();
        const equipmentsCount = await equipmentRepository.count();
        const loansCount = await loanRepository.count();
        
        console.log('📊 Status do banco:');
        console.log('  - Usuários:', usersCount);
        console.log('  - Equipamentos:', equipmentsCount);
        console.log('  - Empréstimos:', loansCount);
        
        res.json({
            users: usersCount,
            equipments: equipmentsCount,
            loans: loansCount,
            message: 'Status do banco verificado'
        });
        
    } catch (error: any) {
        console.error('❌ Erro ao verificar status:', error);
        res.status(500).json({ error: error.message });
    }
}));

// Endpoint temporário para criar dados de teste
loanRouter.post('/seed-test', asyncWrapper(async (req, res) => {
    console.log('🌱 Criando dados de teste para empréstimos...');
    
    const userRepository = AppDataSource.getRepository('User');
    const equipmentRepository = AppDataSource.getRepository('Equipment');
    const loanRepository = AppDataSource.getRepository('Loan');
    
    try {
        // Verificar se já existem empréstimos
        const existingLoans = await loanRepository.find();
        if (existingLoans.length > 0) {
            res.json({ message: 'Empréstimos já existem', count: existingLoans.length });
            return;
        }
        
        // Buscar usuários e equipamentos
        const users = await userRepository.find();
        const equipments = await equipmentRepository.find();
        
        console.log('👥 Usuários encontrados:', users.length);
        console.log('🏐 Equipamentos encontrados:', equipments.length);
        
        if (users.length === 0 || equipments.length === 0) {
            res.status(400).json({ 
                message: 'Precisa ter usuários e equipamentos antes de criar empréstimos',
                users: users.length,
                equipments: equipments.length
            });
            return;
        }
        
        // Criar alguns empréstimos de teste
        const testLoans = [
            {
                amount: 2,
                status: 'SCHEDULED',
                withdrawal_date: new Date(),
                return_date: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 horas depois
                user_id: users[0].id,
                equipment_id: equipments[0].id
            },
            {
                amount: 1,
                status: 'IN_PROGRESS',
                withdrawal_date: new Date(Date.now() - 60 * 60 * 1000), // 1 hora atrás
                return_date: new Date(Date.now() + 60 * 60 * 1000), // 1 hora no futuro
                user_id: users.length > 1 ? users[1].id : users[0].id,
                equipment_id: equipments.length > 1 ? equipments[1].id : equipments[0].id
            }
        ];
        
        const created = [];
        for (const loan of testLoans) {
            const result = await loanRepository.save(loan);
            created.push(result);
            console.log(`✅ Empréstimo criado: ID ${result.id}`);
        }
        
        res.json({ message: 'Empréstimos de teste criados', loans: created });
        
    } catch (error: any) {
        console.error('❌ Erro ao criar empréstimos de teste:', error);
        res.status(500).json({ error: error.message });
    }
}));

// Rotas CRUD básicas
loanRouter.get('/', (req, res, next) => {
    console.log('🔍 GET /loans - Requisição recebida');
    console.log('🔑 Authorization header:', req.headers.authorization ? 'PRESENTE' : 'AUSENTE');
    next();
}, authenticateJWT, authorizeRoles(Role.ADM, Role.ATLETA)as any, asyncWrapper(loanController.findAll.bind(loanController)));
loanRouter.get('/:id', authenticateJWT, authorizeRoles(Role.ADM, Role.ATLETA)as any, asyncWrapper(loanController.findById.bind(loanController)));
loanRouter.post('/', (req, res, next) => {
    console.log('🚀 POST /loans - Requisição recebida');
    console.log('📋 Body:', req.body);
    console.log('🔑 Authorization header:', req.headers.authorization ? 'PRESENTE' : 'AUSENTE');
    next();
}, authenticateJWT, authorizeRoles(Role.ADM, Role.ATLETA) as any, validateDto(CreateLoanDto), asyncWrapper(loanController.create.bind(loanController)));
loanRouter.put('/:id', authenticateJWT, authorizeRoles(Role.ADM, Role.ATLETA) as any, validateDto(UpdateLoanDto), asyncWrapper(loanController.update.bind(loanController)));
loanRouter.delete('/:id', (req, res, next) => {
    console.log('🗑️ DELETE /loans/:id - Requisição recebida');
    console.log('📋 ID:', req.params.id);
    console.log('🔑 Authorization header:', req.headers.authorization ? 'PRESENTE' : 'AUSENTE');
    next();
}, authenticateJWT, authorizeRoles(Role.ADM, Role.ATLETA) as any, asyncWrapper(loanController.delete.bind(loanController)));

export { loanRouter }; 