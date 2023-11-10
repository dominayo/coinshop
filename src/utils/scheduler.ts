import schedule from 'node-schedule';
import dotenv from 'dotenv';
import { CurrencyTransportService } from '../binance/currency-transport';
import { CryptoCurrencyService } from '../services/crypto-currency/service';
import { AdvertService } from '../services/advert/service';
import { RPCTransportService } from '../transports/rpc/service';
import { DealService } from '../services/deal/service';

dotenv.config();

export class ScheduleService {
	private readonly binanceUpdateTimer = new schedule.Range(0, 60, 60);
	private readonly ethUpdateNewBlockTimer = new schedule.Range(0, 60, 5);
	private readonly ethUpdateNewBlocksTimer = new schedule.Range(0, 60, 5);
	private readonly ethUpdateTransactionsTimer = new schedule.Range(0, 60, 60);
	// private readonly btcUpdateTransactionsTimer = new schedule.Range(0, 60, 120);
	private readonly btcUpdateTransactionsTimer = '*/5 * * * *';
	private readonly dealExpiresUpdateTimer = new schedule.Range(0, 60, 60);
	private readonly rpcTransportService = new RPCTransportService();

	async updateBinance(): Promise<any> {
		// const rule = new schedule.RecurrenceRule();
		const rule = '42 * * * *';

		// rule.second = [this.binanceUpdateTimer];

		return schedule.scheduleJob(rule, async () => {
			const currencyTransportService = new CurrencyTransportService();
			const prices = await currencyTransportService.getPrices();
			const cryptoCurrencyService = new CryptoCurrencyService();
			const advertService = new AdvertService();

			for (const price of prices) {
				await cryptoCurrencyService.findOneAndUpdate(price);
				await advertService.updateManyExchangeRate({ cryptoCurrency: price.currencyType, exchangeRate: price.exchangeRate });
			}

			return prices;
		});
	}

	async updateFiatPrice(): Promise<any> {
		return schedule.scheduleJob(process.env.FIAT_UPDATE_TIMER, async () => {
			const currencyTransportService = new CurrencyTransportService();

			await currencyTransportService.updateFiatCurrency();
		});
	}

	async updateUsersWallets(): Promise<any> {
		try {
			const rule = new schedule.RecurrenceRule();

			rule.second = [this.ethUpdateTransactionsTimer];
			return schedule.scheduleJob(rule, async () => {
				const rPCTransportService = new RPCTransportService();

				// await rPCTransportService.getUserEthTransactions();
				await rPCTransportService.getEthBlockFilterChanges();

			});
		} catch (e) {
			throw new Error(e);
		}
	}

	async updateExpiredDeals(): Promise<any> {
		try {
			const rule = new schedule.RecurrenceRule();

			rule.second = [this.dealExpiresUpdateTimer];
			schedule.scheduleJob(rule, async () => {
				const dealService = new DealService();

				// await userService.updateUserRating()
				await dealService.updateExpiresMany();

			});
		} catch (e) {
			throw new Error(e);
		}
	}

	async getBTCWalletValue(): Promise<any> {
		try {
			// const rule = new schedule.RecurrenceRule();

			// rule.second = [this.btcUpdateTransactionsTimer];
			schedule.scheduleJob(this.btcUpdateTransactionsTimer, async () => {
				await this.rpcTransportService.updateBTCWalletBalance();
			});
		} catch (e) {
			throw new Error(e);
		}
	}

	// async getNewEthBlock(): Promise<any> {
	// 	try {
	// 		const rule = new schedule.RecurrenceRule();

	// 		rule.minute = [this.ethUpdateNewBlockTimer];
	// 		return schedule.scheduleJob(rule, async () => {
	// 			const rPCTransportService = new RPCTransportService();

	// 			const block = await rPCTransportService.getEthNewBlockFilter();

	// 			const cryptoCurrencyBlockService = new CryptoCurrencyBlockService();

	// 			await cryptoCurrencyBlockService.upsertCurrentBlock({ cryptoCurrency: CryptoCurrency.ETH, block });
	// 		});
	// 	} catch (e) {
	// 		throw new Error(e);
	// 	}
	// }

	// async getEthNewBlocks(): Promise<any> {
	// 	try {
	// 		const rule = new schedule.RecurrenceRule();

	// 		rule.second = [this.ethUpdateNewBlocksTimer];
	// 		return schedule.scheduleJob(rule, async () => {

	// 			const isBlockExists = await Validator.isBlockExists({ cryptoCurrency: CryptoCurrency.ETH });

	// 			let doc;

	// 			if (!isBlockExists) {
	// 				doc = await this.getNewEthBlock();
	// 			} else {
	// 				const cryptoCurrencyBlockService = new CryptoCurrencyBlockService();

	// 				doc = await cryptoCurrencyBlockService.findCurrentBlock({ cryptoCurrency: CryptoCurrency.ETH });
	// 			}

	// 			const { block } = doc;
	// 			const rPCTransportService = new RPCTransportService();

	// 			let blocks = await rPCTransportService.getEthBlockFilterChanges(block);

	// 			if (!blocks) {
	// 				const rPCTransportService = new RPCTransportService();

	// 				const newBlock = await rPCTransportService.getEthNewBlockFilter();

	// 				const cryptoCurrencyBlockService = new CryptoCurrencyBlockService();

	// 				doc = await cryptoCurrencyBlockService.upsertCurrentBlock({ cryptoCurrency: CryptoCurrency.ETH,  block: newBlock });
	// 				blocks = await rPCTransportService.getEthBlockFilterChanges(newBlock);
	// 			}

	// 			await this.getTransactions(blocks);
	// 		});
	// 	} catch (e) {
	// 		throw new Error(e);
	// 	}
	// }

	// async getTransactions(blocks: string[]): Promise<any> {
	// 	const rPCTransportService = new RPCTransportService();
	// 	const walletService = new WalletService();

	// 	for (const block of blocks) {
	// 		const transactionsResponse = await rPCTransportService.getEthBlockByHash({ block });

	// 		const { result } = transactionsResponse.data;

	// 		logger.info(result.to);
	// 		const isUpdated = await walletService.checkIsExistsAndAdjunct({ to: result.to, value: result.value });

	// 		// await this.getTransactionsDetails(transactionsResponse.result.transactions);
	// 	}
	// }
}

