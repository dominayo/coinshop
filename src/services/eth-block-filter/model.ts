import { model } from 'mongoose';
import { ILastBlockFilter, IDocument } from './interface';
import EthBlockFilterSchema from './schema';

const Model = model<IDocument>(
	'EthBlockFilter', EthBlockFilterSchema, 'eth-block-filters'
);

export class EthBlockFilter extends Model implements ILastBlockFilter {}
