import { Wallet } from './model';
import { IWalletCreate, IWalletDeposit, IWalletWithdraw, IFindById, ITransfer, IUserWallets, IFindByWallet,
	IWalletInsertMany, IFind, IHold, IUnhold, IIncomingCryptoWallet, IListByCryptoCurrency, IListByCryptoCurrencies,
	IUpdateAmount, IDocument } from './interface';
import { Validator } from './validator';
import { ERRORS } from '../../common/errors';
import { CryptoTransactionService } from '../inner-crypto-transaction/service';
import { TransactionType, Status } from '../inner-crypto-transaction/interface';
import { CryptoCurrency, ExchangeType } from '../../common/interface';
import { CryptoWalletService } from '../crypto-wallets/service';
import { CurrencyTransportService } from '../../binance/currency-transport';
import { RPCTransportService } from '../../transports/rpc/service';
import { UserProfileService } from '../../services/user-profile/service';

export class WalletService {
	async create(params: IWalletCreate): Promise<IDocument> {
		const doc = await Wallet.create(params);

		return doc;
	}

	async createMany(params: IWalletInsertMany[]): Promise<any> {
		const cryptoWalletService = new CryptoWalletService();
		const cryptoWallets = await cryptoWalletService.getFreeWallets();

		const prepareData = [];

		for (const wallet of params) {
			for (const cryptoWallet of cryptoWallets) {
				if (wallet.cryptoCurrency === cryptoWallet.cryptoCurrency) {
					prepareData.push({ ...wallet, wallet: cryptoWallet.wallet });
				}
			}
		}

		const docs = await Wallet.insertMany(prepareData);

		return docs as unknown;
	}

	async findById(params: IFindById): Promise<IDocument> {
		const { id } = params;
		const doc = await Wallet.findById({ _id: id }).exec();

		return doc as IDocument;
	}

	async find(params: IFind): Promise<IDocument> {
		const { userId, cryptoCurrency } = params;
		const doc = await Wallet.findOne({ userId, cryptoCurrency }).exec();

		return doc as IDocument;
	}

	async updateAmount(params: IUpdateAmount): Promise<IDocument> {
		const { id, newAmount } = params;

		return await Wallet.findByIdAndUpdate(id, { amount: newAmount }, { new: true }).exec();
	}

	async findByWalletAndCryptoCurrency(params: IFindByWallet): Promise<IDocument> {
		return await Wallet.findOne(params).exec();
	}

	async checkIsExistsAndAdjunct(params: IIncomingCryptoWallet): Promise<IDocument> {
		const { to, value } = params;
		const doc = await Wallet.findOne({ wallet: to }).exec();

		if (doc) {
			const newAmount = parseFloat((Number(doc.amount) + Number(value)).toFixed(8));

			return await Wallet.findOneAndUpdate({ wallet: to }, { $set: { amount: newAmount } }, { new: true }).exec();
		}

		return null;
	}

	async findUserWallets(params: IUserWallets): Promise<IDocument[]> {
		const { userId } = params;
		const docs = await Wallet.find({ userId }).exec();

		return docs as IDocument[];
	}

	async listByCryptoCurrency(params: IListByCryptoCurrency): Promise<IDocument[]> {
		return await Wallet.find(params).exec();
	}

	async listByCryptoCurrencies(params: IListByCryptoCurrencies): Promise<IDocument[]> {
		const { cryptoCurrencies } = params;

		return await Wallet.find({ cryptoCurrency: { $in: cryptoCurrencies } }).exec();
	}

	async holdCryptoCurrency(params: IHold): Promise<IDocument> {
		const { cryptoCurrency, userId, hold } = params;
		const { hold: oldHold } = await Wallet.findOne({ cryptoCurrency, userId }).exec();
		const newHold = parseFloat((Number(hold) + Number(oldHold)).toFixed(8));
		const doc = await Wallet.findOneAndUpdate({ cryptoCurrency, userId }, { $set: { hold: newHold } }, { new: true }).exec();

		return doc;
	}

	async unholdCryptoCurrency(params: IUnhold): Promise<IDocument> {
		const { userId, unhold, cryptoCurrency } = params;
		const { hold } = await Wallet.findOne({ cryptoCurrency, userId }).exec();
		const newHold = parseFloat((Number(hold) - Number(unhold)).toFixed(8));
		const doc = await Wallet.findOneAndUpdate({ cryptoCurrency, userId }, { $set: { hold: newHold } }, { new: true }).exec();

		return doc as IDocument;
	}

	async deposit(params: IWalletDeposit): Promise<IDocument> {
		const { id, amount, userId, isInner = true } = params;
		const parsedAmount = Number(amount);

		const cryptoTransactionService = new CryptoTransactionService();

		const session = await Wallet.startSession();

		session.startTransaction();

		try {
			const { amount: oldAmount, cryptoCurrency } = await Wallet.findById({ _id: id }).exec();

			const newAmount: number = parseFloat((Number(parsedAmount) + Number(oldAmount)).toFixed(8));

			console.log(newAmount);

			const fixedAmount = Number(parsedAmount.toFixed(8));

			const cryptoTransactionData = {
				userId,
				transactionType: TransactionType.Deposit,
				cryptoCurrency,
				amount: fixedAmount,
				status: Status.Start
			};

			if (isInner === false) {
				Object.assign(cryptoTransactionData, { isInner: false });
			}

			const { _id: cryptoTransactionId } = await cryptoTransactionService.create(cryptoTransactionData);
			const doc = await Wallet.findByIdAndUpdate(id, { amount: newAmount }, { new: true }).exec();

			console.log(doc);

			if (!doc) {
				throw new Error(ERRORS.WALLET_NOT_FOUND);
			}

			await cryptoTransactionService.update({ id: cryptoTransactionId, status: Status.Success });

			await session.commitTransaction();
			session.endSession();

			return doc as IDocument;
		} catch (e) {
			await session.abortTransaction();
			session.endSession();
			await cryptoTransactionService.update({ id, status: Status.Failed });
			throw new Error(ERRORS.TRANSACTION_FAILED);
		}
	}

	async withdraw(params: IWalletWithdraw): Promise<any> {
		const { id, amount, userId, isInner = true, isTron } = params;
		const cryptoTransactionService = new CryptoTransactionService();

		const session = await Wallet.startSession();

		session.startTransaction();

		try {
			const { amount: oldAmount, cryptoCurrency } = await Wallet.findById({ _id: id }).exec();

			const newAmount: number = parseFloat((Number(oldAmount) - Number(amount)).toFixed(8));
			const cryptoTransactionData = {
				userId,
				transactionType: TransactionType.Withdraw,
				cryptoCurrency,
				amount,
				status: Status.Start
			};

			if (isInner === false) {
				Object.assign(cryptoTransactionData, { isInner: false, to: params.to });
			}

			const { _id: cryptoTransactionId } = await cryptoTransactionService.create(cryptoTransactionData);

			const currencyTransportService = new CurrencyTransportService();
			const isAmountBiggerThenFrontier = await currencyTransportService.isAmountBiggerThenFrontier({ amount, cryptoCurrency });

			if (isAmountBiggerThenFrontier === true && isInner === false) {
				await cryptoTransactionService.update({ id: cryptoTransactionId, status: Status.Processing });
				await this.holdCryptoCurrency({ userId, cryptoCurrency, hold: amount });

				await session.commitTransaction();
				session.endSession();

				return await Wallet.findById({ _id: id }).exec();
			}

			let transaction;

			if (isAmountBiggerThenFrontier === false && isInner === false && cryptoCurrency === CryptoCurrency.ETH) {
				const rPCTransportService = new RPCTransportService();

				transaction = await rPCTransportService.sendEthTransaction({ to: params.to, value: amount });

				console.log(transaction);
			}

			if (isAmountBiggerThenFrontier === false && isInner === false && cryptoCurrency === CryptoCurrency.USDT && !isTron) {
				const rPCTransportService = new RPCTransportService();

				transaction = await rPCTransportService.sendUsdtTransaction({ to: params.to, value: amount });

				console.log(transaction);
			}

			if (isAmountBiggerThenFrontier === false && isInner === false && cryptoCurrency === CryptoCurrency.USDT && isTron) {
				const rPCTransportService = new RPCTransportService();

				transaction = await rPCTransportService.createUsdtTransactionFromTron({ to: params.to, value: amount });

				console.log(transaction);
			}

			if (isAmountBiggerThenFrontier === false && isInner === false && cryptoCurrency === CryptoCurrency.BTC) {
				const rPCTransportService = new RPCTransportService();

				transaction = await rPCTransportService.transactionBuilder({ to: params.to, value: amount });

				console.log('transaction successfuly broadcasted with hash: ', transaction);
			}

			const doc = await Wallet.findByIdAndUpdate(id, { amount: newAmount }, { new: true }).exec();

			if (!doc) {
				throw new Error(ERRORS.WALLET_NOT_FOUND);
			}

			await cryptoTransactionService.update({ id: cryptoTransactionId, status: Status.Success });

			await session.commitTransaction();
			session.endSession();

			return { ...doc, transaction };
		} catch (e) {
			await session.abortTransaction();
			session.endSession();
			await cryptoTransactionService.update({ id, status: Status.Failed });
			throw new Error(e);
		}
	}

	async transfer(params: ITransfer): Promise<void> {
		const { owner, customerId, cryptoCurrency, amount, type, commission } = params;
		const ownerWalletDoc = await Wallet.findOne({ userId: owner, cryptoCurrency }).exec();

		if (!ownerWalletDoc) {
			throw new Error(ERRORS.WALLET_NOT_FOUND);
		}

		const { id } = ownerWalletDoc;

		// if (type === ExchangeType.Sell) {
		// 	await Validator.isAmountForTransfer({ id, amount });
		// }

		const customerWalletDoc = await Wallet.findOne({ userId: customerId, cryptoCurrency }).exec();

		if (!customerWalletDoc) {
			throw new Error(ERRORS.WALLET_NOT_FOUND);
		}

		const { id: customerWalletId, userId } = customerWalletDoc;

		// if (type === ExchangeType.Buy) {
		// 	await Validator.isAmountForTransfer({ id: customerWalletId, amount });
		// }

		const cryptoTransactionService = new CryptoTransactionService();
		const session = await Wallet.startSession();

		session.startTransaction();

		try {
			const cryptoTransactionData = {
				userId: owner,
				recipientId: userId,
				transactionType: TransactionType.Transfer,
				cryptoCurrency,
				amount,
				status: Status.Start
			};

			const { id: cryptoId } = await cryptoTransactionService.create(cryptoTransactionData);

			// const advertService = new AdvertService();

			if (type === ExchangeType.Sell) {
				const amountWithCommission = parseFloat((Number(amount) + (amount * commission)).toFixed(8));

				await this.withdraw({ id, amount: amountWithCommission, userId: owner });
				await this.deposit({ id: customerWalletId, amount: amount, userId });
				await this.unholdCryptoCurrency({ userId: owner, cryptoCurrency, unhold: amountWithCommission });
				// await advertService.updateMaxLimit({ id: advertId, soldAmount: amount });
			} else {
				const amountWithCommission = parseFloat((Number(amount) - (amount * commission)).toFixed(8));
				const ownerUnhold = parseFloat((Number(amount) * Number(commission)).toFixed(8));

				await this.withdraw({ id: customerWalletId, amount, userId: customerId });
				await this.deposit({ id, amount: amountWithCommission, userId: owner });
				await this.unholdCryptoCurrency({ userId: customerId, cryptoCurrency, unhold: amount });
				await this.unholdCryptoCurrency({ userId: owner, cryptoCurrency, unhold: ownerUnhold });
				// await advertService.updateMaxLimit({ id: advertId, soldAmount: amount });
			}

			const currencyTransportService = new CurrencyTransportService();
			const userProfileService = new UserProfileService();
			const cryptoFiatPrices = await currencyTransportService.getPrices();

			for (const cryptoFiatPrice of cryptoFiatPrices) {
				if (cryptoFiatPrice.currencyType === cryptoCurrency) {
					const privatePrices = await currencyTransportService.getPrivatPrices();

					if (cryptoCurrency === CryptoCurrency.BTC) {
						const usdToBTC = cryptoFiatPrice.exchangeRate * Number(privatePrices.RURUAH.buy) / Number(privatePrices.USDUAH.buy);

						const usdAmountInTransaction = usdToBTC * amount;

						await userProfileService.update({ userId: owner, summInTransactions: usdAmountInTransaction });
						await userProfileService.update({ userId: customerId, summInTransactions: usdAmountInTransaction });
					}

					if (cryptoCurrency === CryptoCurrency.ETH) {
						const usdToETH = cryptoFiatPrice.exchangeRate * Number(privatePrices.RURUAH.buy) / Number(privatePrices.USDUAH.buy);
						const usdAmountInTransaction = usdToETH * amount;

						await userProfileService.update({ userId: owner, summInTransactions: usdAmountInTransaction });
						await userProfileService.update({ userId: customerId, summInTransactions: usdAmountInTransaction });
					}

					if (cryptoCurrency === CryptoCurrency.USDT) {
						const usdToETH = cryptoFiatPrice.exchangeRate * Number(privatePrices.RURUAH.buy) / Number(privatePrices.USDUAH.buy);
						const usdAmountInTransaction = usdToETH * amount;

						await userProfileService.update({ userId: owner, summInTransactions: usdAmountInTransaction });
						await userProfileService.update({ userId: customerId, summInTransactions: usdAmountInTransaction });
					}
				}
			}

			await cryptoTransactionService.update({ id: cryptoId, status: Status.Success });

			await session.commitTransaction();
			session.endSession();
		} catch (e) {
			await session.abortTransaction();
			session.endSession();
			await cryptoTransactionService.update({ id, status: Status.Failed });

			throw new Error(e);
		}
	}
}
