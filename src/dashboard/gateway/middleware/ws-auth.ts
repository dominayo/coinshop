import { IPayload, IIsHavePermissions } from './interface';
import { TokenService } from '../../../utils/token';
import { ERRORS } from '../../../common/errors';
import { Validator } from '../routes/validator';

export class WebSocketAuth {
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

	async isHavePermissions(params: IIsHavePermissions): Promise<any> {
		const { socket } = params;

		try {
			const token = socket.handshake.query.token;

			await this.isTokenExists(token);
			const { userId } = await this.decodeToken(token);

			await Validator.isAdmin(userId);
		} catch (e) {
			socket.disconnect();
		}
	}
}
