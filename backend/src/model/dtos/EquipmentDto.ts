import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUrl } from "class-validator";

export class CreateEquipmentDto {
    @IsNotEmpty({ message: "Nome é obrigatório" })
    @IsString({ message: "Nome deve ser uma string" })
    name!: string;

    @IsNotEmpty({ message: "Quantidade é obrigatória" })
    @IsNumber({}, { message: "Quantidade deve ser um número" })
    @IsPositive({ message: "Quantidade deve ser positiva" })
    amount!: number;

    @IsNotEmpty({ message: "URL da imagem é obrigatória" })
    @IsUrl({}, { message: "URL da imagem deve ser válida" })
    imageUrl!: string;

    @IsOptional()
    @IsNumber({}, { each: true, message: "IDs dos esportes devem ser números" })
    esportIds?: number[];
}

export class ReturnEquipmentDto {
    id!: number;
    name!: string;
    amount!: number;
    imageUrl!: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export class UpdateEquipmentDto {
    @IsOptional()
    @IsString({ message: "Nome deve ser uma string" })
    name?: string;

    @IsOptional()
    @IsNumber({}, { message: "Quantidade deve ser um número" })
    @IsPositive({ message: "Quantidade deve ser positiva" })
    amount?: number;

    @IsOptional()
    @IsUrl({}, { message: "URL da imagem deve ser válida" })
    imageUrl?: string;

    @IsOptional()
    @IsNumber({}, { each: true, message: "IDs dos esportes devem ser números" })
    esportIds?: number[];
} 