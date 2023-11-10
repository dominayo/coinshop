import { UserWebSocketConnection } from './model';
import { ICreate, IUpsert, IDeleteConnection, IGetUserConnectionList, IDocument } from './interface';
import { UserRoles } from '../../common/interface';
import { UserService } from '../user/service';

export class UserWebSocketConnections {
	async create(params: ICreate): Promise<IDocument> {
		const { userId, connection } = params;
		const userService = new UserService();
		const { role } = await userService.findById(userId);
		const doc = await UserWebSocketConnection.create({ userId, role, connections: [connection] });

		return doc as IDocument;
	}

	async upsert(params: IUpsert): Promise<IDocument> {
		const { userId, connection } = params;
		const userService = new UserService();
		const { role } = await userService.findById(userId);
		const doc = await UserWebSocketConnection.findOneAndUpdate(
			{ userId, role }, { $push: { connections: connection } }, { upsert: true }).exec();

		return doc as IDocument;
	}

	async deleteConnection(params: IDeleteConnection): Promise<IDocument> {
		const { userId, connection } = params;
		const doc = await UserWebSocketConnection.findOneAndUpdate({ userId }, { $pull: { connections: connection }}).exec();

		return doc as IDocument;
	}

	async getUserConnectionList(params: IGetUserConnectionList): Promise<IDocument> {
		const { userId } = params;
		const docs = await UserWebSocketConnection.findOne({ userId }).exec();

		return docs as IDocument;
	}

	async getAdminConnectionList(): Promise<IDocument[]> {
		const docs = await UserWebSocketConnection.find({ role: { $in: [UserRoles.Admin, UserRoles.Support] } }).exec();

		return docs as IDocument[];
	}
}
