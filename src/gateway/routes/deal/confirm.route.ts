import { NextFunction, Request, Response } from 'express';
import moment from 'moment';
import { ExchangeType } from '../../../common/interface';
import { ERRORS } from '../../../common/errors';
import { IDealConfirm } from './interface';
import { Validator } from './validator';
import { Authorization } from '../../middleware/auth';
import { EmailClient } from '../../../clients/mailer';
import { UserService } from '../../../services/user/service';
import { ReactionSpeed, UserRating } from '../../../services/user/interface';
import { DealService } from '../../../services/deal/service';
import { AdvertService } from '../../../services/advert/service';
import { Validator as DealValidator } from '../../../services/deal/validator';
import { Validator as AdvertValidator } from '../../../services/advert/validator';
import { Status, StatusTiming } from '../../../services/deal/interface';
import { UserProfileService } from '../../../services/user-profile/service';
import dotenv from 'dotenv';

dotenv.config();

const domainName = process.env.DOMAIN_NAME;

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const params = { ...req.params, ...req.query, ...req.body } as IDealConfirm;
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

		await Validator.confirm(params);
		const { id } = params;

		const dealService = new DealService();

		const dealDoc = await DealValidator.isExists({ id });

		await DealValidator.isStatusMatch({ id, statuses: [Status.Created] });
		const { advertId, amount, type } = await DealValidator.isOwner({ dealId: id, owner: userId });

		const { maxLimit } = await AdvertValidator.isActive({ id: advertId });

		await DealValidator.isExired({ dealId: id });

		const advertService = new AdvertService();

		await Validator.isAmountLessThenMaxLimit({ amount, maxLimit });

		// await DealValidator.isAmountOfCurrencyLessThenSummInOpenedDeals({ advertId, amount });

		await advertService.updateMaxLimit({ id: advertId, soldAmount: amount });

		const { createdAt } = dealDoc;
		const dateNow = moment(Date.now());
		const userProfileService = new UserProfileService();

		const millisecondsInMinute = 60 * 1000;
		const reactionTime = dateNow.diff(createdAt);
		const reactionTimeInMinutes = reactionTime / millisecondsInMinute;

		if (dateNow.isBefore(moment(createdAt).add(ReactionSpeed.REACTION_FAST_SPEED, 'minutes'))) {
			await userProfileService.update({ userId, reactionSpeed: reactionTimeInMinutes });
		}

		if (dateNow.isAfter(moment(createdAt).add(ReactionSpeed.REACTION_FAST_SPEED, 'minutes')) &&
		dateNow.isBefore(moment(createdAt).add(ReactionSpeed.REACTION_STANDART_SPEED, 'minutes')) ) {
			await userProfileService.update({ userId, reactionSpeed: reactionTimeInMinutes });
		}

		if (moment(createdAt).add(ReactionSpeed.REACTION_FAST_SPEED, 'minutes').isAfter(dateNow) &&
		dateNow.isAfter(moment(createdAt).add(ReactionSpeed.REACTION_STANDART_SPEED, 'minutes'))) {
			await userProfileService.update({ userId, reactionSpeed: reactionTimeInMinutes });
		}

		await dealService.updateTimer({ dealId: id, statusTiming: StatusTiming.CONFIRMED });

		const { customerId } = await dealService.updateStatus(
			{ id, status: Status.Confirmed, statusTiming: { status: Status.Confirmed, changedAt: dateNow } });
		const { email } = await userService.findById(customerId);

		const emailClient = new EmailClient();

		await emailClient.send(
			`Сделка подтверждена, ${domainName}user/deals?id=${dealDoc.id}`, email, 'Сделка подтверждена');

		const jsonData = { id, confirmed: true };
		const jwt = await authorization.updateToken(userId);

		res.header('Bearer', jwt);
		res.status(201).json({ code: 201, message: jsonData });
	} catch (e) {
		next(e);
	}
};

export default route;
