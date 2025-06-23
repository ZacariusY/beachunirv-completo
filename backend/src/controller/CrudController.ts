import { Request, Response } from 'express';
import { CrudServiceInterface } from '../service/CrudServiceInterface';

export class CrudController<T, createDto = T, updateDto = T, responseDto = T> {
    constructor(private service: CrudServiceInterface<T, createDto, updateDto, responseDto>
    ) {}

    async findAll(req: Request, res: Response): Promise<void> {

        const relationsArray = this.findRelations(req);
        console.log('🔍 CrudController.findAll - Relations:', relationsArray);
        const items = await this.service.findAll(relationsArray);
        console.log('📊 CrudController.findAll - Total items encontrados:', items.length);
        console.log('📋 CrudController.findAll - Items:', items);
        res.status(200).json(items);
    }

    async findById(req: Request, res: Response): Promise<void> {
        
        const id = Number(req.params.id);
        const relationsArray = this.findRelations(req);
        const item = await this.service.findById(id, relationsArray);
        if (!item) {
            res.status(404).json({ message: 'Item não encontrado' });
            return;
        }
        res.status(200).json(item);
    }

    async create(req: Request, res: Response): Promise<void> {
   
        const item = await this.service.create(req.body);
        res.status(201).json(item);
    }

    async update(req: Request, res: Response): Promise<void> {

        const id = Number(req.params.id);
        const item = await this.service.update(id, req.body);
        res.status(204).json(item);
    }

    findRelations(req: Request): string[] {

        const { relations } = req.query;

        let relationsArray: string[] = [];

        if (relations) {
            if (typeof relations === 'string') {
            relationsArray = relations.split(',').map(r => r.trim());
            }
        }

        return relationsArray;
    }
}