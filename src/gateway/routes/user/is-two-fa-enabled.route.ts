import { NextFunction, Request, Response } from 'express';
import { UserService } from '../../../services/user/service';
import { IUserFindOne } from './interface';
import { Crypto } from '../../../utils/crypto';
import { Validator } from './validator';
import { ERRORS } from '../../../common/errors';

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
		const { is2FAEnabled } = userDoc;

		res.status(201).json({ code: 201, message: { is2FAEnabled } });
	} catch (e) {
		next(e);
	}
};

export default route;
