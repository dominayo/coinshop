import { ChatDispute } from './model';
import { ICreate, IFindById, IListByNotificationIds, IFindByDealId, IFindByIdAndUpdateParams, IDocument } from './interface';
import { DealService } from '../deal/service';
import { UserService } from '../user/service';

export class ChatDisputeService {
	async create(params: ICreate): Promise<IDocument> {
		const { creatorId } = params;
		const userService = new UserService();
		const { role } = await userService.findById(creatorId);
		const doc = await ChatDispute.create({ ...params, participants: [{ userId: creatorId, role }] });

		return doc as IDocument;
	}

	async list(): Promise<IDocument[]> {
		const dealService = new DealService();
		const dealIds = await (await dealService.findListInDispute())
			.map((dealDoc) => dealDoc._id);
		const docs = await ChatDispute.find({ dealId: { $in: dealIds }, isActive: true }).exec();

		return docs as IDocument[];
	}

	async findById(params: IFindById): Promise<IDocument> {
		const { id } = params;
		const doc = await ChatDispute.findById({ _id: id }).exec();

		return doc as IDocument;
	}

	async findByDealId(params: IFindByDealId): Promise<IDocument> {
		const { dealId } = params;

		return await ChatDispute.findOne({ dealId }).exec();
	}

	async listByNotificationIds(params: IListByNotificationIds): Promise<IDocument[]> {
		const { chatDisputeIds } = params;
		const docs = await ChatDispute.find({ _id: { $in: chatDisputeIds } }).exec();

		return docs as IDocument[];
	}

	async findByIdAndUpdate(params: IFindByIdAndUpdateParams): Promise<IDocument> {
		const { id, ...rest } = params;

		return await ChatDispute.findByIdAndUpdate({ _id: id },
			{ $set: rest }, { new: true }).exec();
	}
}
