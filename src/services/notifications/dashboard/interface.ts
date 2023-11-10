import { Document } from 'mongoose';
import { ICreatedUpdated } from '../../../common/interface';

export interface IDashboardNotifications {
	chatDisputeId: string;
	isRead: boolean;
}

export interface ICreateParams {
	chatDisputeId: string;
}

export interface IUpdateParams {
	id: string;
}

export interface IUpdateByChatIdParams {
	chatId: string;
}

export interface IDelete {
	id: string;
}

export interface IDocument extends IDashboardNotifications, Document, ICreatedUpdated {}
