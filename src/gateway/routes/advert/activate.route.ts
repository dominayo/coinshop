import { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import { ERRORS } from '../../../common/errors';
import { IActivate } from './interface';
import { ExchangeType } from '../../../common/interface';
import { Validator } from './validator';
import { Authorization } from '../../middleware/auth';
import { AdvertService } from '../../../services/advert/service';
import UserValidator from '../user/validator';
import { WalletService } from '../../../services/wallet/service';
import { CommissionService } from '../../../services/commission/service';
import WalletValidator from '../../../services/wallet/validator';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const params = { ...req.params, ...req.query, ...req.body } as IActivate;
		const authorization = new Authorization();
		const token = await authorization.getToken(req);

		if (!token) {
			throw new Error(ERRORS.AUTHORIZATION_IS_REQUIRED);
		}

		const payload = await authorization.decodeToken(token);
		const { userId } = payload;

		await UserValidator.isUserExists(userId);
		await Validator.vivaActivia(params);
		const { id } = params;

		await Validator.isExists({ id });
		await Validator.isOwner({ userId, advertId: id });
		await Validator.isDealOpen({ advertId: id });
		await Validator.isDeactivated({ id });

		// TODO add currency validator
		const advertService = new AdvertService();
		const { cryptoCurrency, maxLimit, type, commission } = await advertService.findById({ id });

		const walletService = new WalletService();
		const commissionService = new CommissionService();

		const [walletDoc] = await (await walletService.findUserWallets({ userId })).filter((doc) => {
			if (doc.cryptoCurrency === cryptoCurrency) {
				return doc;
			}
		});

		await WalletValidator.isAmountForActivate({ commission, maxLimit, walletId: walletDoc.id, type });

		if (type === ExchangeType.Sell) {
			// const commissionService = new CommissionService();
			// const { commission } = await commissionService.findOne({ cryptoCurrency });
			const hold = await commissionService.calculateAmountWithCommission({ cryptoCurrency , amount: maxLimit, commission });

			await walletService.holdCryptoCurrency({ userId, hold, cryptoCurrency });
		} else {
			// const commissionService = new CommissionService();
			// const { commission } = await commissionService.findOne({ cryptoCurrency });
			const hold = await commissionService.calculateCommissionFromAmount({ cryptoCurrency , amount: maxLimit, commission });

			await walletService.holdCryptoCurrency({ userId, hold, cryptoCurrency });
		}

		const doc = await advertService.update({ id, isActive: true });
		const dto = _.pick(doc, ['id', 'type', 'cryptoCurrency', 'direction', 'exchangeRate', 'isFixedRate',
			'spread', 'minLimit', 'maxLimit', 'comments', 'isActive', 'newExchangeRate']);

		const jwt = await authorization.updateToken(userId);

		res.header('Bearer', jwt);
		res.status(201).json({ code: 201, message: dto });
	} catch (e) {
		next(e);
	}
};

export default route;
