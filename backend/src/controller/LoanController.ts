import { Request, Response } from 'express';
import { CrudController } from './CrudController';
import { LoanService } from '../service/LoanService';
import { Loan } from '../model/entities/Loan';
import { CreateLoanDto, ReturnLoanDto, UpdateLoanDto } from '../model/dtos';
import { LoanStatus } from '../model/enum/Status';
import { RequestWithPayload } from '../auth/payload';
import { Role } from '../model/enum/Roles';

export class LoanController extends CrudController<Loan, ReturnLoanDto, CreateLoanDto, UpdateLoanDto> {
    
    constructor(private loanService: LoanService) {
        super(loanService);
    }

    async findLoansByUser(req: Request, res: Response): Promise<void> {
        const { userId } = req.params;
        const loans = await this.loanService.findLoansByUser(Number(userId));
        res.status(200).json(loans);
    }

    async findLoansByEquipment(req: Request, res: Response): Promise<void> {
        const { equipmentId } = req.params;
        const loans = await this.loanService.findLoansByEquipment(Number(equipmentId));
        res.status(200).json(loans);
    }

    async findLoansByStatus(req: Request, res: Response): Promise<void> {
        const { status } = req.params;
        
        if (!Object.values(LoanStatus).includes(status as LoanStatus)) {
            res.status(400).json({ message: 'Status inválido' });
            return;
        }
        
        const loans = await this.loanService.findLoansByStatus(status as LoanStatus);
        res.status(200).json(loans);
    }

    async create(req: Request, res: Response): Promise<void> {
        const loan = await this.loanService.create(req.body);
        res.status(201).json(loan);
    }

    async update(req: Request, res: Response): Promise<void> {
        const id = Number(req.params.id);
        const requestWithPayload = req as RequestWithPayload;
        const currentUser = requestWithPayload.payload.usuario;
        
        // Buscar o empréstimo para verificar a propriedade
        const loan = await this.loanService.findById(id, ['user', 'equipment']);
        
        // Verificar se o usuário tem permissão para editar
        if (currentUser.role !== Role.ADM && loan.user.id !== currentUser.id) {
            console.log(`❌ Tentativa de edição não autorizada - Usuário ${currentUser.id} tentou editar empréstimo de outro usuário (${loan.user.id})`);
            res.status(403).json({ 
                message: 'Você só pode editar seus próprios empréstimos' 
            });
            return;
        }
        
        // Se não for ADM, verificar se está tentando alterar status
        if (currentUser.role !== Role.ADM && req.body.status && req.body.status !== loan.status) {
            console.log(`❌ Tentativa de alteração de status não autorizada - Usuário ${currentUser.id} (${currentUser.role}) tentou alterar status`);
            res.status(403).json({ 
                message: 'Apenas administradores podem alterar o status dos empréstimos' 
            });
            return;
        }
        
        // Se não for ADM, verificar se empréstimo já foi finalizado
        if (currentUser.role !== Role.ADM && loan.status === 'RETURNED') {
            console.log(`❌ Tentativa de edição de empréstimo finalizado - Usuário ${currentUser.id} tentou editar empréstimo com status RETURNED`);
            res.status(403).json({ 
                message: 'Não é possível editar empréstimos já finalizados' 
            });
            return;
        }
        
        console.log(`✅ Atualização autorizada - Usuário ${currentUser.id} (${currentUser.role}) editando empréstimo ${id}`);
        
        await this.loanService.update(id, req.body);
        res.status(204).send();
    }

    async delete(req: Request, res: Response): Promise<void> {
        const id = Number(req.params.id);
        const requestWithPayload = req as RequestWithPayload;
        const currentUser = requestWithPayload.payload.usuario;
        
        // Buscar o empréstimo para verificar a propriedade
        const loan = await this.loanService.findById(id, ['user', 'equipment']);
        
        // Verificar se o usuário tem permissão para deletar
        // ADM pode deletar qualquer empréstimo, ATLETA só pode deletar seus próprios
        if (currentUser.role !== Role.ADM && loan.user.id !== currentUser.id) {
            res.status(403).json({ 
                message: 'Você só pode cancelar seus próprios empréstimos' 
            });
            return;
        }
        
        await this.loanService.delete(id);
        res.status(204).send();
    }
} 