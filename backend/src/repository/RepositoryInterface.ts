import { UpdateResult } from "typeorm";

export interface RepositoryInterface<T> {

    findAll(relations: string[]): Promise<T[]>;
    findById(id: number, relations: string[]): Promise<T | null>;
    create(data: T): Promise<T>;
    update(id: number, data: T): Promise<UpdateResult> ;
}