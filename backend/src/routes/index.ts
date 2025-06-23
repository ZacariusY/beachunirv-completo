import { Router } from 'express';
import { useRouter } from './userRoutes';
import { authRouter } from './authRoutes';
import { loanRouter } from './loanRoutes';
import { esportRouter } from './esportRoutes';
import { equipmentRouter } from './equipmentRoutes';

const routes = Router();

// Debug endpoint temporário
routes.get('/debug', async (req, res) => {
    try {
        const { AppDataSource } = require('../data_source');
        
        const userCount = await AppDataSource.getRepository('User').count();
        const equipmentCount = await AppDataSource.getRepository('Equipment').count();
        const loanCount = await AppDataSource.getRepository('Loan').count();
        
        const users = await AppDataSource.getRepository('User').find();
        const equipments = await AppDataSource.getRepository('Equipment').find();
        
        res.json({
            status: 'Backend funcionando',
            database: {
                users: { count: userCount, data: users },
                equipments: { count: equipmentCount, data: equipments },
                loans: { count: loanCount }
            }
        });
    } catch (error: any) {
        res.status(500).json({
            error: 'Erro ao acessar banco',
            message: error.message
        });
    }
});

routes.use('/users', useRouter);
routes.use('/auth', authRouter);
routes.use('/loans', loanRouter);
routes.use('/esports', esportRouter);
routes.use('/equipments', equipmentRouter);

export { routes }; 