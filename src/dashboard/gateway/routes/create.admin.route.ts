import _ from 'lodash';
import { NextFunction, Request, Response } from 'express';
import { ERRORS } from '../../../common/errors';
import { Validator } from './validator';
import { UserService } from '../../../services/user/service';
import { Crypto } from '../../../utils/crypto';
import { TokenService } from '../../../utils/token';
import { Authorization } from '../middleware/auth';
import { IAdminCreate } from './interface';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const params = { ...req.params, ...req.query, ...req.body } as IAdminCreate;

		const authorization = new Authorization();
		const token = await authorization.getToken(req);

		if (!token) {
			throw new Error(ERRORS.AUTHORIZATION_IS_REQUIRED);
		}

		const { userId: adminId } = await authorization.decodeToken(token);

		await Validator.isUserExists(adminId);
		await Validator.isAdmin(adminId);
		await Validator.createAdmin(params);

		const { email, password } = params;
		const userService = new UserService();
		const user = await userService.findOne(email);

		if (user) {
			throw new Error(ERRORS.USER_ALREADY_EXISTS);
		}

		const crypto = new Crypto();
		const passwordHash = await crypto.createHash(password);

		const userDoc = await userService.create({ ...params, passwordHash });
		const dto = _.pick(userDoc, ['id', 'name', 'secondName', 'email', 'role']);

		const tokenService = new TokenService();
		const jwt = await tokenService.create({ userId: adminId });

		res.cookie('authorization', `Bearer ${jwt}`, {
			sameSite: 'strict'
		});
		res.status(201).json({ status: 201, message: dto });
	} catch (e) {
		next(e);
	}
};

export default route;
