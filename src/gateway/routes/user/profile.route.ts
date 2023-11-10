import { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import { UserService } from '../../../services/user/service';
import { Authorization } from '../../middleware/auth';
import { ERRORS } from '../../../common/errors';
import UserValidator from '../user/validator';
import { UserProfileService } from '../../../services/user-profile/service';
import { UserRating, ReactionSpeed } from '../../../services/user-profile/interface';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {

		const authorization = new Authorization();
		const token = await authorization.getToken(req);

		if (!token) {
			throw new Error(ERRORS.AUTHORIZATION_IS_REQUIRED);
		}

		const payload = await authorization.decodeToken(token);
		const { userId } = payload;

		await UserValidator.isUserExists(userId);

		const userService = new UserService();
		const userProfileService = new UserProfileService();
		const userDoc = await userService.findById(userId);

		const userProfileDoc = await userProfileService.findByUserId({ userId });
		const prepareUserProfile = _.pick(userProfileDoc,
			['deals', 'summInTransactions', 'disputeLost', 'canceledDeals', 'disputeOpenedCount', 'reactionSpeed', 'rating']);

		const reactionSpeedData = await userProfileService.calculateReactionSpeedRaiting({ userId });
		let rating = Number(prepareUserProfile.rating) + Number(reactionSpeedData.rating);

		if (rating < -100) {
			rating = -100;
			Object.assign(prepareUserProfile, { isRatingLessThanHundred: true });
		}

		if (rating > 100) {
			rating = 100;
			Object.assign(prepareUserProfile, { isRatingBiggerThanHundred: true });
		}

		const prepareUserDoc = _.pick(userDoc, ['email', 'name', 'createdAt', 'updatedAt', 'is2FAEnabled']);
		const jwt = await authorization.updateToken(userId);

		res.header('Bearer', jwt);
		res.status(201).json({ code: 201, message: {
			...prepareUserDoc,
			...prepareUserProfile,
			reactionSpeed: reactionSpeedData.reactionSpeedDto,
			rating
			// deals: successDealDocs.length,
			// canceledDeals: canceledDealDocs.length,
			// summInTransactions: summInTransactions.toFixed(2),
			// disputeOpenedCount,
			// disputeLost,
			// reactionSpeed
		}
		});
	} catch (e) {
		next(e);
	}
};

export default route;
