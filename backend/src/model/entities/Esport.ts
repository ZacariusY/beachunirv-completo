import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Equipment } from "./Equipment";

@Entity('esports')
export class Esport {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({unique: true})
    name!: string;

    @ManyToMany(() => Equipment, (equipment) => equipment.esports)
    equipments!: Equipment[];
}