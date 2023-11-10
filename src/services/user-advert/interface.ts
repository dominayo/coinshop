import { Document } from 'mongoose';
import { ICreatedUpdated } from '../../common/interface';

export interface IUserAdvert {
	userId: string;
	advertId: string;
}

export interface IUserAdvertCreate {
	userId: string;
	advertId: string;
}

export interface IUserAdvertUpdate {
	id: string;
	userId: string;
	advertId: string;
}

export interface IUserAdvertDelete {
	id: string;
}

export interface IUserAdvertList {
	userId: string;
}

export interface IUserAdvertFindById {
	id: string;
}

export interface IFindAdvert {
	userId?: string;
	advertId?: string;
}

export interface IFindMany {
	advertIds: string[];
}

export interface IDocument extends IUserAdvert, ICreatedUpdated, Document {}
