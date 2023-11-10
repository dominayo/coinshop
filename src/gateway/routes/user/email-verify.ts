import { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import { UserService } from '../../../services/user/service';
import { IEmailVerify } from './interface';
import { TokenService } from '../../../utils/token';
import { Validator } from './validator';
import ERRORS from '../../../common/errors';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const params = { ...req.params, ...req.query, ...req.body } as IEmailVerify;

		await Validator.emailVerify(params);
		const { token } = params;

		const tokenService = new TokenService();
		const isValidToken = await tokenService.verify(token);

		if (!isValidToken) {
			throw new Error(ERRORS.INVALID_TOKEN_SIGNATURE);
		}

		const { userId } = await tokenService.decode(token);

		await Validator.isUserExists(userId);

		const userService = new UserService();
		const userDoc = await userService.findOneAndUpdate({ userId, isVerified: true });

		const jwt = await tokenService.create({ userId });

		const jsonData = _.pick(userDoc, ['email', 'name', 'createdAt', 'updatedAt', 'isVerified']);

		res.header('Bearer', jwt);
		res.status(201).json({ code: 201, message: jsonData });
	} catch (e) {
		next(e);
	}
};

export default route;
