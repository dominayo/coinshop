import { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import { UserService } from '../../../services/user/service';
import { IUserFindOne } from './interface';
import { Crypto } from '../../../utils/crypto';
import { TokenService } from '../../../utils/token';
import { Validator } from './validator';
import { ERRORS } from '../../../common/errors';
import { Authorization } from '../../middleware/auth';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const params = { ...req.params, ...req.query, ...req.body } as IUserFindOne;

		await Validator.signInParams(params);
		const { email, password } = params;
		const userService = new UserService();
		const user = await userService.findOne(email);

		if (!user) {
			throw new Error(ERRORS.USER_NOT_EXISTS);
		}

		const { passwordHash, isVerified, id: userId } = user;
		const crypto = new Crypto();

		await crypto.verifyHash(password, passwordHash);

		if (!isVerified) {
			res.status(201).json({ code: 201, message: { isVerified }});
		}

		const userDoc = await Validator.isUserExists(userId);
		const { twoFactorAuthenticationCode, is2FAEnabled } = userDoc;

		if (twoFactorAuthenticationCode && is2FAEnabled) {
			if (!params.code) {
				throw new Error(ERRORS.AUTH_CODE_IS_NOT_PROVIDED);
			}

			const auth = new Authorization();

			const isVerified = await auth.verifyTwoFactorAuthenticationCode({ userId, code: params.code });

			if (!isVerified) {
				throw new Error(ERRORS.AUTH_CODE_IS_INVALID);
			}
		}

		const tokenService = new TokenService();

		const jsonData = _.pick(user, ['email', 'name', 'createdAt', 'updatedAt', 'isVerified']);
		const jwt = await tokenService.create({ userId });

		res.header('Bearer', jwt);
		res.status(201).json({ code: 201, message: jsonData });
	} catch (e) {
		next(e);
	}
};

export default route;
