import { DashboardNotification } from './model';
import { ICreateParams, IUpdateParams, IUpdateByChatIdParams, IDelete, IDocument } from './interface';

export class NotificationDashboardService {
	async create(params: ICreateParams): Promise<IDocument> {
		const doc = await DashboardNotification.create(params);

		return doc as IDocument;
	}

	async list(): Promise<IDocument[]> {
		const docs = await DashboardNotification.find({}).exec();

		return docs as IDocument[];
	}

	async update(params: IUpdateParams): Promise<IDocument> {
		const { id } = params;
		const doc = await DashboardNotification.findByIdAndUpdate(id, { isRead: true }, { new: true }).exec();

		return doc as IDocument;
	}

	async updateByChatId(params: IUpdateByChatIdParams): Promise<IDocument> {
		const { chatId } = params;
		const doc = await DashboardNotification.findOneAndUpdate({ chatDisputeId: chatId}, { isRead: true }, { new: true }).exec();

		return doc as IDocument;
	}

	async delete(params: IDelete): Promise<void> {
		const { id } = params;

		await DashboardNotification.findOneAndDelete({ chatDisputeId: id }).exec();
	}
}
