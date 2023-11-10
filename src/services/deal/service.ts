import moment from 'moment';
import { Deal } from './model';
import { IDocument, IDealCreate, IFindById, IDealStatusUpdate, IDealDelete, IIsInDeal,
	IFindByAdvertId, IFindListByUserId, IDealList, Status, IAddDealTime, ICountByParticipantId } from './interface';
import { UserProfileService } from '../user-profile/service';
import { ExchangeType } from '../../common/interface';
import { CommissionService } from '../commission/service';
import { WalletService } from '../wallet/service';
import { AdvertService } from '../advert/service';
import { EmailClient } from '../../clients/mailer';
import { UserService } from '../../services/user/service';

export class DealService {
	async create(params: IDealCreate): Promise<any> {
		const doc = await Deal.create(params);

		return doc;
	}

	async findById(params: IFindById): Promise<any> {
		const { id } = params;
		const doc = await Deal.findById({ _id: id }).exec();

		return doc;
	}

	async findCustomerOrOwner(params: IIsInDeal): Promise<any> {
		const { id } = params;
		const doc = await Deal.findById({ _id: id }).exec();

		return doc;
	}

	async findOpenedByAdvertId(params: IFindByAdvertId): Promise<any> {
		const { advertId } = params;
		const doc = await Deal.find(
			{ advertId, status: { $nin: [Status.Canceled, Status.Closed, Status.Сompleted] } }).exec();

		return doc;
	}

	async findListInDispute(): Promise<any> {
		const docs = await Deal.find({ status: Status.DisputeOpened }).exec();

		return docs;
	}

	async updateStatus(params): Promise<any> {
		const { id, status, statusTiming } = params;
		const doc: any = await Deal.findByIdAndUpdate(id, { status, $push: { statusHistory: statusTiming } }, { new: true }).exec();

		return doc as unknown as any;
	}

	async updateTimer(params: IAddDealTime): Promise<any> {
		const { dealId, statusTiming } = params;
		const { expiresAt } = await Deal.findById(dealId);

		const newExipresAt: any = moment(expiresAt).add(statusTiming, 'minutes');

		return await Deal.findByIdAndUpdate(dealId, { expiresAt: newExipresAt }, { new: true });
	}

	async updateExpiresMany(): Promise<void> {
		const dateNow = moment(new Date());
		const userProfileService = new UserProfileService();

		const dealDocs = await Deal.find({ expiresAt: { $lte: dateNow }, status: { $nin:
			[Status.DisputeOpened, Status.Canceled, Status.Closed, Status.Сompleted] }}).exec();
		const advertService = new AdvertService();
		const commissionService = new CommissionService();
		const walletService = new WalletService();
		const emailClient = new EmailClient();
		const userService = new UserService();

		for (const dealDoc of dealDocs) {
			await userProfileService.update({ userId: dealDoc.owner, canceledDeals: 1 });
			const { status } = await Deal.findById({ _id: dealDoc.id });
			const updatedDoc = await Deal.findByIdAndUpdate({ _id: dealDoc.id }, { status: Status.Canceled,
				$push: { statusHistory: { status: Status.Canceled, changedAt: dateNow } } }, { new: true }).exec();
			const { customerId, advertId, type, amount, owner } = updatedDoc;
			const { commission, cryptoCurrency, _id } = await advertService.findById({ id: advertId });

			const { email: customerEmail } = await userService.findById(customerId);
			const { email: ownerEmail } = await userService.findById(owner);

			await emailClient.send(
				`Сделка отменена, http://coinshop.dev-page.site/user/deals?id=${dealDoc.id}`, customerEmail, 'Сделка отменена');
			await emailClient.send(
				`Сделка отменена, http://coinshop.dev-page.site/user/deals?id=${dealDoc.id}`, ownerEmail, 'Сделка отменена');

			if (type === ExchangeType.Buy && status === Status.Confirmed) {

				// const unhold = await commissionService.calculateAmountWithCommission({ amount, commission, cryptoCurrency });

				await walletService.unholdCryptoCurrency({ userId: customerId, cryptoCurrency, unhold: amount });
				await advertService.addMaxLimit({ id: _id, amount });
			}

			if (type === ExchangeType.Sell && Status.Confirmed) {
				await advertService.addMaxLimit({ id: _id, amount });
			}
		}

		// return await Deal.updateMany(
		// 	{ expiresAt: { $lte: dateNow }, status: {
		// 		$nin: [Status.DisputeOpened, Status.MoneySent, Status.Canceled, Status.Closed, Status.Сompleted, Status.MoneyReceived] }},
		// 	{ status: Status.Closed,
		// 		$push: { statusHistory: { status: Status.Closed, changedAt: dateNow } } }, { new: true }) as unknown as IDocument[];
	}

	async list(params: IDealList): Promise<any> {
		const { skip , limit, ...rest } = params;

		const filter = Object.values(rest).filter((item) => { return item === null; });

		let docs;

		if (filter.length > 0) {
			docs = await Deal.find(rest).skip(skip).sort({ createdAt: -1 }).limit(limit).exec();
		} else {
			docs = await Deal.find({}).skip(skip).sort({ createdAt: -1 }).limit(limit).exec();
		}

		return docs;
	}

	async findListByUserId(params: IFindListByUserId): Promise<any> {
		const { userId, skip, limit, ...rest } = params;

		const filter = Object.values(rest).filter((item) => { return item !== null; });
		let docs;

		if (filter.length > 0) {
			docs = await Deal.find({ $or: [{ owner: userId, ...rest },
				{ customerId: userId, ...rest }] }).sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
		} else {
			docs = await Deal.find({ $or: [{ owner: userId },
				{ customerId: userId }]}).sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
		}

		return docs;
	}

	async delete(params: IDealDelete): Promise<any> {
		const { id } = params;
		const doc = await Deal.findByIdAndDelete({ _id: id }).exec();

		return doc;
	}

	async count(): Promise<number> {
		return await Deal.find({}).count().exec();
	}

	async countByParticipantId(params: ICountByParticipantId): Promise<number> {
		const { userId, ...rest } = params;
		const filter = Object.values(rest).filter((item) => item !== null);

		let count = 0;

		if (filter.length > 0) {
			count = await Deal.find({ $or: [{ owner: userId, ...rest }, { customerId: userId, ...rest }] }).countDocuments().exec();
		} else {
			count = await Deal.find({ $or: [{ owner: userId }, { customerId: userId }] }).countDocuments().exec();
		}

		return count;
	}
}
