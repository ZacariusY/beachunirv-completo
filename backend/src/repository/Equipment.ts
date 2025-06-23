import { Repository } from "typeorm";
import { RepositoryBase } from "./RepositoryBase";
import { Equipment } from "../model/entities/Equipment";
import { AppDataSource } from "../data_source";

export class EquipmentRepository extends RepositoryBase<Equipment> {
    
    public readonly repository: Repository<Equipment>;

    constructor(){
        super(AppDataSource.getRepository(Equipment));
        this.repository = AppDataSource.getRepository(Equipment);
    }

    findByName(name: string): Promise<Equipment | null> {
        return this.repository.findOne({ where: { name } });
    }

    findByEsportId(esportId: number): Promise<Equipment[]> {
        return this.repository.find({ where: { esports: { id: esportId } } });
    }

}