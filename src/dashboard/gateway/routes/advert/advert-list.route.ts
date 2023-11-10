import { NextFunction, Request, Response } from 'express';
import { ERRORS } from '../../../../common/errors';
import { Authorization } from '../../middleware/auth';
import { Validator } from '../validator';
import { TokenService } from '../../../../utils/token';
import { AdvertService } from '../../../../services/advert/service';
import { IAdvertList } from './interface';
import AdvertValidator from './validator';
import { ConvertService } from '../../../../common/convert';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const params = { ...req.params, ...req.query, ...req.body } as IAdvertList;

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
		await AdvertValidator.userList(params);
		const parsedParams = await ConvertService.skipLimitToInt(params);

		const advertService = new AdvertService();
		const advertDocs = await advertService.list(parsedParams);
		const tokenService = new TokenService();
		const jwt = await tokenService.create({ userId: userId });

		res.cookie('authorization', `Bearer ${jwt}`, {
			sameSite: 'strict'
		});
		res.render('./dashboard/adverts.ejs', { adverts: advertDocs });
	} catch (e) {
		next(e);
	}
};

export default route;
