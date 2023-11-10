import { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import { ERRORS } from '../../../../common/errors';
import { Authorization } from '../../middleware/auth';
import { Validator } from '../validator';
import { TokenService } from '../../../../utils/token';
import { CryptoTransactionService } from '../../../../services/inner-crypto-transaction/service';
import { UserService } from '../../../../services/user/service';
import { ITransactionList } from './interface';
import TransactionValidator from './validator';
import { ConvertService } from '../../../../common/convert';
import { WalletService } from '../../../../services/wallet/service';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const params = { ...req.params, ...req.query, ...req.body } as ITransactionList;

		const cookies = req.cookies;

		if (!cookies?.authorization) {
			throw new Error(ERRORS.AUTHORIZATION_IS_REQUIRED);
		}

		const authorization = new Authorization();
		const token = await authorization.getToken(req);

		const payload = await authorization.decodeToken(token);

		const { userId } = payload;

		await Validator.isUserExists(userId);
		await Validator.isAdmin(userId);
		await TransactionValidator.transactionList(params);
		const parsedParams = await ConvertService.skipLimitToInt(params);

		const cryptoTransactionService = new CryptoTransactionService();
		const processingTransactionDocs = await cryptoTransactionService.listProcessing(parsedParams);

		const prepareProcessingData = [];
		const userService = new UserService();
		const walletService = new WalletService();

		for (const processingTransactionDoc of processingTransactionDocs) {
			const prepareProcessingTransaction = _.pick(processingTransactionDoc, ['status', 'transactionType', 'wallet', 'id', 'to']);

			Object.assign(prepareProcessingTransaction, { widthraw: processingTransactionDoc.amount });
			const userDoc = await userService.findById(processingTransactionDoc.userId);
			const prepareUserData = _.pick(userDoc, ['email', 'name']);
			const walletDoc = await walletService.findUserWallets({ userId: processingTransactionDoc.userId });
			const [filterWallet] = walletDoc.filter((userWallet) => {
				return userWallet.cryptoCurrency === processingTransactionDoc.cryptoCurrency;
			});
			const prepareWallet = _.pick(filterWallet, ['amount', 'wallet', 'cryptoCurrency', 'hold']);
			const freeAmount = Number(prepareWallet.amount) - Number(prepareWallet.hold);

			Object.assign(prepareWallet, { freeAmount });

			prepareProcessingData.push({ ...prepareProcessingTransaction, ...prepareUserData, ...prepareWallet });
		}

		const tokenService = new TokenService();
		const jwt = await tokenService.create({ userId: userId });

		res.cookie('authorization', `Bearer ${jwt}`, {
			sameSite: 'strict'
		});
		res.render('./dashboard/widthraw-list.ejs', { widthrawData: prepareProcessingData });

	} catch (e) {
		next(e);
	}
};

export default route;
