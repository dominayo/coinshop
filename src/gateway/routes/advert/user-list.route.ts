import { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import { ERRORS } from '../../../common/errors';
import { Authorization } from '../../middleware/auth';
import { AdvertService } from '../../../services/advert/service';
import { UserAdvertService } from '../../../services/user-advert/service';
import UserValidator from '../user/validator';
import { IUserListParams } from './interface';
import { ConvertService } from '../../../common/convert';
import { Validator } from './validator';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const params = { ...req.params, ...req.query, ...req.body } as IUserListParams;

		const authorization = new Authorization();
		const token = await authorization.getToken(req);

		if (!token) {
			throw new Error(ERRORS.AUTHORIZATION_IS_REQUIRED);
		}

		const payload = await authorization.decodeToken(token);
		const { userId } = payload;

		await UserValidator.isUserExists(userId);

		const parsedParams = await ConvertService.skipLimitToInt(params);

		await Validator.userListParams(parsedParams);

		const userAdvertService = new UserAdvertService();
		const advertIds = await (await userAdvertService.getListByUserId({ userId }))
			.map((item) => item.advertId);

		const advertService = new AdvertService();
		const userADverts = await advertService.listByAdvertIds({ advertIds, ...parsedParams });

		const filter = _.omit(params, ['skip', 'limit']);
		const advertCount = await advertService.countByOwnerId({ owner: userId, ...filter });

		const jsonData = [];

		for (const userADvert of userADverts) {
			const prepareData = _.pick(userADvert, ['id', 'type', 'cryptoCurrency', 'direction', 'commission',
				'exchangeRate','isFixedRate', 'spread', 'minLimit', 'maxLimit', 'comments', 'isActive', 'newExchangeRate']);

			jsonData.push(prepareData);
		}

		const jwt = await authorization.updateToken(userId);

		res.header('Bearer', jwt);
		res.status(200).json({ code: 200, message: { adverts: jsonData, count: advertCount } });
	} catch (e) {
		next(e);
	}
};

export default route;
