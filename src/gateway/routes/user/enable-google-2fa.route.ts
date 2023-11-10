import { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import { UserService } from '../../../services/user/service';
import { Authorization } from '../../middleware/auth';
import { ERRORS } from '../../../common/errors';
import { IEnableGoogle2fa } from './interface';
import { Validator } from './validator';
import UserValidator from '../user/validator';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const params = { ...req.params, ...req.query, ...req.body } as IEnableGoogle2fa;

		const authorization = new Authorization();
		const token = await authorization.getToken(req);

		if (!token) {
			throw new Error(ERRORS.AUTHORIZATION_IS_REQUIRED);
		}

		const payload = await authorization.decodeToken(token);
		const { userId } = payload;

		await UserValidator.isUserExists(userId);
		await Validator.enableGoogle2faParams(params);

		const { enable } = params;

		const userService = new UserService();
		const data = await userService.findOneAndUpdate({ userId, is2FAEnabled: enable });
		const dto = _.pick(data, ['email', 'name', 'isVerified', 'is2FAEnabled', 'createdAt', 'updatedAt']);

		const jwt = await authorization.updateToken(userId);

		res.header('Bearer', jwt);
		res.status(201).json({ status: 201, message: dto });
	} catch (e) {
		next(e);
	}
};

export default route;
