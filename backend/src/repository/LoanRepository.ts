import { Repository } from "typeorm";
import { RepositoryBase } from "./RepositoryBase";
import { Loan } from "../model/entities/Loan";
import { AppDataSource } from "../data_source";

export class LoanRepository extends RepositoryBase<Loan> {
    
    public readonly repository: Repository<Loan>;

    constructor(){
        super(AppDataSource.getRepository(Loan));
        this.repository = AppDataSource.getRepository(Loan);
    }

    // Override findAll para garantir que as relações sejam carregadas
    public async findAll(relations: string[] = []): Promise<Loan[]> {
        console.log('🔍 LoanRepository.findAll - Relations:', relations);
        
        try {
            // Sempre usar query builder para garantir que as relações sejam carregadas
            let query = this.repository.createQueryBuilder('loan')
                .leftJoinAndSelect('loan.user', 'user')
                .leftJoinAndSelect('loan.equipment', 'equipment');
            
            console.log('📋 Usando QueryBuilder com todas as relações obrigatórias');
            
            const result = await query.getMany();
            console.log('📊 QueryBuilder resultado:', result.length, 'loans');
            
            if (result.length > 0) {
                console.log('👤 Primeiro loan tem user?:', !!result[0].user);
                console.log('🏐 Primeiro loan tem equipment?:', !!result[0].equipment);
                console.log('📋 Dados do primeiro loan:');
                console.log('  - ID:', result[0].id);
                console.log('  - Amount:', result[0].amount);
                console.log('  - Status:', result[0].status);
                console.log('  - User ID:', result[0].user?.id);
                console.log('  - Equipment ID:', result[0].equipment?.id);
            } else {
                console.log('⚠️ Nenhum empréstimo encontrado no banco');
            }
            
            return result;
        } catch (error) {
            console.error('❌ Erro em LoanRepository.findAll:', error);
            throw error;
        }
    }

}