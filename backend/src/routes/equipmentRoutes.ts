import { Router } from 'express';
import { EquipmentController } from '../controller/EquipmentController';
import { EquipmentService } from '../service/EquipmentService';
import { authenticateJWT } from '../auth/middlawareValidateJWT';
import { authorizeRoles } from '../auth/authorizeRole';
import { Role } from '../model/enum/Roles';
import { validateDto } from '../middleware/validateDto';
import { CreateEquipmentDto, UpdateEquipmentDto } from '../model/dtos';
import { asyncWrapper } from '../middleware/asyncWrapper';
import { EquipmentRepository } from '../repository/Equipment';
import { EsportRepository } from '../repository/EsportRepository';
import { AppDataSource } from '../data_source';

const equipmentRouter = Router();
const equipmentService = new EquipmentService(
    new EquipmentRepository(),
    new EsportRepository()
);
const equipmentController = new EquipmentController(equipmentService);

// Rotas personalizadas
equipmentRouter.get('/name/:name', authenticateJWT, authorizeRoles(Role.ADM, Role.ATLETA)as any, asyncWrapper(equipmentController.findByName.bind(equipmentController)));
equipmentRouter.get('/esport/:esportId', authenticateJWT, authorizeRoles(Role.ADM, Role.ATLETA)as any, asyncWrapper(equipmentController.findEquipmentsByEsport.bind(equipmentController)));

// Rotas de relacionamento com esporte
equipmentRouter.post('/:equipmentId/esport/:esportId', authenticateJWT, authorizeRoles(Role.ADM) as any, asyncWrapper(equipmentController.addEsportToEquipment.bind(equipmentController)));
equipmentRouter.delete('/:equipmentId/esport/:esportId', authenticateJWT, authorizeRoles(Role.ADM) as any, asyncWrapper(equipmentController.removeEsportFromEquipment.bind(equipmentController)));

// Rotas CRUD básicas
equipmentRouter.get('/', asyncWrapper(async (req, res) => {
    console.log('🔍 Buscando equipamentos...');
    await equipmentController.findAll(req, res);
}));

// Endpoint temporário para criar equipamentos básicos
equipmentRouter.post('/seed-simple', asyncWrapper(async (req, res) => {
    console.log('🌱 Criando equipamentos simples...');
    
    const equipmentRepository = AppDataSource.getRepository('Equipment');
    const count = await equipmentRepository.count();
    
    if (count > 0) {
        res.json({ message: 'Equipamentos já existem', count });
        return;
    }

    const equipments = [
        { name: "Bola Mikasa", amount: 4, image_url: "/placeholder.jpg" },
        { name: "Bola Penalty", amount: 2, image_url: "/placeholder.jpg" },
        { name: "Raquete Beach Tennis", amount: 6, image_url: "/placeholder.jpg" },
        { name: "Rede Vôlei", amount: 1, image_url: "/placeholder.jpg" },
        { name: "Varetas", amount: 8, image_url: "/placeholder.jpg" },
        { name: "Placar Manual", amount: 3, image_url: "/placeholder.jpg" },
    ];

    const created = [];
    for (const eq of equipments) {
        const result = await equipmentRepository.save(eq);
        created.push(result);
        console.log(`✅ Criado: ${eq.name} (ID: ${result.id})`);
    }

    res.json({ message: 'Equipamentos criados', equipments: created });
}));

equipmentRouter.get('/:id', authenticateJWT, authorizeRoles(Role.ADM, Role.ATLETA) as any, asyncWrapper(equipmentController.findById.bind(equipmentController)));
equipmentRouter.post('/', authenticateJWT, authorizeRoles(Role.ADM) as any, validateDto(CreateEquipmentDto), asyncWrapper(equipmentController.create.bind(equipmentController)));
equipmentRouter.put('/:id', authenticateJWT, authorizeRoles(Role.ADM) as any, validateDto(UpdateEquipmentDto), asyncWrapper(equipmentController.update.bind(equipmentController)));
equipmentRouter.delete('/:id', authenticateJWT, authorizeRoles(Role.ADM) as any, asyncWrapper(equipmentController.delete.bind(equipmentController)));

export { equipmentRouter }; 