import { Document } from 'mongoose';
import { ICreatedUpdated, UserRoles } from '../../common/interface';

export interface IChatDispute {
	dealId: string;
	creatorId: string;
	participants: [
		{
			userId: string;
			role: UserRoles;
		}
	]
}

export interface ICreate {
	dealId: string;
	creatorId: string;
}

export interface IFindById {
	id: string;
}

export interface IIsChatParticipant {
	id: string;
	userId: string;
}

export interface IIsExists {
	id: string;
}

export interface IListByNotificationIds {
	chatDisputeIds: string[];
}

export interface IFindByDealId {
	dealId: string;
}

export interface IFindByIdAndUpdateParams{
	id: string;
	isActive: boolean;
}

export interface IDocument extends IChatDispute, ICreatedUpdated, Document {}
