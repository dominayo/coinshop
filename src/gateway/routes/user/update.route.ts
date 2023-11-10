import { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import { UserService } from '../../../services/user/service';
import { Authorization } from '../../middleware/auth';
import { ERRORS } from '../../../common/errors';
import { IUserUpdate } from './interface';
import { Validator } from './validator';
import UserValidator from '../user/validator';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const params = { ...req.params, ...req.query, ...req.body } as IUserUpdate;

		const authorization = new Authorization();
		const token = await authorization.getToken(req);

		if (!token) {
			throw new Error(ERRORS.AUTHORIZATION_IS_REQUIRED);
		}

		const payload = await authorization.decodeToken(token);
		const { userId } = payload;

		await UserValidator.isUserExists(userId);
		await Validator.update(params);
		const isUserNameExists = await UserValidator.isUserNameExists({ name: params.name });

		if (isUserNameExists === true) {
			throw new Error(ERRORS.USER_ALREADY_EXISTS);
		}

		const userService = new UserService();
		const doc = await userService.findOneAndUpdate({ userId, ...params });

		const dto = _.pick(doc, ['email', 'name', 'createdAt', 'updatedAt']);
		const jwt = await authorization.updateToken(userId);

		res.header('Bearer', jwt);
		res.status(201).json({ code: 201, message: dto });
	} catch (e) {
		next(e);
	}
};

export default route;
