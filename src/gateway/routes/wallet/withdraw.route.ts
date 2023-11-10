import { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import { ERRORS } from '../../../common/errors';
import { IWithdraw } from './interface';
import { Validator } from './validator';
import { Authorization } from '../../middleware/auth';
import { WalletService } from '../../../services/wallet/service';
import WalletValidator from '../../../services/wallet/validator';
import UserValidator from '../user/validator';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const params = { ...req.params, ...req.query, ...req.body } as IWithdraw;
		const authorization = new Authorization();
		const token = await authorization.getToken(req);

		if (!token) {
			throw new Error(ERRORS.AUTHORIZATION_IS_REQUIRED);
		}

		const payload = await authorization.decodeToken(token);
		const { userId } = payload;

		await UserValidator.isUserExists(userId);
		await Validator.widthraw(params);
		const { id, amount, to } = params;

		await WalletValidator.isExists({ id });
		await WalletValidator.isOwner({ id, userId });
		await WalletValidator.isAmountForWidthraw({ id, amount });

		const walletService = new WalletService();

		const walletDoc = await walletService.withdraw({ ...params, userId, isInner: false, to });

		const jsonData = _.pick(walletDoc._doc, ['id', 'wallet', 'cryptoCurrency', 'amount','hold' , 'createdAt', 'updatedAt']);
		const jwt = await authorization.updateToken(userId);

		res.header('Bearer', jwt);
		res.status(201).json({ code: 201, message: { ...jsonData, transaction: walletDoc.transaction } });
	} catch (e) {
		next(e);
	}
};

export default route;
