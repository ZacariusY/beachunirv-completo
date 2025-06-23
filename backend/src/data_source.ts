import { DataSource } from "typeorm"
import 'dotenv/config'
import { User } from "./model/entities/user"
import { Equipment } from "./model/entities/Equipment"
import { Esport } from "./model/entities/Esport"
import { Loan } from "./model/entities/Loan"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "password",
    database: "beachunirv",
    synchronize: true,
    logging: true,
    entities: [User, Equipment, Esport, Loan],
    subscribers: [],
    migrations: [],
})

