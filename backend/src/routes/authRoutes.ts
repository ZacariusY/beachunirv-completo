import { Router } from 'express';
import { AuthController } from '../controller/AuthController';
import { validateDto } from '../middleware/validateDto';
import { LoginDto, RegisterDto } from '../model/dtos/AuthDto';
import { asyncWrapper } from '../middleware/asyncWrapper';
import { authenticateJWT } from '../auth/middlawareValidateJWT';

const authRouter = Router();
const authController = new AuthController();

// Rotas de autenticação
authRouter.post('/signin', validateDto(LoginDto), asyncWrapper(authController.signin.bind(authController)));
authRouter.post('/login', validateDto(LoginDto), asyncWrapper(authController.signin.bind(authController))); // Compatibilidade com frontend
authRouter.post('/register', validateDto(RegisterDto), asyncWrapper(authController.register.bind(authController))); // Registro de usuários
authRouter.post('/logout', authenticateJWT, asyncWrapper(authController.logout.bind(authController))); // Logout

export { authRouter }; 