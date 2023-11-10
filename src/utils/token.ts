import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { IUserCreate, IDecodeJWT } from './interface';
import { Validator } from './validator';

dotenv.config();
const algorithm = 'HS512' as const;
const expiresIn = '24h' as const;

export class TokenService {
	async create({ userId }: IUserCreate): Promise<string> {
		return jwt.sign({ userId }, process.env.JWT_SECRET_KEY, { algorithm, expiresIn });
	}

	async verify(token: string): Promise<string | unknown> {
		try {
			return jwt.verify(token, process.env.JWT_SECRET_KEY, { ignoreExpiration: true });
		} catch (err) {
			return null;
		}
	}

	async decode(token: string): Promise<IDecodeJWT> {
		try {
			await Validator.tokenParams({ token });
			const decoded = jwt.decode(token);

			return decoded as unknown as IDecodeJWT;
		} catch (err) {
			return null;
		}
	}
}

