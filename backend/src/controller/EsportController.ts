import { Request, Response } from 'express';
import { CrudController } from './CrudController';
import { EsportService } from '../service/EsportService';
import { Esport } from '../model/entities/Esport';
import { CreateEsportDto, ReturnEsportDto, UpdateEsportDto } from '../model/dtos';

export class EsportController extends CrudController<Esport, ReturnEsportDto, CreateEsportDto, UpdateEsportDto> {
    
    constructor(private esportService: EsportService) {
        super(esportService);
    }

    async findByName(req: Request, res: Response): Promise<void> {
        const { name } = req.params;
        const esport = await this.esportService.findByName(name);        
        res.status(200).json(esport);
    }

    async create(req: Request, res: Response): Promise<void> {
        const esport = await this.esportService.create(req.body);
        res.status(201).json(esport);
    }

    async update(req: Request, res: Response): Promise<void> {
        const id = Number(req.params.id);
        await this.esportService.update(id, req.body);
        res.status(204).send();
    }

    async delete(req: Request, res: Response): Promise<void> {
        const id = Number(req.params.id);
        await this.esportService.delete(id);
        res.status(204).send();
    }
} 