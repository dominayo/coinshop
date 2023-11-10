import { Schema } from 'mongoose';
import { CryptoCurrency } from '../../common/interface';

export const CryptoWalletSchema : Schema = new Schema({
	cryptoCurrency: {
		type: String,
		enum: CryptoCurrency
	},
	wallet: String,
	isBooked: {
		type: Boolean,
		default: false
	}
}, { timestamps: true });

CryptoWalletSchema.index({ wallet: 1 }, { unique: true });
CryptoWalletSchema.index({ isBooked: 1 });
CryptoWalletSchema.index({ createdAt: 1 });
CryptoWalletSchema.index({ updatedAt: 1 });

export default CryptoWalletSchema;
