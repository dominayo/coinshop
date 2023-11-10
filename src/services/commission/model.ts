import { model } from 'mongoose';
import { ICommission, IDocument } from './interface';
import CommissionSchema from './schema';

const Model = model<IDocument>(
	'Commission', CommissionSchema, 'commissions'
);

export class Commission extends Model implements ICommission {}
