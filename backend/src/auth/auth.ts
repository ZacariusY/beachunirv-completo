import 'dotenv/config';
import * as jwt from 'jsonwebtoken';
import { IPayload } from './payload';
import { ReturnUserDto } from '../model/dtos';


export const createToken = (payload: IPayload): string => {

    const secret = process.env.JWT_SECRET || 'default-jwt-secret-for-development-12345';
    
    if (!secret) {
        throw new Error('JWT_SECRET não está definido nas variáveis de ambiente.');
    }

    return jwt.sign(
        payload, 
        secret,
        { expiresIn: '8h'}
    ); 

};

export const verifyToken = (token: string): IPayload => {

    const secret = process.env.JWT_SECRET || 'default-jwt-secret-for-development-12345';
    
    if (!secret) {
        throw new Error('JWT_SECRET não está definido nas variáveis de ambiente.');
    }

    const decoded = jwt.verify(token, secret);

    if(typeof decoded === 'string'){
        throw new Error('invalid token');
    }

    return decoded as IPayload;
};
    