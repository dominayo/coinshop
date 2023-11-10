import { Request } from 'express';
import { TokenService } from '../../utils/token';
import { ERRORS } from '../../common/errors';
import { IPayload, IVerifyTwoFactorAuthenticationCode, IGetTwoFactorAuthenticationCode } from './interface';
import * as speakeasy from 'speakeasy';
import { UserService } from '../../services/user/service';

const headerKey = 'Bearer' as const;

export class Authorization {
	async getToken(req: Request): Promise<string | null> {
		if (req.headers.authorization && req.headers.authorization.split(' ')[0] === headerKey) {
			return req.headers.authorization.split(' ')[1];
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

		const isVerified = await tokenService.verify(token);

		if (!isVerified) {
			throw new Error(ERRORS.TOKEN_EXPIRED);
		}

		const payload = tokenService.decode(token);

		if (!payload) {
			throw new Error(ERRORS.TOKEN_IS_INVALID);
		}

		return payload;
	}

	async getTwoFactorAuthenticationCode(): Promise<IGetTwoFactorAuthenticationCode> {
		const secretCode = speakeasy.generateSecret({
			name: process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME
		});

		return {
			otpauthUrl: secretCode.otpauth_url,
			base32: secretCode.base32
		};
	}

	async generateTwoFactorAuthenticationCode(userId: string): Promise<string> {
		const { otpauthUrl, base32 } = await this.getTwoFactorAuthenticationCode();
		const userService = new UserService();

		await userService.findOneAndUpdate({ userId, twoFactorAuthenticationCode: base32 });

		return otpauthUrl;
	}

	async verifyTwoFactorAuthenticationCode(params: IVerifyTwoFactorAuthenticationCode): Promise<any> {
		const { userId, code } = params;
		const userService = new UserService();
		const { twoFactorAuthenticationCode } = await userService.findById(userId);

		return speakeasy.totp.verify({
			secret: twoFactorAuthenticationCode,
			encoding: 'base32',
			token: code
		});
	}
}
