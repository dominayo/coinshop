import { Request } from 'express';
import { TokenService } from '../../../utils/token';
import { ERRORS } from '../../../common/errors';
import { IPayload } from './interface';

const headerKey = 'Bearer' as const;

export class Authorization {
	async getToken(req: Request): Promise<string | null> {
		if (req.cookies?.authorization && req.cookies?.authorization.split(' ')[0] === headerKey) {
			return req.cookies.authorization.split(' ')[1];
		}

		return null;
	}

	async updateToken(userId: string): Promise<string> {
		const tokenService = new TokenService();
		const token = await tokenService.create({ userId });

		return token;
	}

	async decodeToken(token: string): Promise<IPayload> {
		const tokenService = new TokenService();
		const payload = await tokenService.decode(token);

		if(!payload) {
			throw new Error(ERRORS.TOKEN_IS_INVALID);
		}

		return payload;
	}
}
