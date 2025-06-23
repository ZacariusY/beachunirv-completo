import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { LoanStatus } from "../enum/Status";
import { LoanPeriod } from "../value-objects/LoanPeriod";
import { User } from "./user";
import { Equipment } from "./Equipment";

@Entity('loans')
export class Loan {
    
    @PrimaryGeneratedColumn()
    id!: number;

    @Column(() => LoanPeriod, {prefix: false})
    period!: LoanPeriod;

    @Column()
    amount!: number;

    @Column({
        type: "varchar", 
        enum: LoanStatus,
        nullable: true
    })
    status!: LoanStatus;

    @ManyToOne(() => User, (user) => user.loans,)
    @JoinColumn({name: 'user_id'})
    user!: User

    @ManyToOne(() => Equipment, (equipment) => equipment.loans)
    @JoinColumn({name: 'equipment_id'})
    equipment!: Equipment

}
