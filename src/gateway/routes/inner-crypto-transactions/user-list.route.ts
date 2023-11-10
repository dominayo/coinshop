import { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import { ERRORS } from '../../../common/errors';
import { Authorization } from '../../middleware/auth';
import { CryptoTransactionService } from '../../../services/inner-crypto-transaction/service';
import UserValidator from '../user/validator';
import { IFindUserList } from './interface';
import { Validator } from './validator';
import { ConvertService } from '../../../common/convert';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const params = { ...req.params, ...req.query, ...req.body } as IFindUserList;
		const authorization = new Authorization();
		const token = await authorization.getToken(req);

		if (!token) {
			throw new Error(ERRORS.AUTHORIZATION_IS_REQUIRED);
		}

		const payload = await authorization.decodeToken(token);
		const { userId } = payload;

		await UserValidator.isUserExists(userId);
		await Validator.findUserList(params);

		const convertedParams = await ConvertService.skipLimitToInt(params);

		const cryptoTransactionService = new CryptoTransactionService();
		const docs = await cryptoTransactionService.findUserList({ userId, ...convertedParams });
		const count = await cryptoTransactionService.countByUserId({ userId, ...convertedParams });

		const dto = [];

		for (const doc of docs) {
			const prepareDto = _.pick(doc, ['transactionType', 'cryptoCurrency', 'amount', 'status', 'wallet', 'createdAt', 'updatedAt']);

			dto.push(prepareDto);
		}

		const jwt = await authorization.updateToken(userId);

		res.header('Bearer', jwt);
		res.status(200).json({ code: 200, message: { cryptoTransactions: dto, count } });
	} catch (e) {
		next(e);
	}
};

export default route;
