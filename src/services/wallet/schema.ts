import { Schema } from 'mongoose';
import { CryptoCurrency } from '../../common/interface';

export const WalletSchema : Schema = new Schema({
	userId: String,
	wallet: String,
	cryptoCurrency: {
		type: String,
		enum: Object.values(CryptoCurrency)
	},
	hold: {
		type: Number,
		default: 0
	},
	amount: Number
}, { timestamps: true });

WalletSchema.index({ userId: 1, cryptoCurrency: 1 }, { unique: true });
WalletSchema.index({ userId: 1 });
WalletSchema.index({ createdAt: 1 });
WalletSchema.index({ updatedAt: 1 });

export default WalletSchema;
