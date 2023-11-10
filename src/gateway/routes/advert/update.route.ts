import { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import { ERRORS } from '../../../common/errors';
import { ExchangeType } from '../../../common/interface';
import { IAdvertUpdate } from './interface';
import { Validator } from './validator';
import { Authorization } from '../../middleware/auth';
import { AdvertService } from '../../../services/advert/service';
import WalletValidator from '../../../services/wallet/validator';
import { WalletService } from '../../../services/wallet/service';
import UserValidator from '../user/validator';
import { CryptoCurrencyService } from '../../../services/crypto-currency/service';
import { CommissionService } from '../../../services/commission/service';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const params = { ...req.params, ...req.query, ...req.body } as IAdvertUpdate;
		const authorization = new Authorization();
		const token = await authorization.getToken(req);

		if (!token) {
			throw new Error(ERRORS.AUTHORIZATION_IS_REQUIRED);
		}

		const payload = await authorization.decodeToken(token);
		const { userId } = payload;

		await UserValidator.isUserExists(userId);
		await Validator.update(params);
		const { id: advertId, isFixedRate, maxLimit, minLimit } = params;

		await Validator.isOwner({ userId, advertId });
		await Validator.isDealOpen({ advertId });
		await Validator.isMaxLimitBiggerThenMinLimit({ minLimit, maxLimit });

		const advertService = new AdvertService();
		const { type, cryptoCurrency, commission: oldCommission, maxLimit: oldMaxLimit, isActive } =
			await advertService.findById({ id: advertId });

		const walletService = new WalletService();

		const [walletDoc] = await (await walletService.findUserWallets({ userId })).filter((walletDoc) => {
			if (walletDoc.cryptoCurrency === cryptoCurrency) {
				return walletDoc;
			}
		});

		await WalletValidator.isAmountForUpdate(
			{ commission: oldCommission, walletId: walletDoc.id, oldMaxLimit, newMaxLimit: Number(maxLimit), type });

		if (isActive) {
			if (type === ExchangeType.Sell) {
				const walletService = new WalletService();
				// const userWalletDoc = await walletService.find({ userId, cryptoCurrency });
				// const { id } = userWalletDoc;

				const commissionService = new CommissionService();
				// const { commission } = await commissionService.findOne({ cryptoCurrency });
				// const oldHold = await commissionService.calculateAmountWithCommission(
				// 	{ amount: oldMaxLimit, cryptoCurrency, commission: oldCommission });
				const hold = await commissionService.calculateAmountWithCommission(
					{ amount: maxLimit, cryptoCurrency, commission: oldCommission });

				// if (hold >= oldHold) {
				// 	const isAmount: number = parseFloat((Number(hold) - Number(oldHold)).toFixed(8));

				// 	await WalletValidator.isAmount({ id, amount: isAmount });
				// }

				const unhold = await commissionService.calculateAmountWithCommission(
					{ amount: oldMaxLimit, cryptoCurrency, commission: oldCommission });

				await walletService.unholdCryptoCurrency({ userId, cryptoCurrency, unhold });
				await walletService.holdCryptoCurrency({ userId, cryptoCurrency, hold });
			} else {
				const walletService = new WalletService();
				// const userWalletDoc = await walletService.find({ userId, cryptoCurrency });
				// const { id } = userWalletDoc;

				const commissionService = new CommissionService();
				// const { commission } = await commissionService.findOne({ cryptoCurrency });
				// const oldHold = await commissionService.calculateAmountWithCommission(
				// 	{ amount: oldMaxLimit, cryptoCurrency, commission: oldCommission });
				const hold = await commissionService.calculateCommissionFromAmount(
					{ amount: maxLimit, cryptoCurrency, commission: oldCommission });

				// if (hold >= oldHold) {
				// 	const isAmount: number = parseFloat((Number(hold) - Number(oldHold)).toFixed(8));

				// 	await WalletValidator.isAmount({ id, amount: isAmount });
				// }

				const unhold = await commissionService.calculateCommissionFromAmount(
					{ amount: oldMaxLimit, cryptoCurrency, commission: oldCommission });

				await walletService.unholdCryptoCurrency({ userId, cryptoCurrency, unhold });
				await walletService.holdCryptoCurrency({ userId, cryptoCurrency, hold });
			}
		}

		let advertDoc;

		if (!isFixedRate) {
			const cryptoCurrencyService = new CryptoCurrencyService();
			const cryptoCurrencyDocs = await cryptoCurrencyService.list();
			const [{ exchangeRate }] = cryptoCurrencyDocs.filter((cryptoCurrencyDoc) => {

				if (cryptoCurrency === cryptoCurrencyDoc.currencyType) {
					return cryptoCurrencyDoc;
				}
			});

			advertDoc = await advertService.updateFloat({ ...params, exchangeRate, cryptoCurrency });

			Object.assign(advertDoc, { newExchangeRate: advertDoc.exchangeRate });
		} else {

			const prepareParams = _.omit(params, ['spread', 'newExchangeRate']) as Omit<IAdvertUpdate, 'spread' | 'newExchangeRate'>;

			advertDoc = await advertService.updateFixed(
				{ ...prepareParams });
		}
		// const cryptoCurrency = {};

		// const cryptoCurrencyService = new CryptoCurrencyService();

		// if (params.isFixedRate === false && params.cryptoCurrency && params.cryptoCurrency !== advertDoc?.cryptoCurrency) {
		// 	const doc = await cryptoCurrencyService.findOne({ currencyType: params.cryptoCurrency });
		// 	const { currencyType, exchangeRate } = doc;

		// 	Object.assign(cryptoCurrency, { cryptoCurrency: currencyType, exchangeRate });
		// }

		// if (params.isFixedRate === false && !params.cryptoCurrency) {
		// 	const doc = await cryptoCurrencyService.findOne({ currencyType: advertDoc.cryptoCurrency});
		// 	const { currencyType, exchangeRate } = doc;

		// 	Object.assign(cryptoCurrency, { cryptoCurrency: currencyType, exchangeRate });
		// }

		// const advertService = new AdvertService();
		// const advertDocUpdated = await advertService.update({ ...params, ...cryptoCurrency });

		const jsonData = _.pick(advertDoc, ['id', 'type', 'cryptoCurrency', 'direction',
			'exchangeRate', 'isFixedRate', 'spread', 'minLimit', 'maxLimit', 'comments', 'isActive', 'newExchangeRate', 'commission']);
		const jwt = await authorization.updateToken(userId);

		res.header('Bearer', jwt);
		res.status(201).json({ code: 201, message: jsonData });
	} catch (e) {
		next(e);
	}
};

export default route;
