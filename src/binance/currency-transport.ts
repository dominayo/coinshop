import axios from 'axios';
import dotenv from 'dotenv';
import { ERRORS } from '../common/errors';
import { IBinance, ICryptoCurrency, IPrivatRatio, ICurrencyPrices,
	Direction, Ratio, IPrivatePrices, IIsAmountBiggerThenFrontier } from './interface';
import { FiatCurrencyService } from '../services/fiat-currency/service';
import { logger } from '../utils/logger';

dotenv.config();

export class CurrencyTransportService {
	async getBinancePrices(): Promise<ICryptoCurrency[]> {
		try {
			const { data: DTO }: IBinance = await axios.get(process.env.BINANCE_URL);

			const data: ICryptoCurrency[] = DTO.filter((cryptoCurrency) => {
				if (cryptoCurrency.symbol === Direction.BTCUSDT ||
					cryptoCurrency.symbol === Direction.ETHBTC) {

					return cryptoCurrency;
				}
			});

			return data;
		} catch (e) {
			logger.error(ERRORS.BAD_BINANCE_RESPONSE);
			return;
		}
	}

	async updateFiatCurrency(): Promise<void> {
		try {
			const { data: DTO }: IPrivatRatio = await axios.get(process.env.PRIVATBANK_URL);
			const fiatCurrencyService = new FiatCurrencyService();

			for (const fiatCurrency of DTO) {
				await fiatCurrencyService.upsert(fiatCurrency);
			}
		} catch (e) {
			logger.error(ERRORS.BAD_PRIVAT_RESPONSE);
			return;
		}
	}

	async getPrivatPrices(): Promise<IPrivatePrices> {
		const fiatCurrencyService = new FiatCurrencyService();
		const docs = await fiatCurrencyService.list();

		const res = {};

		for (const privatRatio of docs) {
			if (privatRatio.ccy === Ratio.BTC) {
				Object.assign(res, { BTCUSD: privatRatio });
			}

			if (privatRatio.ccy === Ratio.USD) {
				Object.assign(res, { USDUAH: privatRatio });
			}

			if (privatRatio.ccy === Ratio.RUR) {
				Object.assign(res, { RURUAH: privatRatio });
			}
		}

		return res as unknown as IPrivatePrices;

	}

	async getPrices(): Promise<ICurrencyPrices[]> {
		const privatPrices = await this.getPrivatPrices();
		const binancePrices = await this.getBinancePrices();
		const ETHBTC = binancePrices.find((item) => {
			if (item.symbol === 'ETHBTC') {
				return item.price as unknown as ICryptoCurrency;
			}
		});

		const BTCUSDT = binancePrices.find((item) => {
			if (item.symbol === 'BTCUSDT') {
				return item.price as unknown as ICryptoCurrency;
			}
		});

		const data = [];

		// const USDToRURSale = privatPrices.USDToUAH.sale / privatPrices.RURToUAH.sale; // usd to uah / rur to uah
		// const RURToBTCSale = USDToRURSale *  privatPrices.BTCToUSD.sale; // USD * 46155.0237
		const USDRURBuy = privatPrices.USDUAH.buy / privatPrices.RURUAH.buy; // usd to uah / rur to uah
		// const RURBTC = USDRURBuy * privatPrices.BTCUSD.buy; // USD * 46155.0237
		const RURBTC = parseFloat((USDRURBuy * BTCUSDT.price).toFixed(2)); // USD * 46155.0237

		const RURETH = parseFloat((Number(RURBTC) * ETHBTC.price).toFixed(2));
		const RURUSDT = parseFloat((Number(RURBTC) / BTCUSDT.price).toFixed(2));

		data.push({ currencyType: 'BTC', exchangeRate: RURBTC });
		data.push({ currencyType: 'ETH', exchangeRate: RURETH });
		data.push({ currencyType: 'USDT', exchangeRate: RURUSDT });

		return data as ICurrencyPrices[];
	}

	async isAmountBiggerThenFrontier(params: IIsAmountBiggerThenFrontier): Promise<boolean> {
		const { amount, cryptoCurrency } = params;
		const currencyRates = await this.getPrices();

		for (const currencyRate of currencyRates) {
			if (currencyRate.currencyType === cryptoCurrency && parseFloat((Number(amount) * currencyRate.exchangeRate).toFixed(2)) > 300) {
				return true;
			}
		}

		return false;
	}
}
