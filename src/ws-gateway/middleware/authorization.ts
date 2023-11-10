import { IPayload } from './interface';
import { TokenService } from '../../utils/token';
import { ERRORS } from '../../common/errors';

export class Authorization {
	async isTokenExists(token: string): Promise<string> {
		if (!token) {
			throw ERRORS.AUTHORIZATION_IS_REQUIRED;
		}

		return token;
	}

	async decodeToken(token: string): Promise<IPayload> {
		const tokenService = new TokenService();
		const payload = await tokenService.decode(token);

		if (!payload) {
			throw ERRORS.TOKEN_IS_INVALID;
		}

		return payload;
	}

}

