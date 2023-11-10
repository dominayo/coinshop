import { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import { ERRORS } from '../../../../common/errors';
import { Authorization } from '../../middleware/auth';
import { Validator } from '../validator';
import TransactionValidator from './validator';
import { CryptoTransactionService } from '../../../../services/inner-crypto-transaction/service';
import { ITransactionVerdict } from './interface';
import { Status } from '../../../../services/inner-crypto-transaction/interface';
import { RPCTransportService } from '../../../../transports/rpc/service';
import { WalletService } from '../../../../services/wallet/service';
import { CryptoCurrency } from '../../../../common/interface';

export const route = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const params = { ...req.params, ...req.query, ...req.body } as ITransactionVerdict;

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
		await TransactionValidator.transactionVerdictParams(params);

		const { transactionId, verdict } = params;
		const cryptoTransactionService = new CryptoTransactionService();

		// const transactionDoc = await cryptoTransactionService.findById({ id: transactionId });

		let transactionDoc;

		if (verdict === false) {
			transactionDoc = await cryptoTransactionService.update({ id: transactionId, status: Status.Abort });
			const { amount, cryptoCurrency, userId } = await cryptoTransactionService.findById({ id: transactionId });

			const walletService = new WalletService();

			await walletService.unholdCryptoCurrency({ cryptoCurrency, unhold: amount, userId });
		} else {
			const { wallet, to, amount, cryptoCurrency, userId } = await cryptoTransactionService.findById({ id: transactionId });

			const rPCTransportService = new RPCTransportService();

			if (cryptoCurrency === CryptoCurrency.ETH) {
				await rPCTransportService.sendEthTransaction({ to, value: amount });
			}

			if (cryptoCurrency === CryptoCurrency.USDT) {
				await rPCTransportService.sendUsdtTransaction({ to, value: amount });
			}

			if (cryptoCurrency === CryptoCurrency.BTC) {
				const transaction = await rPCTransportService.transactionBuilder({ to, value: amount });

				console.log('btc transaction successful with hash: ', transaction);
			}

			const walletService = new WalletService();

			await walletService.unholdCryptoCurrency({ cryptoCurrency, unhold: amount, userId });

			const walletDoc = await walletService.findByWalletAndCryptoCurrency({ wallet, cryptoCurrency });
			const { amount: walletAmount, _id: walletId } = walletDoc;
			const newAmount = parseFloat((Number(walletAmount) - Number(amount)).toFixed(8));

			await walletService.updateAmount({ id: walletId, newAmount });

			transactionDoc = await cryptoTransactionService.update({ id: transactionId, status: Status.Success });
		}

		const prepareDto = _.pick(transactionDoc, ['transactionType', 'cryptoCurrency', 'amount', 'status', 'to']);

		res.status(201).json({ code: 201, message: prepareDto });
	} catch (e) {
		next(e);
	}
};

export default route;
