import { ICreatedUpdated } from '../../common/interface';
import { Document } from 'mongoose';

export interface IChat {
	dealId: string;
	owner: string;
	customerId: string;
}

export interface IChatCreate {
	dealId: string;
	owner: string;
	customerId: string;
}

export interface IFindById {
	id: string;
}

export interface IByDealId {
	dealId: string;
}

export interface IIsChatParticipantParams {
	id: string;
	userId: string;
}

export interface IDocument extends IChat, ICreatedUpdated, Document {}

export default IDocument;
