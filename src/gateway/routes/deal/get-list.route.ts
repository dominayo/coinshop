import { NextFunction, Request, Response } from 'express';
import moment from 'moment';
import _ from 'lodash';
import { IDealList } from './interface';
import { ERRORS } from '../../../common/errors';
import { Authorization } from '../../middleware/auth';
import { UserService } from '../../../services/user/service';
import { AdvertService } from '../../../services/advert/service';
import { DealService } from '../../../services/deal/service';
import { ChatService } from '../../../services/chat/service';
import { Validator } from './validator';
import { ConvertService } from '../../../common/convert';
import { UserProfileService } from '../../../services/user-profile/service';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const params = { ...req.params, ...req.query, ...req.body } as IDealList;

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

		await Validator.listParams(params);

		const parsedParams = await ConvertService.skipLimitToInt(params);

		const dealService = new DealService();
		const dealDocs = await dealService.findListByUserId({ userId, ...parsedParams });

		const advertIds = dealDocs
			.map((dealDoc) => {
				return dealDoc.advertId;
			});
		const advertService = new AdvertService();
		const advertDocs = await advertService.findByIds(advertIds);

		const prepareDealsDTO = [];
		const dealIdsUserIds = new Map();

		for (const dealDoc of dealDocs) {
			dealIdsUserIds.set(dealDoc.id, { owner: dealDoc.owner, customer: dealDoc.customerId });
			for (const advertDoc of advertDocs) {
				if (dealDoc.advertId === advertDoc.id) {
					prepareDealsDTO.push({ ...dealDoc.toJSON(), direction: advertDoc.direction, cryptoCurrency: advertDoc.cryptoCurrency });
				}
			}
		}

		const userIds: string[] = [];

		for (const dealIdUserIds of dealIdsUserIds.values()) {
			userIds.push(dealIdUserIds.owner);
			userIds.push(dealIdUserIds.customer);
		}

		const filteredUserIds = [ ...new Set(userIds)];
		const userDocs = await userService.findByIds({ userIds: filteredUserIds });

		const dto = [];

		const dealIdsUserDetailsMap = new Map();

		for (const dealId of dealIdsUserIds.keys()) {
			const ownerId = dealIdsUserIds.get(dealId).owner;
			const customerId = dealIdsUserIds.get(dealId).customer;

			for (const ownerDoc of userDocs) {
				if (ownerDoc.id === ownerId) {

					for (const customerDoc of userDocs) {
						if (customerDoc.id === customerId) {
							dealIdsUserDetailsMap.set(dealId, { owner: ownerDoc, customer: customerDoc });
						}
					}

				}
			}
		}

		const chatService = new ChatService();
		const userProfileService = new UserProfileService();

		for (const prepareDealDTO of prepareDealsDTO) {
			const isOwner = await Validator.isOwner({ userId, owner: prepareDealDTO.owner });
			const dealParticipants = dealIdsUserDetailsMap.get(`${prepareDealDTO._id}`);
			const ownerDetails = _.pick(dealParticipants.owner, ['name', 'email']);
			const userProfileDoc = await userProfileService.findByUserId({ userId: prepareDealDTO.owner });
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

			const customerDetails = _.pick(dealParticipants.customer, ['name', 'email']); // TODO add rating
			const customerProfileDoc = await userProfileService.findByUserId({ userId: prepareDealDTO.customerId });
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

			if (customerRating > 100) {
				customerRating = 100;
				Object.assign(customerDetails, { isRatingBiggerThanHundred: true });
			}

			Object.assign(customerDetails, { rating: customerRating });
			const prepareDeal = _.pick({ ...prepareDealDTO, isOwner },
				['id', 'type', 'advertId', 'amount', 'status', 'exchangeRate',
					'direction', 'cryptoCurrency', 'isOwner', 'createdAt', 'updatedAt', 'statusHistory', 'comments']);

			const isCommentsFitStatus = await Validator.isStatusFitComments({ status: prepareDeal.status });

			if (!isCommentsFitStatus) {
				delete prepareDeal.comments;
			}

			const { _id: chatId } = await chatService.findByDealId({ dealId: prepareDealDTO._id });

			const dealTimer = moment(prepareDealDTO.expiresAt).add('hours', 3);

			dto.push(
				{ id: prepareDealDTO._id ,...prepareDeal, expiresAt: dealTimer, chatId, owner: ownerDetails, customer: customerDetails });
		}

		const count = await dealService.countByParticipantId({ userId });

		const jwt = await authorization.updateToken(userId);

		res.header('Bearer', jwt);
		res.status(200).json({ code: 200, message: { deals: dto, count } });
	} catch (e) {
		next(e);
	}
};

export default route;
