import { Request, Response } from 'express';
import { ERRORS } from '../../../common/errors';
import { Validator } from './validator';
import { UserService } from '../../../services/user/service';
import { Crypto } from '../../../utils/crypto';
import { TokenService } from '../../../utils/token';

export const route = async (req: Request, res: Response): Promise<void> => {
	try {
		const params = { ...req.params, ...req.query, ...req.body };

		await Validator.signIn(params);
		const { email, password } = params;
		const userService = new UserService();

		const user = await userService.findOne(email);

		if (!user) {
			throw new Error(ERRORS.USER_NOT_EXISTS);
		}

		const { _id, passwordHash } = user;

		await Validator.isAdmin(_id);

		const crypto = new Crypto();

		await crypto.verifyHash(password, passwordHash);

		const tokenService = new TokenService();
		const jwt = await tokenService.create({ userId: _id });

		res.cookie('authorization', `Bearer ${jwt}`, {
			sameSite: 'strict'
		});

		res.status(302).redirect(`http://${req.get('host')}/`);
	} catch (e) {
		res.status(302).redirect(`http://${req.get('host')}/dashboard/signin`);
	}
};

export default route;
