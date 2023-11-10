/* eslint-disable no-useless-escape */
import { IParseWallets, ICreateMany, IGetFreeWalletAndBookParams, IDocument } from './interface';
import { CryptoCurrency } from '../../common/interface';
import { CryptoWallet } from './model';
import ERRORS from '../../common/errors';

export class CryptoWalletService {
	private splitRules = /\s(?=(\n|\r|))/;
	// private matchBTCRules = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/; TODO uncomment this while production
	// private matchETHRules = /^0x[a-fA-F0-9]{40}$/;

	async createMany(params: ICreateMany[]): Promise<any> {
		const data = [];

		const oldWallets = await (await CryptoWallet.find({}).exec())
			.map((walletDoc: IDocument) => {
				return walletDoc.wallet;
			});

		const filteredParams = params
			.filter((walletData: ICreateMany) => {
				return !oldWallets.includes(walletData.wallet);
			});

		for (const walletParams of filteredParams) {
			data.push({ cryptoCurrency: walletParams.cryptoCurrency, wallet: walletParams.wallet, isBooked: false });
		}

		const docs = await CryptoWallet.insertMany(data);

		return docs;
	}

	async list(): Promise<IDocument[]> {
		return await CryptoWallet.find({}).exec();
	}

	async getFreeWallet(params: IGetFreeWalletAndBookParams): Promise<IDocument> {
		const { cryptoCurrency } = params;

		return await CryptoWallet.findOneAndUpdate(
			{ cryptoCurrency, isBooked: false }, { isBooked: true }, { new: true }).exec();
	}

	async getFreeWallets(): Promise<IDocument[]> {
		const btcWallet = await CryptoWallet.findOneAndUpdate(
			{ cryptoCurrency: CryptoCurrency.BTC, isBooked: false }, { isBooked: true }, { new: true }).exec();
		const ethWallet = await CryptoWallet.findOneAndUpdate(
			{ cryptoCurrency: CryptoCurrency.ETH, isBooked: false }, { isBooked: true }, { new: true }).exec();

		if (!btcWallet || !ethWallet) {
			throw new Error(ERRORS.CRYPTO_WALLETS_NOT_ENOUGH);
		}

		const usdtWallet = {};

		Object.assign(usdtWallet, { wallet: ethWallet.wallet }, { cryptoCurrency: CryptoCurrency.USDT });

		return [btcWallet, ethWallet, usdtWallet] as unknown as IDocument[];
	}

	async freeCount(): Promise<number> {
		const count = await CryptoWallet.find({ isBooked: false }).count().exec();

		return count;
	}

	async count(): Promise<number> {
		const count = await CryptoWallet.find({}).count().exec();

		return count;
	}

	async parseWallets(params: IParseWallets): Promise<any> {
		const { text, cryptoCurrency } = params;
		const wallets: string[] = text.split(this.splitRules)
			.filter((item) => {
				return item !== '' && item !== '\n';
			});

		const parsedWallets = [];

		if (cryptoCurrency === CryptoCurrency.BTC) {
			for (const wallet of wallets) {
				// const parsedWallet = wallet.match(this.matchBTCRules);

				if (wallet) {
					parsedWallets.push({ wallet: wallet, cryptoCurrency });
				}
			}
		}

		if (cryptoCurrency === CryptoCurrency.ETH) {
			for (const wallet of wallets) {
				// const parsedWallet = wallet.match(this.matchETHRules);

				if (wallet) {
					parsedWallets.push({ wallet, cryptoCurrency });
				}
			}
		}

		return parsedWallets;
	}
}
