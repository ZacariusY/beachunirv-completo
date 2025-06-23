import { Request, Response } from 'express';
import { LoginService } from '../service/LoginService';
import { UserService } from '../service/UserService';
import { UserRepository } from '../repository/UserRepository';

export class AuthController {
    
    private loginService: LoginService;
    private userService: UserService;

    constructor() {
        const userRepository = new UserRepository();
        this.loginService = new LoginService(userRepository);
        this.userService = new UserService(userRepository);
    }

    async signin(req: Request, res: Response): Promise<void> {
        const { email, password } = req.body;
        
        const result = await this.loginService.signin({ email, password });
        
        // Formato compatível com frontend
        res.status(200).json({
            success: true,
            data: {
                token: result.accessToken,
                refreshToken: result.accessToken, // Por enquanto mesmo token
                user: result.user
            },
            message: 'Login realizado com sucesso'
        });
    }

    // Método de registro
    async register(req: Request, res: Response): Promise<void> {
        try {
            const { name, email, password, profileImageUrl } = req.body;
            
            const newUser = await this.userService.create({
                name,
                email,
                password,
                profileImageUrl
            });

            // Após criar o usuário, faz login automaticamente
            const loginResult = await this.loginService.signin({ email, password });
            
            // Formato compatível com frontend
            res.status(201).json({
                success: true,
                data: {
                    token: loginResult.accessToken,
                    refreshToken: loginResult.accessToken,
                    user: loginResult.user
                },
                message: 'Usuário criado e logado com sucesso'
            });
            
        } catch (error: any) {
            console.error('Erro no registro:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Erro ao criar usuário'
            });
        }
    }

    // Método de logout
    async logout(req: Request, res: Response): Promise<void> {
        try {
            // Por enquanto, o logout é apenas do lado cliente
            // Aqui poderia invalidar tokens, limpar sessões, etc.
            
            console.log('🚪 Logout realizado');
            
            res.status(200).json({
                success: true,
                message: 'Logout realizado com sucesso'
            });
            
        } catch (error) {
            console.error('Erro no logout:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }


} 