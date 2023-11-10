import { Schema } from 'mongoose';
import { CryptoCurrency, Direction } from '../../common/interface';

export const AdvertSchema : Schema = new Schema({
	owner: String,
	type: String,
	cryptoCurrency: {
		type: String,
		enum: Object.values(CryptoCurrency)
	},
	direction: {
		type: String,
		enum: Object.values(Direction)
	},
	isFixedRate: Boolean,
	spread: Number,
	exchangeRate: Number,
	minLimit: Number,
	maxLimit: Number,
	comments: String,
	commission: Number,
	isActive: {
		type: Boolean,
		default: true
	},
	newExchangeRate: Number
}, { timestamps: true });

AdvertSchema.index({ cryptoCurrency: 1, isFixedRate: 1 });
AdvertSchema.index({ createdAt: 1 });
AdvertSchema.index({ updatedAt: 1 });

export default AdvertSchema;
