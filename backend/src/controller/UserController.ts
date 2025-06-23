import { Request, Response } from 'express';
import { CrudController } from './CrudController';
import { UserService } from '../service/UserService';
import { User } from '../model/entities/user';
import { CreateUserDto, ReturnUserDto, UpdateUserDto } from '../model/dtos';
import { UserRepository } from '../repository/UserRepository';
import { RequestWithPayload } from '../auth/payload';
import { Role } from '../model/enum/Roles';

export class UserController extends CrudController<User, ReturnUserDto, CreateUserDto, UpdateUserDto> {
    
    private userService: UserService;

    constructor() {
        const userRepository = new UserRepository();
        const userService = new UserService(userRepository);
        super(userService);
        this.userService = userService;
    }

    async findByEmail(req: Request, res: Response): Promise<void> {
        const { email } = req.params;
        const user = await this.userService.findByEmail(email);        
        res.status(200).json(user);
    }

    async changePassword(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const { currentPassword, newPassword } = req.body;
        const requestWithPayload = req as RequestWithPayload;
        const currentUser = requestWithPayload.payload.usuario;
        
        // Verificar se o usuário tem permissão para alterar a senha
        // ADM pode alterar qualquer senha, ATLETA só pode alterar sua própria
        if (currentUser.role !== Role.ADM && currentUser.id !== Number(id)) {
            res.status(403).json({ 
                message: 'Você só pode alterar sua própria senha' 
            });
            return;
        }
        
        await this.userService.changePassword(Number(id), currentPassword, newPassword);
        res.status(200).json({ message: 'Senha alterada com sucesso' });
    }

    async activateUser(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        await this.userService.activateUser(Number(id));
        res.status(200).json({ message: 'Usuário ativado com sucesso' });
    }

    async deactivateUser(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        await this.userService.deactivateUser(Number(id));
        res.status(200).json({ message: 'Usuário desativado com sucesso' });
    }

    async create(req: Request, res: Response): Promise<void> {
        const user = await this.userService.create(req.body);
        res.status(201).json(user);
    }

    async update(req: Request, res: Response): Promise<void> {
        const id = Number(req.params.id);
        const requestWithPayload = req as RequestWithPayload;
        const currentUser = requestWithPayload.payload.usuario;
        
        // Verificar se o usuário tem permissão para atualizar
        // ADM pode atualizar qualquer usuário, ATLETA só pode atualizar seus próprios dados
        if (currentUser.role !== Role.ADM && currentUser.id !== id) {
            res.status(403).json({ 
                message: 'Você só pode editar seus próprios dados' 
            });
            return;
        }
        
        await this.userService.update(id, req.body);
        res.status(204).send();
    }

    async delete(req: Request, res: Response): Promise<void> {
        const id = Number(req.params.id);
        await this.userService.delete(id);
        res.status(204).send();
    }

    // Endpoint para criar usuários de teste
    async createTestUsers(req: Request, res: Response): Promise<void> {
        try {
            const users = await this.userService.createTestUsers();
            
            res.status(200).json({
                success: true,
                data: users,
                message: `${users.length} usuários de teste criados/verificados com sucesso`
            });
        } catch (error: any) {
            console.error('Erro ao criar usuários de teste:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao criar usuários de teste'
            });
        }
    }
} 