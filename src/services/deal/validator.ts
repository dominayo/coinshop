import moment from 'moment';
import { ERRORS } from '../../common/errors';
import { ExchangeType } from '../../common/interface';
import { IIsExists, IIsStatusesMatch, IIsNotStatusesMatch, IIsOwner, IIsCusomer, IIsInDeal, IIsStatusesMatchForDispute,
	IIsAmountOfCurrencyLessThenSummInOpenedDeals, Status, IIsExipred, IIsSeller, IIsBuyer, IDocument } from './interface';
import { DealService } from './service';
import { CommissionService } from '../commission/service';
import { WalletService } from '../wallet/service';
import { AdvertService } from '../advert/service';

export class Validator {
	public static async isExists(params: IIsExists): Promise<IDocument> {
		const dealService = new DealService();

		const doc = await dealService.findById(params);

		if (!doc) {
			throw new Error(ERRORS.DEAL_NOT_FOUND);
		}

		return doc as IDocument;
	}

	public static async isStatusMatch(params: IIsStatusesMatch): Promise<void> {
		const dealService = new DealService();

		const doc = await dealService.findById(params);
		const { statuses } = params;

		if (!statuses.includes(doc?.status)) {
			throw new Error(ERRORS.DEAL_BAD_STATUS);
		}
	}

	public static async isStatusMatchForDispute(params: IIsStatusesMatchForDispute): Promise<void> {
		const dealService = new DealService();
		const { id } = params;

		const doc = await dealService.findById({ id });
		const { statuses } = params;

		if (!statuses.includes(doc?.status)) {
			throw new Error(ERRORS.DEAL_BAD_STATUS);
		}
	}

	public static async isNotStatusMatch(params: IIsNotStatusesMatch): Promise<void> {
		const dealService = new DealService();

		const doc = await dealService.findById(params);
		const { statuses } = params;

		if (statuses.includes(doc?.status)) {
			throw new Error(ERRORS.DEAL_BAD_STATUS);
		}
	}

	public static async isOwner(params: IIsOwner): Promise<IDocument> {
		const dealService = new DealService();
		const { dealId, owner } = params;
		const doc = await dealService.findById({ id: dealId });

		if (doc?.owner !== owner) {
			throw new Error(ERRORS.DEAL_NOT_OWNER);
		}

		return doc as IDocument;
	}

	public static async isCustomer(params: IIsCusomer): Promise<void> {
		const dealService = new DealService();
		const { dealId, customerId } = params;

		const doc = await dealService.findById({ id: dealId });

		if (doc?.customerId !== customerId) {
			throw new Error(ERRORS.DEAL_NOT_CUSTOMER);
		}
	}

	public static async isInDeal(params: IIsInDeal): Promise<IDocument> {
		const dealService = new DealService();
		const doc = await dealService.findCustomerOrOwner(params);

		if (!doc) {
			throw new Error(ERRORS.DEAL_NOT_FOUND);
		}

		const { userId } = params;

		if (doc?.owner !== userId && doc?.customerId !== userId) {
			throw new Error(ERRORS.DEAL_NOT_PARTICIPANT);
		}

		return doc as IDocument;
	}

	public static async isSeller(params: IIsSeller): Promise<void> {
		const dealService = new DealService();
		const { userId, dealId } = params;

		const doc = await dealService.findById({ id: dealId });

		if (doc.type === ExchangeType.Sell && doc?.owner === userId || doc.type === ExchangeType.Buy && doc.customerId === userId) {
			return;
		}

		throw new Error(ERRORS.DEAL_NOT_CUSTOMER);
	}

	public static async isBuyer(params: IIsBuyer): Promise<void> {
		const dealService = new DealService();
		const { userId, dealId } = params;

		const doc = await dealService.findById({ id: dealId });

		if (doc.type === ExchangeType.Sell && doc?.customerId === userId || doc.type === ExchangeType.Buy && doc.owner === userId) {
			return;
		}

		throw new Error(ERRORS.DEAL_NOT_CUSTOMER);
	}

	public static async isAmountOfCurrencyLessThenSummInOpenedDeals(params: IIsAmountOfCurrencyLessThenSummInOpenedDeals): Promise<void> {
		const { advertId, amount } = params;
		const dealService = new DealService();
		const docAmounts: number[] = await (await dealService.findOpenedByAdvertId({ advertId }))
			.filter((doc) => {
				if (doc.status === Status.Confirmed || doc.status === Status.MoneySent || doc.status === Status.DisputeOpened) {
					return doc;
				}
			})
			.map((doc) => {
				return doc.amount;
			});
		let summOfAmountInDeals = Number(amount);

		for (const docAmount of docAmounts) {
			summOfAmountInDeals += Number(docAmount);
		}

		const advertService = new AdvertService();
		const { maxLimit } = await advertService.findById({ id: advertId });

		if (summOfAmountInDeals > maxLimit) {
			throw new Error(ERRORS.DEAL_SUMM_IN_OPENED_DEALS_BIGGER_THEN_MAX_LIMIT_IN_ADVERT);
		}
	}

	public static async isExired(params: IIsExipred): Promise<void> {
		const { dealId } = params;
		const dealService = new DealService();

		const { customerId, advertId, amount, expiresAt } = await dealService.findById({ id: dealId });

		if (moment(Date.now()).isAfter(expiresAt)) {
			await dealService.updateStatus(
				{ id: dealId, status: Status.Canceled, statusTiming: { status: Status.Canceled, changedAt: moment(Date.now()) } });
			const advertService = new AdvertService();
			const { cryptoCurrency, commission, type } = await advertService.findById({ id: advertId });

			const commissionService = new CommissionService();
			const unhold = await commissionService.calculateAmountWithCommission({ amount, cryptoCurrency, commission });

			const walletService = new WalletService();

			await advertService.addMaxLimit({ id: advertId, amount });
			await advertService.activate({ id: advertId });

			if (type === ExchangeType.Buy) {
				await walletService.unholdCryptoCurrency({ userId: customerId, cryptoCurrency, unhold });
			}

			throw new Error(ERRORS.DEAL_TIME_EXPIRED);
		}
	}
}

export default Validator;
