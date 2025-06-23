import { Loan } from "../model/entities/Loan";
import { CrudServiceInterface } from "./CrudServiceInterface";
import { LoanRepository } from "../repository/LoanRepository";
import { UserRepository } from "../repository/UserRepository";
import { EquipmentRepository } from "../repository/Equipment";
import { 
    CreateLoanDto, 
    ReturnLoanDto, 
    UpdateLoanDto 
} from "../model/dtos";
import { LoanStatus } from "../model/enum/Status";
import { LoanPeriod } from "../model/value-objects/LoanPeriod";

export class LoanService implements CrudServiceInterface<Loan, ReturnLoanDto, CreateLoanDto, UpdateLoanDto> {
    
    constructor(
        private readonly loanRepository: LoanRepository,
        private readonly userRepository: UserRepository,
        private readonly equipmentRepository: EquipmentRepository
    ) {}

    async findAll(relations: string[] = []): Promise<ReturnLoanDto[]> {
        // Garantir que sempre carregue as relações necessárias
        const requiredRelations = ['user', 'equipment'];
        const allRelations = [...new Set([...relations, ...requiredRelations])];
        
        console.log('🔍 LoanService.findAll - Relations solicitadas:', allRelations);
        
        try {
            const loans = await this.loanRepository.findAll(allRelations);
            console.log('📊 LoanService.findAll - Total loans encontrados:', loans.length);
            
            if (loans.length > 0) {
                console.log('📋 LoanService.findAll - Primeiro loan:', loans[0]);
                console.log('📋 LoanService.findAll - Tem usuário?:', !!loans[0].user);
                console.log('📋 LoanService.findAll - Tem equipamento?:', !!loans[0].equipment);
            }
            
            return loans.map(loan => this.mapToReturnDto(loan));
        } catch (error) {
            console.error('❌ Erro em LoanService.findAll:', error);
            throw error;
        }
    }

    async findById(id: number, relations: string[] = []): Promise<ReturnLoanDto> {
        if (!id || id <= 0) {
            throw new Error("ID do empréstimo deve ser um número positivo");
        }

        const loan = await this.loanRepository.findById(id, relations);
        if (!loan) {
            throw new Error(`Empréstimo com ID ${id} não encontrado`);
        }

        return this.mapToReturnDto(loan);
    }

    async create(createLoanDto: CreateLoanDto): Promise<ReturnLoanDto> {
        console.log('🔍 LoanService.create - Iniciando criação de empréstimo');
        console.log('📋 Dados recebidos:', createLoanDto);

        try {
            // Validar usuário
            console.log('👤 Buscando usuário ID:', createLoanDto.userId);
            const user = await this.userRepository.findById(createLoanDto.userId, []);
            if (!user) {
                console.log('❌ Usuário não encontrado:', createLoanDto.userId);
                throw new Error(`Usuário com ID ${createLoanDto.userId} não encontrado`);
            }
            console.log('✅ Usuário encontrado:', user.name);

            // Validar equipamento
            console.log('🏐 Buscando equipamento ID:', createLoanDto.equipmentId);
            const equipment = await this.equipmentRepository.findById(createLoanDto.equipmentId, []);
            if (!equipment) {
                console.log('❌ Equipamento não encontrado:', createLoanDto.equipmentId);
                throw new Error(`Equipamento com ID ${createLoanDto.equipmentId} não encontrado`);
            }
            console.log('✅ Equipamento encontrado:', equipment.name);

            // Validar quantidade
            console.log('📦 Validando quantidade:', createLoanDto.amount, 'vs disponível:', equipment.amount);
            if (createLoanDto.amount <= 0) {
                throw new Error("Quantidade deve ser maior que zero");
            }

            if (createLoanDto.amount > equipment.amount) {
                throw new Error(`Quantidade solicitada (${createLoanDto.amount}) excede a quantidade disponível (${equipment.amount})`);
            }

            // Verificar disponibilidade do equipamento
            console.log('🔍 Verificando disponibilidade do equipamento...');
            const availableAmount = await this.getAvailableEquipmentAmount(createLoanDto.equipmentId);
            if (createLoanDto.amount > availableAmount) {
                throw new Error(`Quantidade solicitada (${createLoanDto.amount}) excede a quantidade disponível (${availableAmount})`);
            }
            console.log('✅ Quantidade disponível:', availableAmount);

            // Validar datas
            console.log('📅 Validando datas...');
            const startDate = new Date(createLoanDto.startDate);
            const endDate = new Date(createLoanDto.endDate);
            const currentDate = new Date();
            
            console.log('📅 Start Date:', startDate);
            console.log('📅 End Date:', endDate);
            console.log('📅 Current Date:', currentDate);

            // Criar período de empréstimo
            console.log('⏰ Criando período de empréstimo...');
            const loanPeriod = LoanPeriod.create(startDate, endDate, currentDate);
            console.log('✅ Período criado:', loanPeriod);

            // Verificar conflitos de horário
            console.log('🔍 Verificando conflitos de horário...');
            await this.validateScheduleConflict(createLoanDto.equipmentId, startDate, endDate, createLoanDto.amount);
            console.log('✅ Nenhum conflito encontrado');

            // Criar entidade Loan
            console.log('📝 Criando entidade Loan...');
            const loan = new Loan();
            loan.period = loanPeriod;
            loan.amount = createLoanDto.amount;
            loan.status = createLoanDto.status || LoanStatus.SCHEDULED;
            loan.user = user;
            loan.equipment = equipment;
            
            console.log('💾 Salvando loan no banco...');
            const createdLoan = await this.loanRepository.create(loan);
            console.log('✅ Loan criado com sucesso:', createdLoan.id);
            
            return this.mapToReturnDto(createdLoan);
        } catch (error: any) {
            console.error('❌ Erro em LoanService.create:', error.message);
            console.error('📋 Stack trace:', error.stack);
            throw error;
        }
    }

    async update(id: number, updateLoanDto: UpdateLoanDto): Promise<void> {
        if (!id || id <= 0) {
            throw new Error("ID do empréstimo deve ser um número positivo");
        }

        const loan = await this.loanRepository.findById(id, ['user', 'equipment']);
        if (!loan) {
            throw new Error(`Empréstimo com ID ${id} não encontrado`);
        }

        // Verificar se o empréstimo pode ser alterado
        if (loan.status === LoanStatus.RETURNED) {
            throw new Error("Não é possível alterar um empréstimo já finalizado");
        }

        const updateData: Partial<Loan> = {};

        // Atualizar período se fornecido
        if (updateLoanDto.startDate || updateLoanDto.endDate) {
            const startDate = updateLoanDto.startDate ? new Date(updateLoanDto.startDate) : loan.period.withdrawalDate;
            const endDate = updateLoanDto.endDate ? new Date(updateLoanDto.endDate) : loan.period.returnDate;
            const currentDate = new Date();

            const newPeriod = LoanPeriod.create(startDate, endDate, currentDate);
            
            // Verificar conflitos de horário (excluindo o empréstimo atual)
            await this.validateScheduleConflict(loan.equipment.id, startDate, endDate, loan.amount, id);
            
            updateData.period = newPeriod;
        }

        // Atualizar quantidade se fornecida
        if (updateLoanDto.amount !== undefined) {
            if (updateLoanDto.amount <= 0) {
                throw new Error("Quantidade deve ser maior que zero");
            }

            if (updateLoanDto.amount > loan.equipment.amount) {
                throw new Error(`Quantidade solicitada (${updateLoanDto.amount}) excede a quantidade total do equipamento (${loan.equipment.amount})`);
            }

            // Verificar disponibilidade considerando o empréstimo atual
            const availableAmount = await this.getAvailableEquipmentAmount(loan.equipment.id, id);
            if (updateLoanDto.amount > availableAmount) {
                throw new Error(`Quantidade solicitada (${updateLoanDto.amount}) excede a quantidade disponível (${availableAmount})`);
            }

            updateData.amount = updateLoanDto.amount;
        }

        // Atualizar status se fornecido
        if (updateLoanDto.status !== undefined) {
            if (!Object.values(LoanStatus).includes(updateLoanDto.status)) {
                throw new Error("Status inválido");
            }

            // Validações específicas por status
            if (updateLoanDto.status === LoanStatus.IN_PROGRESS) {
                if (loan.status !== LoanStatus.SCHEDULED && loan.status !== LoanStatus.PENDING) {
                    throw new Error("Só é possível iniciar empréstimos agendados ou pendentes");
                }
            }

            if (updateLoanDto.status === LoanStatus.RETURNED) {
                if (loan.status !== LoanStatus.IN_PROGRESS) {
                    throw new Error("Só é possível finalizar empréstimos em andamento");
                }
            }

            updateData.status = updateLoanDto.status;
        }

        await this.loanRepository.update(id, updateData as Loan);
    }

    async delete(id: number): Promise<void> {
        if (!id || id <= 0) {
            throw new Error("ID do empréstimo deve ser um número positivo");
        }

        const loan = await this.loanRepository.findById(id, []);
        if (!loan) {
            throw new Error(`Empréstimo com ID ${id} não encontrado`);
        }

        // Verificar se o empréstimo pode ser excluído
        if (loan.status === LoanStatus.IN_PROGRESS) {
            throw new Error("Não é possível excluir um empréstimo em andamento");
        }

        await this.loanRepository.delete(id);
    }

    async findLoansByUser(userId: number): Promise<ReturnLoanDto[]> {
        if (!userId || userId <= 0) {
            throw new Error("ID do usuário deve ser um número positivo");
        }

        const loans = await this.loanRepository.repository.find({
            where: { user: { id: userId } },
            relations: ['user', 'equipment']
        });

        return loans.map(loan => this.mapToReturnDto(loan));
    }

    async findLoansByEquipment(equipmentId: number): Promise<ReturnLoanDto[]> {
        if (!equipmentId || equipmentId <= 0) {
            throw new Error("ID do equipamento deve ser um número positivo");
        }

        const loans = await this.loanRepository.repository.find({
            where: { equipment: { id: equipmentId } },
            relations: ['user', 'equipment']
        });

        return loans.map(loan => this.mapToReturnDto(loan));
    }

    async findLoansByStatus(status: LoanStatus): Promise<ReturnLoanDto[]> {
        if (!Object.values(LoanStatus).includes(status)) {
            throw new Error("Status inválido");
        }

        const loans = await this.loanRepository.repository.find({
            where: { status },
            relations: ['user', 'equipment']
        });

        return loans.map(loan => this.mapToReturnDto(loan));
    }

    private async getAvailableEquipmentAmount(equipmentId: number, excludeLoanId?: number): Promise<number> {
        console.log('🔍 getAvailableEquipmentAmount - equipmentId:', equipmentId, 'excludeLoanId:', excludeLoanId);
        
        const equipment = await this.equipmentRepository.findById(equipmentId, []);
        if (!equipment) {
            throw new Error(`Equipamento com ID ${equipmentId} não encontrado`);
        }
        console.log('🏐 Equipamento encontrado:', equipment.name, 'quantidade total:', equipment.amount);

        // Usar método mais simples e direto  
        const queryBuilder = this.loanRepository.repository
            .createQueryBuilder('loan')
            .select('COALESCE(SUM(loan.amount), 0)', 'borrowedAmount')
            .where('loan.equipment_id = :equipmentId', { equipmentId })
            .andWhere('loan.status IN (:...activeStatuses)', { 
                activeStatuses: [LoanStatus.SCHEDULED, LoanStatus.IN_PROGRESS, LoanStatus.PENDING] 
            });

        if (excludeLoanId) {
            queryBuilder.andWhere('loan.id != :excludeLoanId', { excludeLoanId });
        }

        console.log('📋 Query SQL:', queryBuilder.getSql());
        console.log('📋 Parâmetros:', queryBuilder.getParameters());

        const result = await queryBuilder.getRawOne();
        console.log('📋 Resultado da query:', result);
        
        const borrowedAmount = parseInt(result.borrowedAmount) || 0;
        const availableAmount = equipment.amount - borrowedAmount;
        
        console.log('📊 Cálculo final:');
        console.log('  - Total do equipamento:', equipment.amount);
        console.log('  - Quantidade emprestada:', borrowedAmount);
        console.log('  - Quantidade disponível:', availableAmount);

        return availableAmount;
    }

    private async validateScheduleConflict(
        equipmentId: number, 
        startDate: Date, 
        endDate: Date, 
        amount: number, 
        excludeLoanId?: number
    ): Promise<void> {
        const conflictingLoansQuery = this.loanRepository.repository
            .createQueryBuilder('loan')
            .where('loan.equipment.id = :equipmentId', { equipmentId })
            .andWhere('loan.status IN (:...activeStatuses)', { 
                activeStatuses: [LoanStatus.SCHEDULED, LoanStatus.IN_PROGRESS, LoanStatus.PENDING] 
            })
            .andWhere(
                '(loan.period.withdrawalDate < :endDate AND loan.period.returnDate > :startDate)',
                { startDate, endDate }
            );

        if (excludeLoanId) {
            conflictingLoansQuery.andWhere('loan.id != :excludeLoanId', { excludeLoanId });
        }

        const conflictingLoans = await conflictingLoansQuery.getMany();
        
        if (conflictingLoans.length > 0) {
            const totalConflictingAmount = conflictingLoans.reduce((sum, loan) => sum + loan.amount, 0);
            const equipment = await this.equipmentRepository.findById(equipmentId, []);
            
            if (totalConflictingAmount + amount > equipment!.amount) {
                throw new Error("Período solicitado conflita com outros empréstimos do equipamento");
            }
        }
    }

    private mapToReturnDto(loan: Loan): ReturnLoanDto {
        if (!loan.user) {
            throw new Error('Dados do usuário não carregados. Inclua a relação "user" na consulta.');
        }
        
        if (!loan.equipment) {
            throw new Error('Dados do equipamento não carregados. Inclua a relação "equipment" na consulta.');
        }

        return {
            id: loan.id,
            startDate: loan.period.withdrawalDate,
            endDate: loan.period.returnDate,
            amount: loan.amount,
            status: loan.status,
            user: {
                id: loan.user.id,
                name: loan.user.name,
                email: loan.user.email.getEmail()
            },
            equipment: {
                id: loan.equipment.id,
                name: loan.equipment.name,
                imageUrl: loan.equipment.ImageUrl
            },
            createdAt: (loan as any).createdAt,
            updatedAt: (loan as any).updatedAt
        };
    }
} 