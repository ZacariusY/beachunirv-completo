import { Equipment } from "../model/entities/Equipment";
import { CrudServiceInterface } from "./CrudServiceInterface";
import { EquipmentRepository } from "../repository/Equipment";
import { 
    CreateEquipmentDto, 
    ReturnEquipmentDto, 
    UpdateEquipmentDto 
} from "../model/dtos";
import { EsportRepository } from "../repository/EsportRepository";

export class EquipmentService implements CrudServiceInterface<Equipment, ReturnEquipmentDto, CreateEquipmentDto, UpdateEquipmentDto> {
    
    constructor(
        private readonly equipmentRepository: EquipmentRepository,
        private readonly esportRepository: EsportRepository
    ) {}

    async findById(id: number, relations: string[] = []): Promise<ReturnEquipmentDto> {
        if (!id || id <= 0) {
            throw new Error("ID do equipamento deve ser um número positivo");
        }

        const equipment = await this.equipmentRepository.findById(id, relations);
        if (!equipment) {
            throw new Error(`Equipamento com ID ${id} não encontrado`);
        }

        // Calcular quantidade disponível
        const availableAmount = await this.getAvailableEquipmentAmount(equipment.id);
        return this.mapToReturnDto(equipment, availableAmount);
    }

    async delete(id: number): Promise<void> {
        if (!id || id <= 0) {
            throw new Error("ID do equipamento deve ser um número positivo");
        }

        const equipment = await this.equipmentRepository.findById(id, []);
        if (!equipment) {
            throw new Error(`Equipamento com ID ${id} não encontrado`);
        }

        // Verificar se há empréstimos ativos para este equipamento
        const activeLoans = await this.equipmentRepository.repository
            .createQueryBuilder('equipment')
            .leftJoin('equipment.loans', 'loan')
            .where('equipment.id = :id', { id })
            .andWhere('loan.status IN (:...activeStatuses)', { 
                activeStatuses: ['SCHEDULED', 'IN_PROGRESS', 'PENDING'] 
            })
            .getCount();

        if (activeLoans > 0) {
            throw new Error("Não é possível excluir equipamento com empréstimos ativos");
        }

        await this.equipmentRepository.delete(id);
    }

    async create(createEquipmentDto: CreateEquipmentDto): Promise<ReturnEquipmentDto> {
        // Verificar se nome já existe
        const existingEquipment = await this.equipmentRepository.findByName(createEquipmentDto.name);

        if (existingEquipment) {
            throw new Error("Nome do equipamento já está em uso");
        }

        // Verificar se quantidade é válida
        if (createEquipmentDto.amount <= 0) {
            throw new Error("Quantidade deve ser maior que zero");
        }

        // Criar entidade Equipment
        const equipment = new Equipment();
        equipment.name = createEquipmentDto.name;
        equipment.amount = createEquipmentDto.amount;
        equipment.ImageUrl = createEquipmentDto.imageUrl;

        const createdEquipment = await this.equipmentRepository.create(equipment);
        // Para equipamento recém-criado, quantidade disponível = quantidade total
        return this.mapToReturnDto(createdEquipment, createdEquipment.amount);
    }

    async update(id: number, updateEquipmentDto: UpdateEquipmentDto): Promise<void> {
        if (!id || id <= 0) {
            throw new Error("ID do equipamento deve ser um número positivo");
        }

        // Verificar se equipamento existe
        const existingEquipment = await this.equipmentRepository.findById(id, []);
        if (!existingEquipment) {
            throw new Error(`Equipamento com ID ${id} não encontrado`);
        }

        // Preparar dados para atualização
        const updateData: Partial<Equipment> = {};

        if (updateEquipmentDto.name) {
            // Verificar se novo nome já existe (exceto para o equipamento atual)
            const equipmentWithName = await this.equipmentRepository.findByName(updateEquipmentDto.name);
            
            if (equipmentWithName && equipmentWithName.id !== id) {
                throw new Error("Nome do equipamento já está em uso por outro equipamento");
            }

            updateData.name = updateEquipmentDto.name;
        }

        if (updateEquipmentDto.amount !== undefined) {
            if (updateEquipmentDto.amount <= 0) {
                throw new Error("Quantidade deve ser maior que zero");
            }

            // Verificar se a nova quantidade não é menor que a quantidade emprestada
            const borrowedAmount = await this.equipmentRepository.repository
                .createQueryBuilder('equipment')
                .leftJoin('equipment.loans', 'loan')
                .where('equipment.id = :id', { id })
                .andWhere('loan.status IN (:...activeStatuses)', { 
                    activeStatuses: ['SCHEDULED', 'IN_PROGRESS', 'PENDING'] 
                })
                .select('COALESCE(SUM(loan.amount), 0)', 'borrowedAmount')
                .getRawOne();

            const currentBorrowed = parseInt(borrowedAmount.borrowedAmount) || 0;
            if (updateEquipmentDto.amount < currentBorrowed) {
                throw new Error(`Quantidade não pode ser menor que ${currentBorrowed} (quantidade atualmente emprestada)`);
            }

            updateData.amount = updateEquipmentDto.amount;
        }

        if (updateEquipmentDto.imageUrl) {
            updateData.ImageUrl = updateEquipmentDto.imageUrl;
        }

        await this.equipmentRepository.update(id, updateData as Equipment);
    }

    async findAll(relations: string[] = []): Promise<ReturnEquipmentDto[]> {
        const equipments = await this.equipmentRepository.findAll(relations);
        
        // Calcular quantidade disponível para cada equipamento
        const equipmentsWithAvailability = await Promise.all(
            equipments.map(async (equipment) => {
                const availableAmount = await this.getAvailableEquipmentAmount(equipment.id);
                return this.mapToReturnDto(equipment, availableAmount);
            })
        );
        
        return equipmentsWithAvailability;
    }

    

    async findByName(name: string): Promise<Equipment | null> {
        if (!name) {
            throw new Error("Nome do equipamento é obrigatório");
        }

        return await this.equipmentRepository.findByName(name);
    }

    async findEquipmentsByEsport(esportId: number): Promise<ReturnEquipmentDto[]> {
        if (!esportId || esportId <= 0) {
            throw new Error("ID do esporte deve ser um número positivo");
        }

        const equipments = await this.equipmentRepository.findByEsportId(esportId);

        // Calcular quantidade disponível para cada equipamento
        const equipmentsWithAvailability = await Promise.all(
            equipments.map(async (equipment) => {
                const availableAmount = await this.getAvailableEquipmentAmount(equipment.id);
                return this.mapToReturnDto(equipment, availableAmount);
            })
        );
        
        return equipmentsWithAvailability;
    }

    async addEsportToEquipment(equipmentId: number, esportId: number): Promise<void> {
        if (!equipmentId || equipmentId <= 0) {
            throw new Error("ID do equipamento deve ser um número positivo");
        }

        if (!esportId || esportId <= 0) {
            throw new Error("ID do esporte deve ser um número positivo");
        }

        const equipment = await this.equipmentRepository.findById(equipmentId, ['esports']);
        if (!equipment) {
            throw new Error(`Equipamento com ID ${equipmentId} não encontrado`);
        }

        // Verificar se esporte já está associado
        const esportAlreadyAssociated = equipment.esports.some(esport => esport.id === esportId);
        if (esportAlreadyAssociated) {
            throw new Error("Esporte já está associado a este equipamento");
        }

        // Buscar o esporte
        const esport = await this.esportRepository.findById(esportId, []);

        if (!esport) {
            throw new Error(`Esporte com ID ${esportId} não encontrado`);
        }

        // Adicionar esporte ao equipamento
        equipment.esports.push(esport);
        await this.equipmentRepository.repository.save(equipment);
    }

    async removeEsportFromEquipment(equipmentId: number, esportId: number): Promise<void> {
        if (!equipmentId || equipmentId <= 0) {
            throw new Error("ID do equipamento deve ser um número positivo");
        }

        if (!esportId || esportId <= 0) {
            throw new Error("ID do esporte deve ser um número positivo");
        }

        const equipment = await this.equipmentRepository.findById(equipmentId, ['esports']);
        if (!equipment) {
            throw new Error(`Equipamento com ID ${equipmentId} não encontrado`);
        }

        // Remover esporte do equipamento
        equipment.esports = equipment.esports.filter(esport => esport.id !== esportId);
        await this.equipmentRepository.repository.save(equipment);
    }

    // Método para calcular quantidade disponível de um equipamento
    private async getAvailableEquipmentAmount(equipmentId: number): Promise<number> {
        console.log('🔍 EquipmentService - getAvailableEquipmentAmount - equipmentId:', equipmentId);
        
        const equipment = await this.equipmentRepository.findById(equipmentId, []);
        if (!equipment) {
            throw new Error(`Equipamento com ID ${equipmentId} não encontrado`);
        }

        // Calcular quantidade emprestada (empréstimos ativos)
        const result = await this.equipmentRepository.repository
            .createQueryBuilder('equipment')
            .leftJoin('equipment.loans', 'loan')
            .select('COALESCE(SUM(loan.amount), 0)', 'borrowedAmount')
            .where('equipment.id = :equipmentId', { equipmentId })
            .andWhere('loan.status IN (:...activeStatuses)', { 
                activeStatuses: ['SCHEDULED', 'IN_PROGRESS', 'PENDING'] 
            })
            .getRawOne();

        const borrowedAmount = parseInt(result.borrowedAmount) || 0;
        const availableAmount = equipment.amount - borrowedAmount;
        
        console.log('📊 EquipmentService - Cálculo disponibilidade:');
        console.log('  - Equipamento:', equipment.name);
        console.log('  - Total:', equipment.amount);
        console.log('  - Emprestada:', borrowedAmount);
        console.log('  - Disponível:', availableAmount);

        return Math.max(0, availableAmount); // Garantir que não seja negativo
    }

    // Método auxiliar para mapear Equipment para ReturnEquipmentDto
    private mapToReturnDto(equipment: Equipment, availableAmount?: number): ReturnEquipmentDto {
        return {
            id: equipment.id,
            name: equipment.name,
            amount: availableAmount !== undefined ? availableAmount : equipment.amount,
            imageUrl: equipment.ImageUrl
        };
    }

}