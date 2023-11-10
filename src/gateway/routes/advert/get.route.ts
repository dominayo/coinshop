import { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import { ERRORS } from '../../../common/errors';
import { Authorization } from '../../middleware/auth';
import { Validator } from './validator';
import { AdvertService } from '../../../services/advert/service';
import UserValidator from '../user/validator';
import { IAdvertGet } from './interface';
import { UserProfileService } from '../../../services/user-profile/service';
import { UserRating, ReactionSpeed } from '../../../services/user-profile/interface';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const params = { ...req.params, ...req.query, ...req.body } as IAdvertGet;
		const authorization = new Authorization();
		const token = await authorization.getToken(req);

		if (!token) {
			throw new Error(ERRORS.AUTHORIZATION_IS_REQUIRED);
		}

		const payload = await authorization.decodeToken(token);
		const { userId } = payload;

		await UserValidator.isUserExists(userId);

		await Validator.get(params);
		const { id } = params;

		const advertService = new AdvertService();
		const advert = await advertService.findById({ id });

		if (!advert) {
			throw new Error(ERRORS.ADVERT_NOT_FOUND);
		}

		const userProfileService = new UserProfileService();
		const userProfileDoc = await userProfileService.findByUserId({ userId: advert.owner });

		const jsonData = _.pick(advert, ['id', 'type', 'cryptoCurrency', 'direction', 'exchangeRate', 'commission',
			'isFixedRate', 'spread', 'minLimit', 'maxLimit', 'comments', 'isActive', 'newExchangeRate']);

		let rating;

		if (!userProfileDoc || !userProfileDoc?.rating) {
			rating = 0;
		} else {
			rating = userProfileDoc.rating;
		}

		if (rating < -100) {
			rating = -100;
			Object.assign(jsonData, { isRatingLessThanHundred: true });
		}

		if (rating > 100) {
			rating = 100;
			Object.assign(jsonData, { isRatingBiggerThanHundred: true });
		}

		const jwt = await authorization.updateToken(userId);

		res.header('Bearer', jwt);
		res.status(200).json({ code: 200, message: { ...jsonData, rating } });
	} catch (e) {
		next(e);
	}
};

export default route;
