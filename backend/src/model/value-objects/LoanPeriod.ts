import { Column } from "typeorm";

export class LoanPeriod {

    @Column({ name: 'withdrawal_date', type: 'timestamp' }) 
    public readonly withdrawalDate: Date;

    @Column({ name: 'return_date', type: 'timestamp' }) 
    public readonly returnDate: Date;

    private constructor(withdrawalDate: Date, returnDate: Date) {
        this.withdrawalDate = withdrawalDate;
        this.returnDate = returnDate;
    }

    public static create(withdrawalDate: Date, returnDate: Date, currentDate: Date): LoanPeriod {
       
        if (withdrawalDate < currentDate) {
            throw new Error("A data e hora de retirada não podem ser anteriores à data e hora atuais.");
        }

        if (returnDate < withdrawalDate) {
            throw new Error("A data e hora de devolução não podem ser anteriores à data e hora de retirada.");
        }

        const maxReturnDate = new Date(withdrawalDate.getTime());
        maxReturnDate.setTime(maxReturnDate.getTime() + (2 * 24 * 60 * 60 * 1000));

        if (returnDate > maxReturnDate) {
            throw new Error("A data e hora de devolução não podem exceder 2 dias (48 horas) após a data e hora de retirada.");
        }

        return new LoanPeriod(withdrawalDate, returnDate);
    }

    public getWithdrawalDate(): Date {
        return this.withdrawalDate;
    }

    public getReturnDate(): Date {
        return this.returnDate;
    }
}