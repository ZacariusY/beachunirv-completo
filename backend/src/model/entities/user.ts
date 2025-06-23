import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Email } from "../value-objects/Email";
import { HashedPassword } from "../value-objects/HashedPassword";
import { Role } from "../enum/Roles";
import { Loan } from "./Loan";

@Entity('users')
export class User {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column(() => Email, { prefix: false })
    email!: Email;

    @Column(() => HashedPassword, { prefix: false })
    hashedPassword!: HashedPassword;

    @Column({name: 'profile_image_url', nullable: true })
    profileImageUrl!: string;

    @Column({
        type: "varchar", 
        enum: Role,      
        default: Role.ATLETA
    })
    role!: Role;

    @Column({default: true})
    status!: boolean;

    @OneToMany(() => Loan, (loan) => loan.user)
    loans!: Loan[]
    
}