import { Router } from 'express';
import { UserController } from '../controller/UserController';
import { UserService } from '../service/UserService';
import { authenticateJWT } from '../auth/middlawareValidateJWT';
import { authorizeRoles } from '../auth/authorizeRole';
import { Role } from '../model/enum/Roles';
import { validateDto } from '../middleware/validateDto';
import { CreateUserDto, UpdateUserDto } from '../model/dtos';
import { asyncWrapper } from '../middleware/asyncWrapper';
import { UserRepository } from '../repository/UserRepository';

const useRouter = Router();
const userService = new UserService(new UserRepository());
const userController = new UserController();

// Rotas personalizadas
useRouter.get('/email/:email', authenticateJWT, asyncWrapper(userController.findByEmail.bind(userController)));

// Rotas CRUD básicas
useRouter.get('/', authenticateJWT, authorizeRoles(Role.ADM, Role.ATLETA) as any, asyncWrapper(userController.findAll.bind(userController)));
useRouter.get('/:id', authenticateJWT, authorizeRoles(Role.ADM, Role.ATLETA) as any, asyncWrapper(userController.findById.bind(userController)));
useRouter.post('/', validateDto(CreateUserDto), asyncWrapper(userController.create.bind(userController)));
useRouter.put('/:id', (req, res, next) => {
    console.log('📝 PUT /users/:id - Requisição de atualização recebida');
    console.log('📋 ID:', req.params.id);
    console.log('📋 Body:', req.body);
    console.log('🔑 Authorization header:', req.headers.authorization ? 'PRESENTE' : 'AUSENTE');
    next();
}, authenticateJWT, authorizeRoles(Role.ADM, Role.ATLETA) as any, validateDto(UpdateUserDto), asyncWrapper(userController.update.bind(userController)));

useRouter.delete('/:id', authenticateJWT, authorizeRoles(Role.ADM) as any, asyncWrapper(userController.delete.bind(userController)));

// Rota para criar usuários de teste (sem autenticação para desenvolvimento)
useRouter.post('/create-test-users', asyncWrapper(userController.createTestUsers.bind(userController)));

// Rotas de gerenciamento de usuário
useRouter.put('/:id/change-password', (req, res, next) => {
    console.log('🔐 PUT /users/:id/change-password - Requisição de alteração de senha');
    console.log('📋 ID:', req.params.id);
    console.log('🔑 Authorization header:', req.headers.authorization ? 'PRESENTE' : 'AUSENTE');
    next();
}, authenticateJWT, authorizeRoles(Role.ADM, Role.ATLETA) as any, asyncWrapper(userController.changePassword.bind(userController)));
useRouter.put('/:id/activate', authenticateJWT, authorizeRoles(Role.ADM) as any, asyncWrapper(userController.activateUser.bind(userController)));
useRouter.put('/:id/deactivate', authenticateJWT, authorizeRoles(Role.ADM) as any, asyncWrapper(userController.deactivateUser.bind(userController)));

export { useRouter };