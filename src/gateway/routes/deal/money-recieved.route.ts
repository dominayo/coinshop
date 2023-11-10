import { NextFunction, Request, Response } from 'express';
import moment from 'moment';
import { ERRORS } from '../../../common/errors';
import { IDealMoneyRecieved } from './interface';
import { Validator } from './validator';
import { Authorization } from '../../middleware/auth';
import { EmailClient } from '../../../clients/mailer';
import { UserService } from '../../../services/user/service';
import { DealService } from '../../../services/deal/service';
import { Validator as DealValidator } from '../../../services/deal/validator';
import { Status } from '../../../services/deal/interface';
import { ExchangeType } from '../../../common/interface';
import { AdvertService } from '../../../services/advert/service';
import { WalletService } from '../../../services/wallet/service';
import { UserProfileService } from '../../../services/user-profile/service';
import dotenv from 'dotenv';

dotenv.config();

const domainName = process.env.DOMAIN_NAME;

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const params = { ...req.params, ...req.query, ...req.body } as IDealMoneyRecieved;
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

		const { id: dealId, type } = await DealValidator.isExists({ id });

		await DealValidator.isStatusMatch({ id, statuses: [Status.MoneySent] });

		if (type === ExchangeType.Sell) {
			await DealValidator.isOwner({ dealId: id, owner: userId });
		} else {
			await DealValidator.isCustomer({ dealId: id, customerId: userId });
		}

		const dealService = new DealService();
		const walletService = new WalletService();
		const advertService = new AdvertService();
		const userProfileService = new UserProfileService();

		const dealDoc = await dealService.findById({ id });
		const { advertId, owner, customerId, amount } = dealDoc;
		const advertDoc = await advertService.findById({ id: advertId });

		/** Crypto transaction start **/
		const dateNow = moment(Date.now());

		await dealService.updateStatus({ id, status: Status.MoneyReceived,
			statusTiming: { status: Status.MoneyReceived, changedAt: dateNow } });
		await walletService.transfer({ owner, customerId, amount, cryptoCurrency: advertDoc.cryptoCurrency,
			type: advertDoc.type, commission: advertDoc.commission, advertId: advertDoc.id });
		await dealService.updateStatus({ id, status: Status.Сompleted, statusTiming: { status: Status.Сompleted, changedAt: dateNow } });
		await userProfileService.update({ userId: owner, deals: 1 });
		await userProfileService.update({ userId: customerId, deals: 1 });
		/** Crypto transaction end **/
		const { email: ownerEmail } = await userService.findById(owner);
		const { email: customerEmail } = await userService.findById(customerId);

		const emailClient = new EmailClient();

		await emailClient.send(
			`Сделка успешно завершена, ${domainName}user/deals?id=${dealId}`, ownerEmail, 'Сделка завершена');
		await emailClient.send(
			`Сделка успешно завершена, ${domainName}user/deals?id=${dealId}`, customerEmail, 'Сделка завершена');
		const jsonData = { id, recieved: true };
		const jwt = await authorization.updateToken(userId);

		res.header('Bearer', jwt);
		res.status(201).json({ code: 201, message: jsonData });
	} catch (e) {
		next(e);
	}
};

export default route;
