/* eslint-disable camelcase */
import { Schema } from 'mongoose';
import { Ratio } from '../../binance/interface';

export const FiatCurrencySchema : Schema = new Schema({
	ccy: {
		type: String,
		enum: Object.values(Ratio)
	},
	base_ccy: {
		type: String,
		enum: Object.values(Ratio)
	},
	buy: String,
	sell: String
}, { timestamps: true });

FiatCurrencySchema.index({ createdAt: 1 });
FiatCurrencySchema.index({ updatedAt: 1 });

export default FiatCurrencySchema;
