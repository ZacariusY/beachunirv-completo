import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateEsportDto {
    @IsNotEmpty({ message: "Nome é obrigatório" })
    @IsString({ message: "Nome deve ser uma string" })
    name!: string;
}

export class ReturnEsportDto {
    id!: number;
    name!: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export class UpdateEsportDto {
    @IsOptional()
    @IsString({ message: "Nome deve ser uma string" })
    name?: string;
} 