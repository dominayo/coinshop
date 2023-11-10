import { NextFunction, Request, Response } from 'express';
import { ERRORS } from '../../../../common/errors';
import { Authorization } from '../../middleware/auth';
import { Validator } from '../validator';
import { TokenService } from '../../../../utils/token';
import { DealService } from '../../../../services/deal/service';
import { IDealList } from './interface';
import DealValidator from './validator';
import { ConvertService } from '../../../../common/convert';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const params = { ...req.params, ...req.query, ...req.body } as IDealList;

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
		await DealValidator.dealList(params);
		const parsedParams = await ConvertService.skipLimitToInt(params);

		const dealService = new DealService();
		const dealDocs = await dealService.list(parsedParams);
		const tokenService = new TokenService();
		const jwt = await tokenService.create({ userId: userId });

		res.cookie('authorization', `Bearer ${jwt}`, {
			sameSite: 'strict'
		});
		res.render('./dashboard/deals.ejs', { deals: dealDocs });
	} catch (e) {
		next(e);
	}
};

export default route;
