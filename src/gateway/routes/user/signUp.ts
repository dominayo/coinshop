import { NextFunction, Request, Response } from 'express';
// import _ from 'lodash';
import { UserService } from '../../../services/user/service';
import { IUserCreate } from './interface';
import { Crypto } from '../../../utils/crypto';
import { TokenService } from '../../../utils/token';
import { Validator } from './validator';
import { EmailClient } from '../../../clients/mailer';
import ERRORS from '../../../common/errors';
import dotenv from 'dotenv';

dotenv.config();

const domainName = process.env.DOMAIN_NAME;

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const params = { ...req.params, ...req.query, ...req.body } as IUserCreate;

		await Validator.create(params);
		const { email, password, name, ...rest } = params;

		await Validator.isEmailExists(email);
		const isUserNameExists = await Validator.isUserNameExists({ name });

		if (isUserNameExists) {
			throw new Error(ERRORS.USER_ALREADY_EXISTS);
		}

		const crypto = new Crypto();
		const passwordHash = await crypto.createHash(password);
		const prepareUser = { email, name, passwordHash, ...rest };
		const userService = new UserService();
		const user = await userService.create(prepareUser);

		const emailClient = new EmailClient();
		const tokenService = new TokenService();
		const { id: userId } = user;

		const emailVerifyToken = await tokenService.create({ userId });

		await emailClient.send(`Для подтверждения email - перейдите по ссылке
		 ${domainName}email/verify/?token=${emailVerifyToken}`, email, 'Подтверждение регистрации');
		// const jsonData = _.pick(user, ['email', 'name', 'createdAt', 'updatedAt']);

		// const jwt = await tokenService.create({ userId });

		// res.header('Bearer', jwt);
		// res.status(201).json({ code: 201, message: jsonData });

		res.status(201).json({ code: 201, message: { isVerified: false }});
	} catch (e) {
		next(e);
	}
};

export default route;
