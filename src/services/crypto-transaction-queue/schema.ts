import { Schema } from 'mongoose';
import { CryptoCurrency, WalletQueueStatus } from '../../common/interface';

export const CryptoTransactionQueueSchema : Schema = new Schema({
	userId: String,
	wallet: String,
	amount: Number,
	cryptoCurrency: {
		type: String,
		enum: Object.values(CryptoCurrency)
	},
	status: {
		type: String,
		enum: Object.values(WalletQueueStatus),
		default: WalletQueueStatus.Progress
	},
	count: {
		type: Number,
		default: 10
	},
	block: String
}, { timestamps: true });

CryptoTransactionQueueSchema.index({ wallet: 1 });
CryptoTransactionQueueSchema.index({ createdAt: 1 });
CryptoTransactionQueueSchema.index({ updatedAt: 1 });

export default CryptoTransactionQueueSchema;
