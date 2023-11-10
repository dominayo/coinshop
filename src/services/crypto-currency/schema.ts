import { Schema } from 'mongoose';
import { CryptoCurrency } from '../../common/interface';

export const CryptoCurrencySchema : Schema = new Schema({
	currencyType: {
		type: String,
		enum: Object.values(CryptoCurrency),
		index: true,
		unique: true
	},
	exchangeRate: Number
}, { timestamps: true });

CryptoCurrencySchema.index({ currencyType: 1 }, { unique: true });
CryptoCurrencySchema.index({ createdAt: 1 });
CryptoCurrencySchema.index({ updatedAt: 1 });

export default CryptoCurrencySchema;
