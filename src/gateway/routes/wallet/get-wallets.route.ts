import { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import { ERRORS } from '../../../common/errors';
import { Authorization } from '../../middleware/auth';
import { WalletService } from '../../../services/wallet/service';
import UserValidator from '../user/validator';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const authorization = new Authorization();
		const token = await authorization.getToken(req);

		if (!token) {
			throw new Error(ERRORS.AUTHORIZATION_IS_REQUIRED);
		}

		const payload = await authorization.decodeToken(token);
		const { userId } = payload;

		await UserValidator.isUserExists(userId);

		const walletService = new WalletService();
		const docs = await walletService.findUserWallets({ userId });
		const wallets = [];

		for (const doc of docs) {
			const wallet = _.pick(doc, ['id', 'wallet', 'cryptoCurrency', 'amount', 'hold', 'createdAt', 'updatedAt']);
			const availableBalance = parseFloat((Number(wallet.amount) - Number(wallet.hold)).toFixed(8));

			wallets.push({ ...wallet, availableBalance });
		}

		const jwt = await authorization.updateToken(userId);

		res.header('Bearer', jwt);
		res.status(200).json({ code: 200, message: wallets });
	} catch (e) {
		next(e);
	}
};

export default route;
