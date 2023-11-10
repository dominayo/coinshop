import { Schema } from 'mongoose';
import { Status } from './interface';
import { ExchangeType } from '../../common/interface';

export const DealSchema : Schema = new Schema({
	type: {
		type: String,
		enum: Object.values(ExchangeType)
	},
	owner: String,
	customerId: String,
	advertId: String,
	amount: Number,
	status: {
		type: String,
		enum: Object.values(Status),
		default: Status.Created
	},
	exchangeRate: Number,
	expiresAt: Date,
	statusHistory: [{
		status: {
			type: String,
			enum: Object.values(Status)
		},
		changedAt: Date
	}],
	comments: String
}, { timestamps: true });

DealSchema.index({ createdAt: 1 });
DealSchema.index({ updatedAt: 1 });

export default DealSchema;
