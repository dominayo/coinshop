import { NextFunction, Request, Response } from 'express';
import moment from 'moment';
import { ERRORS } from '../../../common/errors';
import { ExchangeType } from '../../../common/interface';
import { IDealCancel } from './interface';
import { Validator } from './validator';
import { Authorization } from '../../middleware/auth';
import { EmailClient } from '../../../clients/mailer';
import { UserService } from '../../../services/user/service';
import { DealService } from '../../../services/deal/service';
import { Validator as DealValidator } from '../../../services/deal/validator';
import { Status } from '../../../services/deal/interface';
import { WalletService } from '../../../services/wallet/service';
import { AdvertService } from '../../../services/advert/service';
import dotenv from 'dotenv';

dotenv.config();

const domainName = process.env.DOMAIN_NAME;

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const params = { ...req.params, ...req.query, ...req.body } as IDealCancel;
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
		const { advertId, amount, customerId, owner, status } = await DealValidator.isInDeal({ id, userId });

		const advertService = new AdvertService();
		const { type, cryptoCurrency } = await advertService.findById({ id: advertId });

		if (status !== Status.Created) {
			await advertService.addMaxLimit({ id: advertId, amount });
		}

		await advertService.activate({ id: advertId });

		if (type === ExchangeType.Buy) {
			// const { commission } = await commissionService.findOne({ cryptoCurrency });
			// const unhold = await commissionService.calculateAmountWithCommission({ amount, cryptoCurrency, commission });

			const walletService = new WalletService();

			await walletService.unholdCryptoCurrency({ userId: customerId , cryptoCurrency, unhold: amount });
		}

		const dateNow = moment(Date.now());

		await dealService.updateStatus(
			{ id, status: Status.Canceled, statusTiming: { status: Status.Canceled, changedAt: dateNow } });
		const { email: customerEmail } = await userService.findById(customerId);
		const { email: ownerEmail } = await userService.findById(owner);

		const emailClient = new EmailClient();

		await emailClient.send(
			`Сделка отменена, ${domainName}user/deals?id=${dealDoc.id}`, customerEmail, 'Сделка отменена');
		await emailClient.send(
			`Сделка отменена, ${domainName}user/deals?id=${dealDoc.id}`, ownerEmail, 'Сделка отменена');

		const jsonData = { id, confirmed: true };
		const jwt = await authorization.updateToken(userId);

		res.header('Bearer', jwt);
		res.status(201).json({ code: 201, message: jsonData });
	} catch (e) {
		next(e);
	}
};

export default route;
