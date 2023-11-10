import dotenv from 'dotenv';
import { CryptoCurrency } from '../common/interface';
import { UserService } from '../services/user/service';
import { IDocument } from '../services/user/interface';
import { Crypto } from './crypto';
import { CurrencyTransportService } from '../binance/currency-transport';
import { CommissionService } from '../services/commission/service';
import { TransportService } from './transport';
import { FileManager } from './file-manager';

dotenv.config();

export class DefaultService {
	async setDefault(): Promise<IDocument> {
		const password = process.env.ADMIN_DEFAULT_PASSWORD;
		const email = process.env.ADMIN_DEFAULT_EMAIL;
		const name = process.env.ADMIN_DEFAULT_NAME;
		const secondName = process.env.ADMIN_DEFAULT_SECONDNAME;

		const userService = new UserService();
		const user = await userService.findOne(email);

		if (user) {
			return;
		}

		const crypto = new Crypto();
		const passwordHash = await crypto.createHash(password);

		const adminData = {
			email,
			name,
			secondName,
			passwordHash
		};

		const doc = await userService.createAdmin(adminData);

		return doc as IDocument;
	}

	async setDefaultFiatPrices(): Promise<void> {
		const currencyTransportService = new CurrencyTransportService();

		await currencyTransportService.updateFiatCurrency();
	}

	async setDefaultCommissions(): Promise<void> {
		const commissionService = new CommissionService();
		const commissions = await commissionService.list();

		if (commissions.length < 2) {
			for (const cryptoCurrency of Object.values(CryptoCurrency)) {
				await commissionService.create({ cryptoCurrency, commission: 0 });
			}
		}
	}

	async createUSDTfileABI(): Promise<any> {
		const transportService = new TransportService();
		const url = process.env.ETHERSCAN_USDT_CONTRACT_ABI_URL;

		const response = await transportService.getRequest({ url });
		const { ABI } = response[0];

		const fileManager = new FileManager();

		await fileManager.createABIFile(`${__dirname}/../../src/common/json/${'usdt-abi.json'}`, ABI);
		return ABI;
	}
}
