import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from "class-validator";

export class LoginDto {
    @IsNotEmpty({ message: "Email é obrigatório" })
    @IsEmail({}, { message: "Email deve ser válido" })
    email!: string;

    @IsNotEmpty({ message: "Senha é obrigatória" })
    @IsString({ message: "Senha deve ser uma string" })
    @MinLength(6, { message: "Senha deve ter pelo menos 6 caracteres" })
    password!: string;
}

export class RegisterDto {
    @IsNotEmpty({ message: "Nome é obrigatório" })
    @IsString({ message: "Nome deve ser uma string" })
    @MinLength(2, { message: "Nome deve ter pelo menos 2 caracteres" })
    name!: string;

    @IsNotEmpty({ message: "Email é obrigatório" })
    @IsEmail({}, { message: "Email deve ser válido" })
    email!: string;

    @IsNotEmpty({ message: "Senha é obrigatória" })
    @IsString({ message: "Senha deve ser uma string" })
    @MinLength(6, { message: "Senha deve ter pelo menos 6 caracteres" })
    password!: string;

    @IsOptional()
    @IsString({ message: "URL da imagem de perfil deve ser uma string" })
    profileImageUrl?: string;
}

export class ChangePasswordDto {
    @IsNotEmpty({ message: "Senha atual é obrigatória" })
    @IsString({ message: "Senha atual deve ser uma string" })
    currentPassword!: string;

    @IsNotEmpty({ message: "Nova senha é obrigatória" })
    @IsString({ message: "Nova senha deve ser uma string" })
    @MinLength(6, { message: "Nova senha deve ter pelo menos 6 caracteres" })
    newPassword!: string;
} 