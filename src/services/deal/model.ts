import { model } from 'mongoose';
import { IDeal, IDocument } from './interface';
import DealSchema from './schema';

const Model = model<IDocument>(
	'Deal', DealSchema, 'deals'
);

export class Deal extends Model implements IDeal {}
