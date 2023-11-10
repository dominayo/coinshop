import { ERRORS } from '../../common/errors';
import { IIsExists, IIsOwner, IIsAmount, isAmountForWidthraw, IIsAmountForUpdate, IIsAmountForActivate,
	 IIsAmountForCreateDealWithBuyType } from './interface';
import { WalletService } from './service';
import { CommissionService } from '../commission/service';
import { ExchangeType } from '../../common/interface';

export class Validator {
	public static async isExists(params: IIsExists): Promise<void> {
		const walletService = new WalletService();

		const doc = await walletService.findById(params);

		if (!doc) {
			throw new Error(ERRORS.WALLET_NOT_FOUND);
		}
	}

	public static async isOwner(params: IIsOwner): Promise<void> {
		const walletService = new WalletService();
		const { id, userId } = params;

		const doc = await walletService.findById({ id });

		if (doc?.userId !== userId) {
			throw new Error(ERRORS.WALLET_NOT_OWNER);
		}
	}

	public static async isAmount(params: IIsAmount): Promise<void> {
		const walletService = new WalletService();
		const { id, amount } = params;

		const doc = await walletService.findById({ id });

		const { hold } = doc;
		const commissionService = new CommissionService();
		const commissionDoc = await commissionService.findOne({ cryptoCurrency: doc.cryptoCurrency });

		const freeAmount = parseFloat((Number(doc.amount) - Number(hold)).toFixed(8));

		if (freeAmount < amount || doc.amount === 0) {
			throw new Error(ERRORS.CURRENCY_NOT_ENOUGH);
		}

		const amountWithCommission = parseFloat((Number(amount) + Number(amount * commissionDoc.commission)).toFixed(8));
		// TODO please change it to commission in advert doc

		if (amountWithCommission > freeAmount) {
			throw new Error(ERRORS.CURRENCY_NOT_ENOUGH);
		}
	}

	public static async isAmountForCreateDealWithBuyType(params: IIsAmountForCreateDealWithBuyType): Promise<void> {
		const walletService = new WalletService();
		const { id, amount } = params;

		const doc = await walletService.findById({ id });

		const { hold } = doc;

		const freeAmount = parseFloat((Number(doc.amount) - Number(hold)).toFixed(8));

		if (freeAmount < amount) {
			throw new Error(ERRORS.CURRENCY_NOT_ENOUGH);
		}
	}

	public static async isAmountForUpdate(params: IIsAmountForUpdate): Promise<void> {
		const { commission, walletId, oldMaxLimit, newMaxLimit, type } = params;

		const walletService = new WalletService();
		const { amount, hold } = await walletService.findById({ id: walletId });

		const freeAmount = parseFloat((Number(amount) - Number(hold)).toFixed(8));

		let oldMaxLimitWithCommission: number;
		let newMaxLimitWithCommission: number;

		if (type === ExchangeType.Sell) {
			oldMaxLimitWithCommission = parseFloat(((oldMaxLimit * commission) + oldMaxLimit).toFixed(8));
			newMaxLimitWithCommission = parseFloat(((Number(newMaxLimit) * commission) + Number(newMaxLimit)).toFixed(8));
		} else {
			// eslint-disable-next-line no-unused-vars
			oldMaxLimitWithCommission = parseFloat((Number(oldMaxLimit) * commission).toFixed(8));
			newMaxLimitWithCommission = parseFloat((Number(newMaxLimit) * commission).toFixed(8));
		}

		const maxLimitDifference = parseFloat((newMaxLimitWithCommission - oldMaxLimitWithCommission).toFixed(8));

		if (maxLimitDifference > freeAmount) {
			throw new Error(ERRORS.CURRENCY_NOT_ENOUGH);
		}
	}

	public static async isAmountForActivate(params: IIsAmountForActivate): Promise<void> {
		const { commission, maxLimit, walletId, type } = params;

		const walletService = new WalletService();
		const { amount, hold } = await walletService.findById({ id: walletId });
		const freeAmount = parseFloat((Number(amount) - Number(hold)).toFixed(8));

		let maxLimitWithCommission: number;

		if (type === ExchangeType.Sell) {
			maxLimitWithCommission = parseFloat(((Number(commission) * Number(maxLimit)) + Number(maxLimit)).toFixed(8));
		} else {
			maxLimitWithCommission = parseFloat((Number(commission) * Number(maxLimit)).toFixed(8));
		}

		if (freeAmount < maxLimitWithCommission) {
			throw new Error(ERRORS.CURRENCY_NOT_ENOUGH);
		}
	}

	public static async isAmountForWidthraw(params: isAmountForWidthraw): Promise<void> {
		const walletService = new WalletService();
		const { id, amount } = params;

		const doc = await walletService.findById({ id });

		const { hold } = doc;
		// const commissionService = new CommissionService(); // TODO please add widthraw commission
		// const commissionDoc = await commissionService.findOne({ cryptoCurrency: doc.cryptoCurrency });
		const freeAmount = parseFloat((Number(doc.amount) - Number(hold)).toFixed(8));

		if (freeAmount < amount || doc.amount === 0) {
			throw new Error(ERRORS.CURRENCY_NOT_ENOUGH);
		}
	}

	public static async isAmountForTransfer(params: IIsAmount): Promise<void> { // TODO commented in walletService transfer
		const { id, amount } = params;
		const walletService = new WalletService();

		const doc = await walletService.findById({ id });

		const commissionService = new CommissionService();
		const commissionDoc = await commissionService.findOne({ cryptoCurrency: doc.cryptoCurrency });

		const amountWithCommission = parseFloat((Number(amount) + Number(amount * commissionDoc.commission)).toFixed(8));

		if (amountWithCommission > doc.amount) {
			throw new Error(ERRORS.CURRENCY_NOT_ENOUGH);
		}
	}
}

export default Validator;
