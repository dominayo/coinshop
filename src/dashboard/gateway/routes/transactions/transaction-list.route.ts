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
		const cryptoTransactionDocs = await cryptoTransactionService.list(parsedParams);

		const cryptoTransactions = [];
		const userService = new UserService();

		for (const cryptoTransactionDoc of cryptoTransactionDocs) {
			const { email } = await userService.findById(cryptoTransactionDoc.userId);
			const prepareAcryptoTransaction = _.pick(cryptoTransactionDoc,
				['_id', 'status', 'transactionType', 'cryptoCurrency', 'amount']);

			cryptoTransactions.push({ ...prepareAcryptoTransaction, email });
		}

		const tokenService = new TokenService();
		const jwt = await tokenService.create({ userId: userId });

		res.cookie('authorization', `Bearer ${jwt}`, {
			sameSite: 'strict'
		});
		res.render('./dashboard/transactions.ejs', { cryptoTransactions });
	} catch (e) {
		next(e);
	}
};

export default route;
