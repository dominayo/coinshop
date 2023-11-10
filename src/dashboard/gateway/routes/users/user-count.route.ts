import { NextFunction, Request, Response } from 'express';
import { ERRORS } from '../../../../common/errors';
import { Authorization } from '../../middleware/auth';
import { Validator } from '../validator';
import { TokenService } from '../../../../utils/token';
import { UserService } from '../../../../services/user/service';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
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

		const userService = new UserService();

		const usersCount = await userService.countDocuments();

		const tokenService = new TokenService();
		const jwt = await tokenService.create({ userId: userId });

		res.cookie('authorization', `Bearer ${jwt}`, {
			sameSite: 'strict'
		});
		res.status(200).json({ code: 200, message: usersCount });
	} catch (e) {
		next(e);
	}
};

export default route;
