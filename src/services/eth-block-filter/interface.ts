import { Document } from 'mongoose';
import { ICreatedUpdated } from '../../common/interface';

export interface ILastBlockFilter {
	filter: string;
}

export interface IUpsert {
	filter: string;
}

export interface IDocument extends ILastBlockFilter, Document, ICreatedUpdated {}
