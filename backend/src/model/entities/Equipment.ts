import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Esport } from "./Esport";
import { Loan } from "./Loan";

@Entity('equipments')
export class Equipment {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({unique: true})
    name!: string;

    @Column()
    amount!: number;

    @Column({name: 'image_url'})
    ImageUrl!: string;

    @ManyToMany(() => Esport, (esport) => esport.equipments)
    @JoinTable()
    esports!: Esport[];

    @OneToMany(() => Loan, (loan) => loan.equipment)
    loans!: Loan[]
}