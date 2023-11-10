import { Document } from 'mongoose';
import { ICreatedUpdated } from '../../common/interface';

export interface IWSConnection {
	userId: string;
	connections: string[];
}

export interface ICreate {
	userId: string;
	connection: string;
}

export interface IUpsert {
	userId: string;
	connection: string;
}

export interface IDeleteConnection {
	userId: string;
	connection: string;
}

export interface IGetUserConnectionList {
	userId: string;
}

export interface IDocument extends IWSConnection, ICreatedUpdated, Document {}
