import { Request, Response } from 'express';
import { CrudController } from './CrudController';
import { EquipmentService } from '../service/EquipmentService';
import { Equipment } from '../model/entities/Equipment';
import { CreateEquipmentDto, ReturnEquipmentDto, UpdateEquipmentDto } from '../model/dtos';

export class EquipmentController extends CrudController<Equipment, ReturnEquipmentDto, CreateEquipmentDto, UpdateEquipmentDto> {
    
    constructor(private equipmentService: EquipmentService) {
        super(equipmentService);
    }

    async findByName(req: Request, res: Response): Promise<void> {
        const { name } = req.params;
        const equipment = await this.equipmentService.findByName(name);     
        res.status(200).json(equipment);
    }

    async findEquipmentsByEsport(req: Request, res: Response): Promise<void> {
        const { esportId } = req.params;
        const equipments = await this.equipmentService.findEquipmentsByEsport(Number(esportId));
        res.status(200).json(equipments);
    }

    async addEsportToEquipment(req: Request, res: Response): Promise<void> {
        const { equipmentId, esportId } = req.params;
        await this.equipmentService.addEsportToEquipment(Number(equipmentId), Number(esportId));
        res.status(200).json({ message: 'Esporte adicionado ao equipamento com sucesso' });
    }

    async removeEsportFromEquipment(req: Request, res: Response): Promise<void> {
        const { equipmentId, esportId } = req.params;
        await this.equipmentService.removeEsportFromEquipment(Number(equipmentId), Number(esportId));
        res.status(200).json({ message: 'Esporte removido do equipamento com sucesso' });
    }

    async create(req: Request, res: Response): Promise<void> {
        const equipment = await this.equipmentService.create(req.body);
        res.status(201).json(equipment);
    }

    async update(req: Request, res: Response): Promise<void> {
        const id = Number(req.params.id);
        await this.equipmentService.update(id, req.body);
        res.status(204).send();
    }

    async delete(req: Request, res: Response): Promise<void> {
        const id = Number(req.params.id);
        await this.equipmentService.delete(id);
        res.status(204).send();
    }
} 