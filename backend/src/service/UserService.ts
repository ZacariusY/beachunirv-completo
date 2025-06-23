import { User } from "../model/entities/user";
import { CrudServiceInterface } from "./CrudServiceInterface";
import { UserRepository } from "../repository/UserRepository";
import { 
    CreateUserDto, 
    ReturnUserDto, 
    UpdateUserDto
} from "../model/dtos";
import { Email } from "../model/value-objects/Email";
import { HashedPassword } from "../model/value-objects/HashedPassword";
import { Role } from "../model/enum/Roles";
import { BadRequestError } from "../model/exceptions/BadRequestError";

export class UserService implements CrudServiceInterface<User, ReturnUserDto, CreateUserDto, UpdateUserDto> {
    
    constructor(private readonly userRepository: UserRepository) {}

    async findById(id: number, relations: string[] = []): Promise<ReturnUserDto> {
        if (!id || id <= 0) {
            throw new Error("ID do usuário deve ser um número positivo");
        }

        const user = await this.userRepository.findById(id, relations);
        if (!user) {
            throw new Error(`Usuário com ID ${id} não encontrado`);
        }

        return this.mapToReturnDto(user);
    }

    async delete(id: number): Promise<void> {
        if (!id || id <= 0) {
            throw new Error("ID do usuário deve ser um número positivo");
        }

        const user = await this.userRepository.findById(id, []);
        if (!user) {
            throw new Error(`Usuário com ID ${id} não encontrado`);
        }

        await this.userRepository.delete(id);
    }

    async create(createUserDto: CreateUserDto): Promise<ReturnUserDto> {
        // Verificar se email já existe
        const existingUser = await this.userRepository.findByEmail(createUserDto.email);
        
        if (existingUser) {
            throw new Error("Email já está em uso");
        }

        // Criar value objects
        const email = Email.Create(createUserDto.email);
        const hashedPassword = await HashedPassword.create(createUserDto.password);

        // Criar entidade User
        const user = new User();
        user.name = createUserDto.name;
        user.email = email;
        user.hashedPassword = hashedPassword;
        user.role = createUserDto.role || Role.ATLETA;
        user.status = true;
        
        if (createUserDto.profileImageUrl) {
            user.profileImageUrl = createUserDto.profileImageUrl;
        }

        const createdUser = await this.userRepository.create(user);
        return this.mapToReturnDto(createdUser);
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<void> {
        if (!id || id <= 0) {
            throw new Error("ID do usuário deve ser um número positivo");
        }

        // Verificar se usuário existe
        const existingUser = await this.userRepository.findById(id, []);
        if (!existingUser) {
            throw new Error(`Usuário com ID ${id} não encontrado`);
        }

        // Preparar dados para atualização
        const updateData: Partial<User> = {};

        if (updateUserDto.name) {
            updateData.name = updateUserDto.name;
        }

        if (updateUserDto.email) {
            // Verificar se novo email já existe (exceto para o usuário atual)
            const userWithEmail = await this.userRepository.findByEmail(updateUserDto.email);
            
            if (userWithEmail && userWithEmail.id !== id) {
                throw new Error("Email já está em uso por outro usuário");
            }

            updateData.email = Email.Create(updateUserDto.email);
        }

        if (updateUserDto.password) {
            updateData.hashedPassword = await HashedPassword.create(updateUserDto.password);
        }

        if (updateUserDto.profileImageUrl !== undefined) {
            updateData.profileImageUrl = updateUserDto.profileImageUrl;
        }

        if (updateUserDto.role) {
            updateData.role = updateUserDto.role;
        }

        if (updateUserDto.status !== undefined) {
            updateData.status = updateUserDto.status;
        }

        await this.userRepository.update(id, updateData as User);
    }

    async findAll(relations: string[] = []): Promise<ReturnUserDto[]> {
        const users = await this.userRepository.findAll(relations);
        return users.map(user => this.mapToReturnDto(user));
    }

    // Métodos específicos do UserService
    
    async findByEmail(email: string): Promise<User | null> {
        if (!email) {
            throw new Error("Email é obrigatório");
        }

        return await this.userRepository.findByEmail(email);
    }

    async findByRole(role: Role): Promise<User[]> {
        return await this.userRepository.findByRole(role);
    }

    async activateUser(id: number): Promise<void> {
        if (!id || id <= 0) {
            throw new Error("ID do usuário deve ser um número positivo");
        }

        const user = await this.userRepository.findById(id, []);
        if (!user) {
            throw new Error(`Usuário com ID ${id} não encontrado`);
        }

        await this.userRepository.update(id, { status: true } as User);
    }

    async deactivateUser(id: number): Promise<void> {
        if (!id || id <= 0) {
            throw new Error("ID do usuário deve ser um número positivo");
        }

        const user = await this.userRepository.findById(id, []);
        if (!user) {
            throw new Error(`Usuário com ID ${id} não encontrado`);
        }

        await this.userRepository.update(id, { status: false } as User);
    }

    async changePassword(id: number, currentPassword: string, newPassword: string): Promise<void> {
        if (!id || id <= 0) {
            throw new Error("ID do usuário deve ser um número positivo");
        }

        const user = await this.userRepository.findById(id, []);
        if (!user) {
            throw new Error(`Usuário com ID ${id} não encontrado`);
        }

        // Verificar senha atual
        const isCurrentPasswordValid = await user.hashedPassword.checkPassword(currentPassword);
        if (!isCurrentPasswordValid) {
            throw new Error("Senha atual incorreta");
        }

        // Criar nova senha hash
        const newHashedPassword = await HashedPassword.create(newPassword);
        
        await this.userRepository.update(id, { hashedPassword: newHashedPassword } as User);
    }

    // Método auxiliar para mapear User para ReturnUserDto
    private mapToReturnDto(user: User): ReturnUserDto {
        return {
            id: user.id,
            name: user.name,
            email: user.email.getEmail(),
            profileImageUrl: user.profileImageUrl,
            role: user.role,
            status: user.status
        };
    }

    // Método para criar usuários de teste
    async createTestUsers(): Promise<ReturnUserDto[]> {
        const testUsers = [
            {
                name: "Admin Teste",
                email: "admin@academico.unirv.edu.br",
                password: "123456",
                role: Role.ADM
            },
            {
                name: "Atleta Teste",
                email: "atleta@academico.unirv.edu.br", 
                password: "123456",
                role: Role.ATLETA
            },
            {
                name: "Professor Teste",
                email: "professor@professor.unirv.edu.br",
                password: "123456", 
                role: Role.ATLETA
            }
        ];

        const createdUsers: ReturnUserDto[] = [];

        for (const userData of testUsers) {
            try {
                // Verifica se usuário já existe
                const existingUser = await this.userRepository.findByEmail(userData.email);
                if (!existingUser) {
                    const newUser = new User();
                    newUser.name = userData.name;
                    newUser.email = Email.Create(userData.email);
                    newUser.hashedPassword = await HashedPassword.create(userData.password);
                    newUser.role = userData.role;
                    newUser.status = true;

                    const savedUser = await this.userRepository.create(newUser);
                    createdUsers.push(new ReturnUserDto(savedUser));
                    console.log(`Usuário teste criado: ${userData.email}`);
                } else {
                    console.log(`Usuário teste já existe: ${userData.email}`);
                    createdUsers.push(new ReturnUserDto(existingUser));
                }
            } catch (error) {
                console.error(`Erro ao criar usuário teste ${userData.email}:`, error);
            }
        }

        return createdUsers;
    }

}