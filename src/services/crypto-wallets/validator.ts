import { CryptoWalletService } from './service';

export class Validator {
	public static async isFreeCryptoWalletWalletExists(): Promise<boolean> {
		const cryptoWalletService = new CryptoWalletService();

		const freeDocs = await cryptoWalletService.freeCount();

		if (freeDocs < 10) {
			return false;
		}

		return true;
	}
}
