import { DeleteResult, FindManyOptions, FindOneOptions, ObjectLiteral, Repository, UpdateResult } from "typeorm";
import { RepositoryInterface } from "./RepositoryInterface";

export abstract class RepositoryBase<T extends ObjectLiteral> implements RepositoryInterface<T>{

    protected readonly repository: Repository<T>;

    constructor(repository: Repository<T>){
        this.repository = repository;
    }

    public findAll(relations: string[]): Promise<T[]> {
        const options: FindManyOptions<T> = {};
        options.relations = relations;
        
        console.log('🔍 RepositoryBase.findAll:');
        console.log('  - Relations solicitadas:', relations);
        console.log('  - Options final:', options);
        
        return this.repository.find(options);
    }

    public findById(id: number, relations: string[]): Promise<T | null> {
        const options: FindOneOptions<T> = {};
        options.relations = relations;
        return this.repository.findOne({
            where: {id} as any,
            ...options
        });
    }

    public delete(id: number): Promise<DeleteResult>{
        return this.repository.delete(id);
    }

    public create(data: T): Promise<T> {
        return this.repository.save(data);
    }

    public update(id: number, data: T): Promise<UpdateResult> {
        return this.repository.update(id, data);
    }


}