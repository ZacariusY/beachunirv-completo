import { Esport } from "../model/entities/Esport";
import { CrudServiceInterface } from "./CrudServiceInterface";
import { EsportRepository } from "../repository/EsportRepository";
import { 
    CreateEsportDto, 
    ReturnEsportDto, 
    UpdateEsportDto 
} from "../model/dtos";

export class EsportService implements CrudServiceInterface<Esport, ReturnEsportDto, CreateEsportDto, UpdateEsportDto> {
    
    constructor(
        private readonly esportRepository: EsportRepository
    ) {}

    async findAll(relations: string[] = []): Promise<ReturnEsportDto[]> {
        const esports = await this.esportRepository.findAll(relations);
        return esports.map(esport => this.mapToReturnDto(esport));
    }

    async findById(id: number, relations: string[] = []): Promise<ReturnEsportDto> {
        if (!id || id <= 0) {
            throw new Error("ID do esporte deve ser um número positivo");
        }

        const esport = await this.esportRepository.findById(id, relations);
        if (!esport) {
            throw new Error(`Esporte com ID ${id} não encontrado`);
        }

        return this.mapToReturnDto(esport);
    }

    async create(createEsportDto: CreateEsportDto): Promise<ReturnEsportDto> {

        // Verificar se nome já existe
        const existingEsport = await this.esportRepository.findByName(createEsportDto.name.trim());
        if (existingEsport) {
            throw new Error("Nome do esporte já está em uso");
        }

        // Criar entidade Esport
        const esport = new Esport();
        esport.name = createEsportDto.name.trim();

        const createdEsport = await this.esportRepository.create(esport);
        return this.mapToReturnDto(createdEsport);
    }

    async update(id: number, updateEsportDto: UpdateEsportDto): Promise<void> {
        if (!id || id <= 0) {
            throw new Error("ID do esporte deve ser um número positivo");
        }

        // Verificar se esporte existe
        const existingEsport = await this.esportRepository.findById(id, []);
        if (!existingEsport) {
            throw new Error(`Esporte com ID ${id} não encontrado`);
        }

        // Preparar dados para atualização
        const updateData: Partial<Esport> = {};

        if (updateEsportDto.name !== undefined) {

            // Verificar se novo nome já existe (exceto para o esporte atual)
            const esportWithName = await this.esportRepository.findByName(updateEsportDto.name.trim());
            
            if (esportWithName && esportWithName.id !== id) {
                throw new Error("Nome do esporte já está em uso por outro esporte");
            }

            updateData.name = updateEsportDto.name.trim();
        }

        await this.esportRepository.update(id, updateData as Esport);
    }

    async delete(id: number): Promise<void> {
        if (!id || id <= 0) {
            throw new Error("ID do esporte deve ser um número positivo");
        }

        const esport = await this.esportRepository.findById(id, ['equipments']);
        if (!esport) {
            throw new Error(`Esporte com ID ${id} não encontrado`);
        }

        // Verificar se há equipamentos associados a este esporte
        if (esport.equipments && esport.equipments.length > 0) {
            throw new Error("Não é possível excluir esporte que possui equipamentos associados");
        }

        await this.esportRepository.delete(id);
    }

    async findByName(name: string): Promise<Esport | null> {
        if (!name || name.trim() === '') {
            throw new Error("Nome do esporte é obrigatório");
        }

        return await this.esportRepository.findByName(name.trim());
    }

    private mapToReturnDto(esport: Esport): ReturnEsportDto {
        return {
            id: esport.id,
            name: esport.name,
            createdAt: (esport as any).createdAt,
            updatedAt: (esport as any).updatedAt
        };
    }
}
