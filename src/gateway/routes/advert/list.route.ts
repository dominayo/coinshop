/* eslint-disable no-prototype-builtins */
import { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import { AdvertService } from '../../../services/advert/service';
import { IAdvertList } from './interface';
import { Validator } from './validator';
import { ConvertService } from '../../../common/convert';
import { UserService } from '../../../services/user/service';
import { UserProfileService } from '../../../services/user-profile/service';
import { UserRating, ReactionSpeed } from '../../../services/user-profile/interface';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const params = { ...req.params, ...req.query, ...req.body } as IAdvertList;

		const convertedParams = await ConvertService.skipLimitToInt(params);

		await Validator.list(convertedParams);

		const advertService = new AdvertService();
		const filter = _.omit(params, ['skip', 'limit']);

		const userAdverts = await advertService.activeList(convertedParams);
		const advertListCount = await advertService.countActive(filter);

		const jsonData = [];

		const userService = new UserService();
		const userProfileService = new UserProfileService();

		for (const userADvert of userAdverts) {
			const prepareData = _.pick(userADvert, ['id', 'owner', 'type', 'cryptoCurrency', 'direction',
				'exchangeRate', 'isFixedRate', 'spread', 'minLimit', 'maxLimit', 'comments', 'isActive', 'newExchangeRate',
				'createdAt', 'updatedAt']);
			const user = await userService.findById(prepareData.owner);
			const userProfileDoc = await userProfileService.findByUserId({ userId: prepareData.owner });

			console.log(userProfileDoc);

			let rating;

			if (!userProfileDoc || !userProfileDoc?.rating) {
				rating = 0;
			} else {
				rating = userProfileDoc.rating;
			}

			if (rating < -100) {
				rating = -100;
				Object.assign(prepareData, { isRatingLessThanHundred: true });
			}

			if (rating > 100) {
				rating = 100;
				Object.assign(prepareData, { isRatingBiggerThanHundred: true });
			}

			console.log(rating);

			jsonData.push({ ...prepareData, name: user.name, email: user.email, rating });
		}

		res.status(200).json({ code: 200, message: { adverts:  jsonData, count: advertListCount } });
	} catch (e) {
		next(e);
	}
};

export default route;
