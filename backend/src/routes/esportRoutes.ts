import { Router } from 'express';
import { EsportController } from '../controller/EsportController';
import { EsportService } from '../service/EsportService';
import { authenticateJWT } from '../auth/middlawareValidateJWT';
import { authorizeRoles } from '../auth/authorizeRole';
import { Role } from '../model/enum/Roles';
import { validateDto } from '../middleware/validateDto';
import { CreateEsportDto, UpdateEsportDto } from '../model/dtos';
import { asyncWrapper } from '../middleware/asyncWrapper';
import { EsportRepository } from '../repository/EsportRepository';

const esportRouter = Router();
const esportService = new EsportService(new EsportRepository());
const esportController = new EsportController(esportService);

// Rotas personalizadas
esportRouter.get('/name/:name', authenticateJWT,authorizeRoles(Role.ADM, Role.ATLETA)as any, asyncWrapper(esportController.findByName.bind(esportController)));

// Rotas CRUD básicas
esportRouter.get('/', authenticateJWT, authorizeRoles(Role.ADM, Role.ATLETA)as any, asyncWrapper(esportController.findAll.bind(esportController)));
esportRouter.get('/:id', authenticateJWT, authorizeRoles(Role.ADM, Role.ATLETA)as any, asyncWrapper(esportController.findById.bind(esportController)));
esportRouter.post('/', authenticateJWT, authorizeRoles(Role.ADM) as any, validateDto(CreateEsportDto), asyncWrapper(esportController.create.bind(esportController)));
esportRouter.put('/:id', authenticateJWT, authorizeRoles(Role.ADM) as any, validateDto(UpdateEsportDto), asyncWrapper(esportController.update.bind(esportController)));
esportRouter.delete('/:id', authenticateJWT, authorizeRoles(Role.ADM) as any, asyncWrapper(esportController.delete.bind(esportController)));

export { esportRouter }; 