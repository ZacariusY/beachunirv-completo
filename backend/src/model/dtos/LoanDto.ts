import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive } from "class-validator";
import { LoanStatus } from "../enum/Status";

export class CreateLoanDto {
    @IsNotEmpty({ message: "Data de início é obrigatória" })
    @IsDateString({}, { message: "Data de início deve ser uma data válida" })
    startDate!: string;

    @IsNotEmpty({ message: "Data de fim é obrigatória" })
    @IsDateString({}, { message: "Data de fim deve ser uma data válida" })
    endDate!: string;

    @IsNotEmpty({ message: "Quantidade é obrigatória" })
    @IsNumber({}, { message: "Quantidade deve ser um número" })
    @IsPositive({ message: "Quantidade deve ser positiva" })
    amount!: number;

    @IsNotEmpty({ message: "ID do usuário é obrigatório" })
    @IsNumber({}, { message: "ID do usuário deve ser um número" })
    userId!: number;

    @IsNotEmpty({ message: "ID do equipamento é obrigatório" })
    @IsNumber({}, { message: "ID do equipamento deve ser um número" })
    equipmentId!: number;

    @IsOptional()
    @IsEnum(LoanStatus, { message: "Status deve ser válido" })
    status?: LoanStatus;
}

export class ReturnLoanDto {
    id!: number;
    startDate!: Date;
    endDate!: Date;
    amount!: number;
    status!: LoanStatus;
    user!: {
        id: number;
        name: string;
        email: string;
    };
    equipment!: {
        id: number;
        name: string;
        imageUrl: string;
    };
    createdAt?: Date;
    updatedAt?: Date;
}

export class UpdateLoanDto {
    @IsOptional()
    @IsDateString({}, { message: "Data de início deve ser uma data válida" })
    startDate?: string;

    @IsOptional()
    @IsDateString({}, { message: "Data de fim deve ser uma data válida" })
    endDate?: string;

    @IsOptional()
    @IsNumber({}, { message: "Quantidade deve ser um número" })
    @IsPositive({ message: "Quantidade deve ser positiva" })
    amount?: number;

    @IsOptional()
    @IsEnum(LoanStatus, { message: "Status deve ser válido" })
    status?: LoanStatus;
} 