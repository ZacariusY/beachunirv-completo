import { Repository } from "typeorm";
import { RepositoryBase } from "./RepositoryBase";
import { Esport } from "../model/entities/Esport";
import { AppDataSource } from "../data_source";

export class EsportRepository extends RepositoryBase<Esport> {
    
    constructor(){
        super(AppDataSource.getRepository(Esport));
    }

    findByName(name: string): Promise<Esport | null> {
        return this.repository.findOne({ where: { name: name } });
    }

    findByEquipmentId(equipmentId: number): Promise<Esport | null> {
        return this.repository.findOne({ where: { equipments: { id: equipmentId } } });
    }   
}