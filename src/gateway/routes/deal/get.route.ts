import { NextFunction, Request, Response } from 'express';
import moment from 'moment';
import _ from 'lodash';
import { ERRORS } from '../../../common/errors';
import { IDealFind } from './interface';
import { Validator } from './validator';
import { Authorization } from '../../middleware/auth';
import { UserService } from '../../../services/user/service';
import { AdvertService } from '../../../services/advert/service';
import { ChatService } from '../../../services/chat/service';
import { ChatDisputeService } from '../../../services/chat-dispute/service';
import { Validator as DealValidator } from '../../../services/deal/validator';
import { UserProfileService } from '../../../services/user-profile/service';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const params = { ...req.params, ...req.query, ...req.body } as IDealFind;
		const authorization = new Authorization();
		const token = await authorization.getToken(req);

		if (!token) {
			throw new Error(ERRORS.AUTHORIZATION_IS_REQUIRED);
		}

		const payload = await authorization.decodeToken(token);
		const { userId } = payload;

		const userService = new UserService();
		const userDoc = await userService.findById(userId);

		if (!userDoc) {
			throw new Error(ERRORS.USER_NOT_EXISTS);
		}

		await Validator.find(params);
		const { id } = params;

		const dealDoc = await DealValidator.isExists({ id });
		const { id: dealId, advertId, owner, customerId } = dealDoc;

		await DealValidator.isInDeal({ id: dealId, userId });

		const advertService = new AdvertService();
		const { direction, cryptoCurrency } = await advertService.findById({ id: advertId });

		const ownerDoc = await userService.findById(owner);
		const ownerDetails = _.pick(ownerDoc, ['email', 'name']);
		const customerDoc = await userService.findById(customerId);
		const customerDetails = _.pick(customerDoc, ['email', 'name']);

		const userProfileService = new UserProfileService();

		const userProfileDoc = await userProfileService.findByUserId({ userId: ownerDoc._id });

		let ownerRating;

		if (!userProfileDoc || !userProfileDoc?.rating) {
			ownerRating = 0;
		} else {
			ownerRating = userProfileDoc.rating;
		}

		if (ownerRating < -100) {
			ownerRating = -100;
			Object.assign(ownerDetails, { isRatingLessThanHundred: true });
		}

		if (ownerRating > 100) {
			ownerRating = 100;
			Object.assign(ownerDetails, { isRatingBiggerThanHundred: true });
		}

		Object.assign(ownerDetails, { rating: ownerRating });

		const customerProfileDoc = await userProfileService.findByUserId({ userId: customerDoc._id });
		let customerRating;

		if (!customerProfileDoc || !customerProfileDoc?.rating) {
			customerRating = 0;
		} else {
			customerRating = customerProfileDoc.rating;
		}

		if (customerRating < -100) {
			customerRating = -100;
			Object.assign(customerDetails, { isRatingLessThanHundred: true });
		}

		if (ownerRating > 100) {
			customerRating = 100;
			Object.assign(customerDetails, { isRatingBiggerThanHundred: true });
		}

		Object.assign(customerDetails, { rating: customerRating });

		const chatService = new ChatService();
		const chatDoc = await chatService.findByDealId({ dealId });

		let prepareDeal = _.pick({ ...dealDoc.toJSON() },
			['id', 'type', 'advertId', 'amount', 'status', 'exchangeRate', 'direction',
				'createdAt', 'updatedAt', 'statusHistory', 'comments']);

		const isCommentsFitStatus = await Validator.isStatusFitComments({ status: prepareDeal.status });

		if (!isCommentsFitStatus) {
			prepareDeal = _.omit(prepareDeal, 'comments');
		}

		const dealTimer = moment(dealDoc.toJSON().expiresAt).add('hours', 3);
		const isOwner = await Validator.isOwner({ userId, owner: dealDoc.owner });
		const chatDisputeService = new ChatDisputeService();
		const chatDisputeDoc = await chatDisputeService.findByDealId({ dealId });

		if (chatDisputeDoc) {
			Object.assign(prepareDeal, { chatDisputeId: chatDisputeDoc._id });
		}

		const jwt = await authorization.updateToken(userId);

		res.header('Bearer', jwt);
		res.status(201).json({ code: 201, message: { chatId: chatDoc.id, id: dealDoc.id, expiresAt: dealTimer, ...prepareDeal, isOwner,
			cryptoCurrency, direction, owner: ownerDetails, customer: customerDetails } });
	} catch (e) {
		next(e);
	}
};

export default route;
