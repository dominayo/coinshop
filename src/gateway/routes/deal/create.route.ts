import { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import moment from 'moment';
import { ERRORS } from '../../../common/errors';
import { IDealCreate } from './interface';
import { Validator } from './validator';
import { Authorization } from '../../middleware/auth';
import { DealService } from '../../../services/deal/service';
import { EmailClient } from '../../../clients/mailer';
import { UserService } from '../../../services/user/service';
import { Validator as AdvertValidator } from '../../../services/advert/validator';
// import { Validator as DealValidator } from '../../../services/deal/validator';
import { Validator as WalletValidator } from '../../../services/wallet/validator';
import { AdvertService } from '../../../services/advert/service';
import { Status, StatusTiming, IDocument as IDealDocument } from '../../../services/deal/interface';
import { ChatService } from '../../../services/chat/service';
import { ExchangeType } from '../../../common/interface';
import { WalletService } from '../../../services/wallet/service';
import { CommissionService } from '../../../services/commission/service';
// import { CommissionService } from '../../../commission/service';
import dotenv from 'dotenv';

dotenv.config();

const domainName = process.env.DOMAIN_NAME;

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const params = { ...req.params, ...req.query, ...req.body } as IDealCreate;
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

		await Validator.create(params);

		// TODO isAmountOfMoney

		const { advertId, amount } = params;

		const { type, maxLimit, minLimit, cryptoCurrency, direction } = await AdvertValidator.isExists({ id: advertId });

		await AdvertValidator.isActive({ id: advertId });
		await Validator.isAmountLessThenMaxLimit({ amount, maxLimit });
		await Validator.isMinLimitBiggerThenAmount({ amount, minLimit });
		await AdvertValidator.isNotOwner({ advertId, userId });

		const advertService = new AdvertService();

		const advertDoc = await advertService.findById({ id: advertId });
		const { owner, exchangeRate, newExchangeRate, isFixedRate, commission } = advertDoc;

		if (type === ExchangeType.Buy) {
			await Validator.isCommentsExists({ comments: params.comments });
		}

		// if (type === ExchangeType.Sell) {
		// 	await DealValidator.isAmountOfCurrencyLessThenSummInOpenedDeals({ advertId, amount });
		// }

		if (type === ExchangeType.Buy) {
			const walletService = new WalletService();
			const userWalletDoc = await walletService.find({ userId, cryptoCurrency });
			const { id } = userWalletDoc;

			await WalletValidator.isAmountForCreateDealWithBuyType({ id, amount });
			await walletService.holdCryptoCurrency({ userId, cryptoCurrency, hold: amount });
		}

		const dealService = new DealService();
		// const commissionService = new CommissionService();
		// const amountWithCommission = await commissionService.calculateAmountWithCommission({ amount, cryptoCurrency });

		let dealDoc: IDealDocument;

		const dateNow = moment(Date.now());
		const expiresAt = moment(dateNow).add(StatusTiming.CREATED, 'minutes');

		const isHaveComments = {};

		if (advertDoc?.comments) {
			Object.assign(isHaveComments, { comments: advertDoc?.comments });
		} else {
			Object.assign(isHaveComments, { comments: params.comments });
		}

		if (isFixedRate === false) {
			Object.assign(params, { ...isHaveComments });
			dealDoc = await dealService.create(
				{ ...params, owner, status: Status.Created, customerId: userId, type, amount,
					exchangeRate: newExchangeRate, expiresAt, statusHistory: [{ status: Status.Created, changedAt: dateNow }] });
		} else {
			Object.assign(params, { ...isHaveComments });
			dealDoc = await dealService.create(
				{ ...params, owner, status: Status.Created, customerId: userId, type, amount,
					exchangeRate: exchangeRate, expiresAt, statusHistory: [{ status: Status.Created, changedAt: dateNow }] });
		}

		const chatService = new ChatService();
		const { id: chatId } = await chatService.create({ dealId: dealDoc.id, owner, customerId: userId });

		const { email } = await userService.findById(owner);

		const emailClient = new EmailClient();

		await emailClient.send(
			`У Вас новое предложение, ${domainName}user/deals?id=${dealDoc.id}`, email, 'У Вас новое предложение');

		const jsonData = _.pick({ ...dealDoc.toJSON() },
			['id', 'owner', 'advertId', 'countCurrency', 'status', 'exchangeRate', 'createdAt', 'updatedAt', 'statusHistory', 'comments']);
		const isOwner = await Validator.isOwner({ userId, owner });

		const dealTimer = moment(dealDoc.toJSON().expiresAt).add('hours', 3);

		const jwt = await authorization.updateToken(userId);

		res.header('Bearer', jwt);
		res.status(201).json(
			{ code: 201, message: { ...jsonData, id: dealDoc.id, direction, expiresAt: dealTimer, cryptoCurrency, chatId, isOwner } });
	} catch (e) {
		next(e);
	}
};

export default route;
