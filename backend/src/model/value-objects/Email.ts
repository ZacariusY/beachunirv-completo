    import { Column } from "typeorm";

    export class Email {

        @Column({unique: true, name: 'email'})
        private readonly email: string;

        private constructor(email: string) {
            this.email = email;
        }

        public static Create(email: string): Email {
            this.isValidEmailFormat(email);
            this.isValidDomain(email);
            return new Email(email);
        }

        private static isValidDomain(email: string): void {
            const allowedDomains = [
                "@academico.unirv.edu.br",
                "@professor.unirv.edu.br"
            ];
            
            const domain = email.substring(email.lastIndexOf("@"));

            if (!allowedDomains.includes(domain.toLowerCase())) { // Comparar em minúsculas para ser case-insensitive
                throw new Error(`Domínio do email não permitido. Domínios aceitos: ${allowedDomains.join(", ")}`);
            }
        }

        private static isValidEmailFormat(email: string): void {
            if (!email || email.trim() === "") { // Adicionada verificação de email vazio ou nulo
                throw new Error('O email não pode estar vazio.');
            }
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if(!regex.test(email)) {
                throw new Error('Formato de email inválido.');
            }
        }

        public getEmail(): string {
            return this.email;
        }
    }