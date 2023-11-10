import { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import { ERRORS } from '../../../common/errors';
import { IAdvertCreate } from './interface';
import { Validator } from './validator';
import { Authorization } from '../../middleware/auth';
import { AdvertService } from '../../../services/advert/service';
import { UserAdvertService } from '../../../services/user-advert/service';
import { CryptoCurrencyService } from '../../../services/crypto-currency/service';
import UserValidator from '../user/validator';
import WalletValidator from '../../../services/wallet/validator';
import { WalletService } from '../../../services/wallet/service';
import { ExchangeType } from '../../../common/interface';
import { CommissionService } from '../../../services/commission/service';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const params = { ...req.params, ...req.query, ...req.body } as IAdvertCreate;
		const authorization = new Authorization();
		const token = await authorization.getToken(req);

		if (!token) {
			throw new Error(ERRORS.AUTHORIZATION_IS_REQUIRED);
		}

		const payload = await authorization.decodeToken(token);
		const { userId } = payload;

		await UserValidator.isUserExists(userId);
		await Validator.create(params);

		const { isFixedRate, cryptoCurrency, maxLimit, minLimit, type } = params;

		await Validator.isMaxLimitBiggerThenMinLimit({ minLimit, maxLimit });

		if (type === ExchangeType.Sell) {
			const walletService = new WalletService();
			const userWalletDoc = await walletService.find({ userId, cryptoCurrency });
			const { id } = userWalletDoc;

			const commissionService = new CommissionService();
			const { commission } = await commissionService.findOne({ cryptoCurrency });
			const hold = await commissionService.calculateAmountWithCommission({ amount: maxLimit, cryptoCurrency, commission });

			await WalletValidator.isAmount({ id, amount: maxLimit });
			await walletService.holdCryptoCurrency({ userId, cryptoCurrency, hold });
		} else {
			const walletService = new WalletService();
			const userWalletDoc = await walletService.find({ userId, cryptoCurrency });
			const { id } = userWalletDoc;

			const commissionService = new CommissionService();
			const { commission } = await commissionService.findOne({ cryptoCurrency });
			const hold = await commissionService.calculateCommissionFromAmount({ amount: maxLimit, cryptoCurrency, commission });

			await walletService.holdCryptoCurrency({ userId, cryptoCurrency, hold });
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

			const advertService = new AdvertService();

			advertDoc = await advertService.create({ owner: userId, ...params, exchangeRate });
		} else {
			const advertService = new AdvertService();

			const prepareParams = _.omit(params, ['spread']);

			advertDoc = await advertService.create({ ...prepareParams,  owner: userId });
		}

		const { id: advertId } = advertDoc;
		const userAdvertService = new UserAdvertService();

		await userAdvertService.create({ userId, advertId });
		const jsonData = _.pick(advertDoc,['id', 'type', 'cryptoCurrency', 'direction', 'exchangeRate',
			'isFixedRate', 'spread', 'minLimit', 'maxLimit', 'comments', 'isActive', 'newExchangeRate']);
		const jwt = await authorization.updateToken(userId);

		res.header('Bearer', jwt);
		res.status(201).json({ code: 201, message: jsonData });
	} catch (e) {
		next(e);
	}
};

export default route;
