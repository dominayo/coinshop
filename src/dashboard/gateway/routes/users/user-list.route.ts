import { NextFunction, Request, Response } from 'express';
import { ERRORS } from '../../../../common/errors';
import { Authorization } from '../../middleware/auth';
import { Validator } from '../validator';
import { TokenService } from '../../../../utils/token';
import { UserService } from '../../../../services/user/service';
import { IUserList } from './interface';
import UserValidator from './validator';
import { ConvertService } from '../../../../common/convert';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const params = { ...req.params, ...req.query, ...req.body } as IUserList;

		const cookies = req.cookies;

		if (!cookies?.authorization) {
			throw new Error(ERRORS.AUTHORIZATION_IS_REQUIRED);
		}

		const authorization = new Authorization();
		const token = await authorization.getToken(req);

		const payload = await authorization.decodeToken(token);

		const { userId } = payload;

		await Validator.isUserExists(userId);
		await Validator.isAdmin(userId);
		await UserValidator.userList(params);
		const parsedParams = await ConvertService.skipLimitToInt(params);

		const userService = new UserService();
		const userDocs = await userService.find(parsedParams);
		const tokenService = new TokenService();
		const jwt = await tokenService.create({ userId: userId });

		res.cookie('authorization', `Bearer ${jwt}`, {
			sameSite: 'strict'
		});
		res.render('./dashboard/users.ejs', { users: userDocs });
	} catch (e) {
		next(e);
	}
};

export default route;
