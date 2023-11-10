import { NextFunction, Request, Response } from 'express';
import moment from 'moment';
import { ERRORS } from '../../../common/errors';
import { ExchangeType } from '../../../common/interface';
import { IDealMoneySent } from './interface';
import { Validator } from './validator';
import { Authorization } from '../../middleware/auth';
import { EmailClient } from '../../../clients/mailer';
import { UserService } from '../../../services/user/service';
import { DealService } from '../../../services/deal/service';
import { Validator as DealValidator } from '../../../services/deal/validator';
import { Status, StatusTiming } from '../../../services/deal/interface';
import dotenv from 'dotenv';

dotenv.config();

const domainName = process.env.DOMAIN_NAME;

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const params = { ...req.params, ...req.query, ...req.body } as IDealMoneySent;
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

		const { id: dealId, type, owner, customerId } = await DealValidator.isExists({ id });

		if (type === ExchangeType.Buy) {
			await DealValidator.isOwner({ dealId: id, owner: userId });
		} else {
			await DealValidator.isCustomer({ dealId: id, customerId: userId });
		}

		await DealValidator.isStatusMatch({ id, statuses: [Status.Confirmed] });

		const dealService = new DealService();

		await DealValidator.isExired({ dealId: id });

		await dealService.updateTimer({ dealId: id, statusTiming: StatusTiming.MONEY_SENT });

		const dateNow = moment(Date.now());

		await dealService.updateStatus({ id, status: Status.MoneySent, statusTiming: { status: Status.MoneySent, changedAt: dateNow } });

		let email;

		if (type === ExchangeType.Sell) {
			const { email: ownerEmail } = await userService.findById(owner);

			email = ownerEmail;
		} else {
			const { email: customerEmail } = await userService.findById(customerId);

			email = customerEmail;
		}

		const emailClient = new EmailClient();

		await emailClient.send(
			`Деньги отправлены, ${domainName}user/deals?id=${dealId}`, email, 'Деньги отправлены');

		const jsonData = { id, moneySent: true };
		const jwt = await authorization.updateToken(userId);

		res.header('Bearer', jwt);
		res.status(201).json({ code: 201, message: jsonData });
	} catch (e) {
		next(e);
	}
};

export default route;
